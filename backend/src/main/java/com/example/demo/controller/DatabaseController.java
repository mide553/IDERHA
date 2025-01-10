package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.DatabaseService;

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
        return databaseService.executeQuery(query);
    }
}
