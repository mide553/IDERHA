package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.DatabaseService;
import com.example.demo.service.DataTransformationService;
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
    private DataTransformationService dataTransformationService;

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

    /**
     * API endpoint for hospitals to upload patient data directly via JSON
     * POST /api/data/patients
     */
    @PostMapping("/patients")
    public ResponseEntity<Map<String, Object>> uploadPatients(
            @RequestBody List<Map<String, Object>> patients,
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
        if (patients == null || patients.isEmpty()) {
            response.put("status", "error");
            response.put("message", "No patient data provided");
            return ResponseEntity.badRequest().body(response);
        }

        List<Map<String, Object>> processingResults = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        try {
            for (int i = 0; i < patients.size(); i++) {
                Map<String, Object> patient = patients.get(i);
                Map<String, Object> result = new HashMap<>();
                result.put("index", i);
                result.put("patient_data", patient);

                try {
                    // Transform JSON to SQL INSERT
                    String insertSQL = dataTransformationService.transformPatientToSQL(patient);

                    // Execute the SQL
                    databaseService.executeUpdate(insertSQL, targetDatabase);

                    result.put("status", "success");
                    result.put("message", "Patient data inserted successfully");
                    successCount++;
                } catch (Exception e) {
                    result.put("status", "error");
                    result.put("message", "Failed to insert patient: " + e.getMessage());
                    errorCount++;
                }
                processingResults.add(result);
            }

            response.put("status", "completed");
            response.put("message",
                    String.format("Processing completed. %d successful, %d failed", successCount, errorCount));
            response.put("total_records", patients.size());
            response.put("successful_inserts", successCount);
            response.put("failed_inserts", errorCount);
            response.put("database", targetDatabase);
            response.put("details", processingResults);
            response.put("uploaded_by", currentUser.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Processing failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * API endpoint for uploading condition/diagnosis data
     * POST /api/data/conditions
     */
    @PostMapping("/conditions")
    public ResponseEntity<Map<String, Object>> uploadConditions(
            @RequestBody List<Map<String, Object>> conditions,
            @RequestParam("database") String database,
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            HttpSession session,
            HttpServletRequest request) {
        return processGenericData(conditions, "condition", database, apiKey, session, request);
    }

    /**
     * API endpoint for uploading drug exposure data
     * POST /api/data/drugs
     */
    @PostMapping("/drugs")
    public ResponseEntity<Map<String, Object>> uploadDrugs(
            @RequestBody List<Map<String, Object>> drugs,
            @RequestParam("database") String database,
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            HttpSession session,
            HttpServletRequest request) {
        return processGenericData(drugs, "drug", database, apiKey, session, request);
    }

    /**
     * API endpoint for uploading measurement data
     * POST /api/data/measurements
     */
    @PostMapping("/measurements")
    public ResponseEntity<Map<String, Object>> uploadMeasurements(
            @RequestBody List<Map<String, Object>> measurements,
            @RequestParam("database") String database,
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            HttpSession session,
            HttpServletRequest request) {
        return processGenericData(measurements, "measurement", database, apiKey, session, request);
    }

    /**
     * API endpoint for uploading visit occurrence data
     * POST /api/data/visits
     */
    @PostMapping("/visits")
    public ResponseEntity<Map<String, Object>> uploadVisits(
            @RequestBody List<Map<String, Object>> visits,
            @RequestParam("database") String database,
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            HttpSession session,
            HttpServletRequest request) {
        return processGenericData(visits, "visit", database, apiKey, session, request);
    }

    /**
     * Get API documentation and examples
     * GET /api/data/documentation
     */
    @GetMapping("/documentation")
    public ResponseEntity<Map<String, Object>> getApiDocumentation() {
        Map<String, Object> documentation = new HashMap<>();

        documentation.put("title", "Hospital Data Upload API");
        documentation.put("version", "1.0");
        documentation.put("description", "RESTful API for hospitals to upload patient data directly to IDERHA system");

        // Authentication info
        Map<String, Object> auth = new HashMap<>();
        auth.put("methods", Arrays.asList("Session-based (web login)", "API Key (X-API-Key header)"));
        auth.put("api_key_header", "X-API-Key");
        documentation.put("authentication", auth);

        // Available endpoints
        List<Map<String, Object>> endpoints = new ArrayList<>();

        endpoints.add(createEndpointDoc("POST", "/api/data/sql",
                "Upload SQL data directly (recommended for existing SQL files)", getSqlExample()));
        endpoints.add(createEndpointDoc("POST", "/api/data/patients", "Upload patient demographic data",
                getPatientExample()));
        endpoints.add(createEndpointDoc("POST", "/api/data/conditions", "Upload condition/diagnosis data",
                getConditionExample()));
        endpoints.add(createEndpointDoc("POST", "/api/data/drugs", "Upload drug exposure data", getDrugExample()));
        endpoints.add(createEndpointDoc("POST", "/api/data/measurements", "Upload measurement data",
                getMeasurementExample()));
        endpoints.add(createEndpointDoc("POST", "/api/data/visits", "Upload visit occurrence data", getVisitExample()));

        documentation.put("endpoints", endpoints);

        return ResponseEntity.ok(documentation);
    }

    // Helper methods
    private ResponseEntity<Map<String, Object>> processGenericData(
            List<Map<String, Object>> data,
            String dataType,
            String database,
            String apiKey,
            HttpSession session,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        User currentUser = authenticateRequest(session, apiKey, request);
        if (currentUser == null) {
            response.put("status", "error");
            response.put("message", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (!hasAccessToDatabase(currentUser, database)) {
            response.put("status", "error");
            response.put("message", "Access denied to database: " + database);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if (data == null || data.isEmpty()) {
            response.put("status", "error");
            response.put("message", "No " + dataType + " data provided");
            return ResponseEntity.badRequest().body(response);
        }

        List<Map<String, Object>> processingResults = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        try {
            for (int i = 0; i < data.size(); i++) {
                Map<String, Object> record = data.get(i);
                Map<String, Object> result = new HashMap<>();
                result.put("index", i);

                try {
                    String insertSQL = dataTransformationService.transformDataToSQL(record, dataType);
                    databaseService.executeUpdate(insertSQL, database);

                    result.put("status", "success");
                    result.put("message", dataType + " data inserted successfully");
                    successCount++;
                } catch (Exception e) {
                    result.put("status", "error");
                    result.put("message", "Failed to insert " + dataType + ": " + e.getMessage());
                    errorCount++;
                }
                processingResults.add(result);
            }

            response.put("status", "completed");
            response.put("message",
                    String.format("Processing completed. %d successful, %d failed", successCount, errorCount));
            response.put("total_records", data.size());
            response.put("successful_inserts", successCount);
            response.put("failed_inserts", errorCount);
            response.put("database", database);
            response.put("details", processingResults);
            response.put("uploaded_by", currentUser.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Processing failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
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

    private Map<String, Object> createEndpointDoc(String method, String path, String description,
            Map<String, Object> example) {
        Map<String, Object> endpoint = new HashMap<>();
        endpoint.put("method", method);
        endpoint.put("path", path);
        endpoint.put("description", description);
        endpoint.put("parameters", Arrays.asList(
                "database (query parameter): Target database (hospital1 or hospital2)"));
        endpoint.put("headers", Arrays.asList(
                "Content-Type: application/json",
                "X-API-Key: your-api-key (if using API key authentication)"));
        endpoint.put("example_request", example);
        return endpoint;
    }

    private Map<String, Object> getPatientExample() {
        Map<String, Object> example = new HashMap<>();
        List<Map<String, Object>> patients = new ArrayList<>();

        Map<String, Object> patient = new HashMap<>();
        patient.put("person_id", 12345);
        patient.put("gender_concept_id", 8507);
        patient.put("year_of_birth", 1985);
        patient.put("race_concept_id", 8527);
        patient.put("ethnicity_concept_id", 38003564);
        patient.put("person_source_value", "PATIENT_12345");

        patients.add(patient);
        example.put("patients", patients);
        return example;
    }

    private Map<String, Object> getConditionExample() {
        Map<String, Object> example = new HashMap<>();
        List<Map<String, Object>> conditions = new ArrayList<>();

        Map<String, Object> condition = new HashMap<>();
        condition.put("condition_occurrence_id", 1001);
        condition.put("person_id", 12345);
        condition.put("condition_concept_id", 201826);
        condition.put("condition_start_date", "2024-01-15");
        condition.put("condition_type_concept_id", 32020);

        conditions.add(condition);
        example.put("conditions", conditions);
        return example;
    }

    private Map<String, Object> getDrugExample() {
        Map<String, Object> example = new HashMap<>();
        List<Map<String, Object>> drugs = new ArrayList<>();

        Map<String, Object> drug = new HashMap<>();
        drug.put("drug_exposure_id", 2001);
        drug.put("person_id", 12345);
        drug.put("drug_concept_id", 1124300);
        drug.put("drug_exposure_start_date", "2024-01-15");
        drug.put("drug_exposure_end_date", "2024-01-25");
        drug.put("drug_type_concept_id", 38000177);

        drugs.add(drug);
        example.put("drugs", drugs);
        return example;
    }

    private Map<String, Object> getMeasurementExample() {
        Map<String, Object> example = new HashMap<>();
        List<Map<String, Object>> measurements = new ArrayList<>();

        Map<String, Object> measurement = new HashMap<>();
        measurement.put("measurement_id", 3001);
        measurement.put("person_id", 12345);
        measurement.put("measurement_concept_id", 3004249);
        measurement.put("measurement_date", "2024-01-15");
        measurement.put("measurement_type_concept_id", 44818701);
        measurement.put("value_as_number", 120.5);

        measurements.add(measurement);
        example.put("measurements", measurements);
        return example;
    }

    private Map<String, Object> getVisitExample() {
        Map<String, Object> example = new HashMap<>();
        List<Map<String, Object>> visits = new ArrayList<>();

        Map<String, Object> visit = new HashMap<>();
        visit.put("visit_occurrence_id", 4001);
        visit.put("person_id", 12345);
        visit.put("visit_concept_id", 9201);
        visit.put("visit_start_date", "2024-01-15");
        visit.put("visit_end_date", "2024-01-16");
        visit.put("visit_type_concept_id", 44818517);

        visits.add(visit);
        example.put("visits", visits);
        return example;
    }

    private Map<String, Object> getSqlExample() {
        Map<String, Object> example = new HashMap<>();
        String sqlContent = "-- Example SQL insert statements from your insert_01.sql file\n" +
                "INSERT INTO person (person_id, gender_concept_id, year_of_birth, race_concept_id, ethnicity_concept_id, person_source_value) VALUES\n"
                +
                "  (12345, 8507, 1985, 8527, 38003564, 'PATIENT_12345'),\n" +
                "  (12346, 8532, 1990, 8527, 38003564, 'PATIENT_12346');\n\n" +
                "INSERT INTO condition_occurrence (condition_occurrence_id, person_id, condition_concept_id, condition_start_date, condition_type_concept_id) VALUES\n"
                +
                "  (1001, 12345, 201826, '2024-01-15', 32020),\n" +
                "  (1002, 12346, 140168, '2024-01-16', 32020);";

        example.put("sql_content", sqlContent);
        example.put("note",
                "Send the raw SQL content as the request body with Content-Type: text/plain or application/sql");
        return example;
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