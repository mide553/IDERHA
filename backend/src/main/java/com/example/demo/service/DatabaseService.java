package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DatabaseService {

    @Autowired
    @Qualifier("publicJdbcTemplate")
    private JdbcTemplate publicJdbcTemplate;

    @Autowired
    @Qualifier("public2JdbcTemplate")
    private JdbcTemplate public2JdbcTemplate;

    public List<Map<String, Object>> executeQuery(String query) {
        return publicJdbcTemplate.queryForList(query);
    }

    public List<Map<String, Object>> executeQueryOnPublic2(String query) {
        return public2JdbcTemplate.queryForList(query);
    }

    public List<Map<String, Object>> executeQueryOnDatabase(String query, String database) {
        if ("public2".equals(database)) {
            return public2JdbcTemplate.queryForList(query);
        } else {
            return publicJdbcTemplate.queryForList(query);
        }
    }
}