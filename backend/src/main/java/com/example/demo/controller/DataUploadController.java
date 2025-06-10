package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.DatabaseService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
public class DataUploadController {

    @Autowired
    private DatabaseService databaseService;

    @PostMapping("/sql")
    public ResponseEntity<Map<String, Object>> uploadSqlFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("database") String database,
            HttpSession session
    ) {
        Map<String, Object> response = new HashMap<>();

        // Check user authentication
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            response.put("status", "error");
            response.put("message", "User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Validate user permissions for database access
        if ("hospital".equals(currentUser.getRole())) {
            if (currentUser.getAssignedDatabase() == null) {
                response.put("status", "error");
                response.put("message", "No database assigned to your account");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            if (!currentUser.getAssignedDatabase().equals(database)) {
                response.put("status", "error");
                response.put("message", "Access denied to database: " + database);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } else if (!"admin".equals(currentUser.getRole())) {
            response.put("status", "error");
            response.put("message", "Insufficient permissions for data upload");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if (file.isEmpty()) {
            response.put("status", "error");
            response.put("message", "No file uploaded");
            return ResponseEntity.badRequest().body(response);
        }

        // Validate file type
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".sql")) {
            response.put("status", "error");
            response.put("message", "Only SQL files are allowed");
            return ResponseEntity.badRequest().body(response);
        }

        List<Map<String, Object>> executionDetails = new ArrayList<>();
        int executedStatements = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            StringBuilder queryBuilder = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.startsWith("--") || line.isEmpty()) {
                    continue;
                }
                queryBuilder.append(line).append("\n");
            }

            String fullSql = queryBuilder.toString();
            String[] statements = fullSql.split(";");

            for (String stmt : statements) {
                stmt = stmt.trim();
                if (stmt.isEmpty()) continue;

                Map<String, Object> detail = new HashMap<>();
                detail.put("statement", stmt.length() > 100 ? stmt.substring(0, 100) + "..." : stmt);

                try {
                    databaseService.executeUpdate(stmt, database);
                    detail.put("success", true);
                    detail.put("result", "Executed successfully");
                    executedStatements++;
                } catch (Exception ex) {
                    detail.put("success", false);
                    detail.put("result", ex.getMessage());
                }
                executionDetails.add(detail);
            }

            response.put("status", "success");
            response.put("message", "SQL file processed successfully");
            response.put("statementsExecuted", executedStatements);
            response.put("database", database);
            response.put("details", executionDetails);
            response.put("uploadedBy", currentUser.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to process file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
