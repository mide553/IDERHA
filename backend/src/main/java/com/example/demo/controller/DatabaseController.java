package com.example.demo.controller;

import com.example.demo.service.DatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DatabaseController {

    @Autowired
    private DatabaseService databaseService;

    /**
     * Execute a query. If 'database' is specified, queries that specific database.
     * If 'unified' is true, queries across all hospitals using FDW.
     * Otherwise, defaults to private database.
     */
    @PostMapping("/pg-query")
    public ResponseEntity<?> executeQuery(@RequestBody Map<String, String> request) {
        try {
            String query = request.get("query");
            String database = request.get("database");
            String unified = request.get("unified");

            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Query cannot be empty"));
            }

            List<Map<String, Object>> results;

            if ("true".equalsIgnoreCase(unified)) {
                // Use FDW for cross-hospital queries
                results = databaseService.executeUnifiedQuery(query);
            } else if (database != null && !database.isEmpty()) {
                // Query specific database
                results = databaseService.executeQueryOnDatabase(query, database);
            } else {
                // Default to private database (includes FDW views)
                results = databaseService.executeQuery(query);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rowCount", results.size());
            response.put("data", results);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "error", "Query execution failed",
                            "message", e.getMessage()));
        }
    }

    /**
     * Get available unified views for cross-hospital queries
     * NOTE: Unified views are in hospital1 database (not private) for security
     */
    @GetMapping("/unified-views")
    public ResponseEntity<?> getUnifiedViews() {
        try {
            String query = "SELECT table_name FROM information_schema.views " +
                    "WHERE table_schema = 'public' AND table_name LIKE 'unified_%' " +
                    "ORDER BY table_name";

            // Query hospital1 database where FDW views are located
            List<Map<String, Object>> views = databaseService.executeQueryOnDatabase(query, "hospital1");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "views", views));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "FDW may not be set up yet. Run setup-fdw.ps1 to enable cross-hospital queries.",
                    "views", List.of()));
        }
    }

    /**
     * Get list of all available hospital databases
     */
    @GetMapping("/databases")
    public ResponseEntity<?> getAvailableDatabases() {
        try {
            List<String> databases = databaseService.getAvailableDatabases();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "databases", databases));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to get databases",
                            "message", e.getMessage()));
        }
    }
}