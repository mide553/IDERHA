package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.DatabaseService;
import com.example.demo.service.ApiKeyService;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/data")
public class ApiDataUploadController {

    @Autowired
    private DatabaseService databaseService;

    @Autowired
    private ApiKeyService apiKeyService;

    /**
     * API endpoint for hospitals to upload SQL data directly
     * POST /api/data/sql
     */
    @PostMapping("/sql")
    public ResponseEntity<Map<String, Object>> uploadSqlData(
            @RequestBody String sqlContent,
            @RequestParam(value = "database", required = false) String database,
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            HttpSession session,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Authenticate user (either via session or API key)
        User currentUser = authenticateRequest(session, apiKey, request);
        if (currentUser == null) {
            response.put("status", "error");
            response.put("message", "Authentication required. Please provide valid credentials or API key.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Determine target database
        String targetDatabase = determineTargetDatabase(currentUser, database);
        if (targetDatabase == null) {
            response.put("status", "error");
            response.put("message", "Unable to determine target database. Please contact administrator.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // Validate database access permissions
        if (!hasAccessToDatabase(currentUser, targetDatabase)) {
            response.put("status", "error");
            response.put("message", "Access denied to database: " + targetDatabase);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // Validate input data
        if (sqlContent == null || sqlContent.trim().isEmpty()) {
            response.put("status", "error");
            response.put("message", "No SQL content provided");
            return ResponseEntity.badRequest().body(response);
        }

        List<Map<String, Object>> executionDetails = new ArrayList<>();
        int executedStatements = 0;
        int totalStatements = 0;
        long startTime = System.currentTimeMillis();

        try {
            // Improved SQL parsing to handle multi-line statements
            List<String> statements = parseSqlStatements(sqlContent);
            totalStatements = statements.size();

            for (String stmt : statements) {
                stmt = stmt.trim();
                if (stmt.isEmpty())
                    continue;

                Map<String, Object> detail = new HashMap<>();

                // Categorize statement type
                String statementType = getStatementType(stmt);
                detail.put("type", statementType);

                // Show abbreviated statement for readability
                String displayStatement = stmt.length() > 100 ? stmt.substring(0, 100) + "..." : stmt;
                detail.put("statement", displayStatement);

                // Add table name extraction
                String tableName = extractTableName(stmt);
                if (tableName != null) {
                    detail.put("table", tableName);
                }

                try {
                    long statementStart = System.currentTimeMillis();
                    databaseService.executeUpdate(stmt, targetDatabase);
                    long statementTime = System.currentTimeMillis() - statementStart;

                    detail.put("success", true);
                    detail.put("result", "Executed successfully");
                    detail.put("executionTimeMs", statementTime);
                    executedStatements++;
                } catch (Exception ex) {
                    detail.put("success", false);
                    detail.put("result", "Error: " + ex.getMessage());
                    detail.put("errorType", ex.getClass().getSimpleName());
                }
                executionDetails.add(detail);
            }

            long totalTime = System.currentTimeMillis() - startTime;

            // Enhanced response with comprehensive details
            response.put("status", executedStatements == totalStatements ? "success" : "partial_success");
            response.put("message",
                    String.format("Processed %d/%d SQL statements successfully", executedStatements, totalStatements));
            response.put("statementsExecuted", executedStatements);
            response.put("totalStatements", totalStatements);
            response.put("failedStatements", totalStatements - executedStatements);
            response.put("successRate",
                    totalStatements > 0 ? Math.round((double) executedStatements / totalStatements * 100) : 0);
            response.put("database", targetDatabase);
            response.put("uploadedBy", currentUser.getEmail());
            response.put("timestamp", new Date().toString());
            response.put("totalExecutionTimeMs", totalTime);

            // Summary by statement type
            Map<String, Integer> typeSummary = new HashMap<>();
            Map<String, Integer> tableSummary = new HashMap<>();

            for (Map<String, Object> detail : executionDetails) {
                String type = (String) detail.get("type");
                String table = (String) detail.get("table");
                Boolean success = (Boolean) detail.get("success");

                if (success) {
                    typeSummary.put(type, typeSummary.getOrDefault(type, 0) + 1);
                    if (table != null) {
                        tableSummary.put(table, tableSummary.getOrDefault(table, 0) + 1);
                    }
                }
            }

            response.put("statementTypeSummary", typeSummary);
            response.put("affectedTables", tableSummary);
            response.put("details", executionDetails);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Processing failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Determine the target database based on user type and optional database
     * parameter
     * For API key users: automatically use their assigned database
     * For session users: require database parameter
     */
    private String determineTargetDatabase(User currentUser, String databaseParam) {
        // If user is authenticated via API key (hospital role), use their assigned
        // database
        if ("hospital".equals(currentUser.getRole()) && currentUser.getAssignedDatabase() != null) {
            return currentUser.getAssignedDatabase();
        }

        // For admin users or session-based auth, use the provided database parameter
        if ("admin".equals(currentUser.getRole()) && databaseParam != null) {
            return databaseParam;
        }

        // Fallback: if hospital user has no assigned database, use parameter
        if (databaseParam != null) {
            return databaseParam;
        }

        return null; // Unable to determine database
    }

    private User authenticateRequest(HttpSession session, String apiKey, HttpServletRequest request) {
        // First try session-based authentication
        User sessionUser = (User) session.getAttribute("user");
        if (sessionUser != null) {
            return sessionUser;
        }

        // Then try API key authentication
        if (apiKey != null && !apiKey.isEmpty()) {
            return apiKeyService.validateApiKey(apiKey);
        }

        return null;
    }

    private boolean hasAccessToDatabase(User user, String database) {
        if ("admin".equals(user.getRole())) {
            return true;
        }

        if ("hospital".equals(user.getRole())) {
            return user.getAssignedDatabase() != null && user.getAssignedDatabase().equals(database);
        }

        return false;
    }

    /**
     * Parse SQL content into individual statements, handling multi-line statements
     * properly
     */
    private List<String> parseSqlStatements(String sqlContent) {
        List<String> statements = new ArrayList<>();

        // Remove single-line comments first
        String[] lines = sqlContent.split("\\r?\\n");
        StringBuilder cleanContent = new StringBuilder();

        for (String line : lines) {
            String trimmedLine = line.trim();
            // Skip pure comment lines
            if (trimmedLine.startsWith("--") || trimmedLine.isEmpty()) {
                continue;
            }

            // Remove inline comments
            int commentIndex = line.indexOf("--");
            if (commentIndex >= 0) {
                line = line.substring(0, commentIndex);
            }

            cleanContent.append(line).append(" ");
        }

        // Split by semicolons
        String[] rawStatements = cleanContent.toString().split(";");

        for (String statement : rawStatements) {
            String trimmed = statement.trim().replaceAll("\\s+", " ");
            if (!trimmed.isEmpty()) {
                statements.add(trimmed);
            }
        }

        return statements;
    }

    /**
     * Determine the type of SQL statement
     */
    private String getStatementType(String statement) {
        String upperStatement = statement.toUpperCase().trim();

        if (upperStatement.startsWith("INSERT")) {
            return "INSERT";
        } else if (upperStatement.startsWith("UPDATE")) {
            return "UPDATE";
        } else if (upperStatement.startsWith("DELETE")) {
            return "DELETE";
        } else if (upperStatement.startsWith("TRUNCATE")) {
            return "TRUNCATE";
        } else if (upperStatement.startsWith("CREATE")) {
            return "CREATE";
        } else if (upperStatement.startsWith("ALTER")) {
            return "ALTER";
        } else if (upperStatement.startsWith("DROP")) {
            return "DROP";
        } else if (upperStatement.startsWith("SELECT")) {
            return "SELECT";
        } else {
            return "OTHER";
        }
    }

    /**
     * Extract table name from SQL statement
     */
    private String extractTableName(String statement) {
        String upperStatement = statement.toUpperCase().trim();

        try {
            if (upperStatement.startsWith("INSERT INTO")) {
                String[] parts = upperStatement.split("\\s+");
                if (parts.length >= 3) {
                    return parts[2].replaceAll("[(),]", "").toLowerCase();
                }
            } else if (upperStatement.startsWith("UPDATE")) {
                String[] parts = upperStatement.split("\\s+");
                if (parts.length >= 2) {
                    return parts[1].replaceAll("[(),]", "").toLowerCase();
                }
            } else if (upperStatement.startsWith("DELETE FROM")) {
                String[] parts = upperStatement.split("\\s+");
                if (parts.length >= 3) {
                    return parts[2].replaceAll("[(),]", "").toLowerCase();
                }
            } else if (upperStatement.startsWith("TRUNCATE TABLE")) {
                String[] parts = upperStatement.split("\\s+");
                if (parts.length >= 3) {
                    return parts[2].replaceAll("[(),]", "").toLowerCase();
                }
            }
        } catch (Exception e) {
            // If extraction fails, return null
        }

        return null;
    }
}