package com.example.demo.controller;

import com.example.demo.service.DatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DatabaseController {

    @Autowired
    private DatabaseService databaseService;

    @PostMapping("/pg-query")
    public List<Map<String, Object>> executeQuery(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        String database = request.get("database");

        if (database != null) {
            return databaseService.executeQueryOnDatabase(query, database);
        } else {
            return databaseService.executeQuery(query);
        }
    }

    @PostMapping("/pg-query-hospital2")
    public List<Map<String, Object>> executeQueryOnHospital2(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        return databaseService.executeQueryOnHospital2(query);
    }
}