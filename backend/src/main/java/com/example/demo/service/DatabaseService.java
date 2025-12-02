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
    @Qualifier("hospital1JdbcTemplate")
    private JdbcTemplate hospital1JdbcTemplate;

    @Autowired
    @Qualifier("hospital2JdbcTemplate")
    private JdbcTemplate hospital2JdbcTemplate;

    @Autowired
    @Qualifier("privateJdbcTemplate")
    private JdbcTemplate privateJdbcTemplate;

    /**
     * Execute query on private database (authentication only - NO patient data)
     * Private DB is isolated and does not have FDW access
     */
    public List<Map<String, Object>> executeQuery(String query) {
        return privateJdbcTemplate.queryForList(query);
    }

    /**
     * Execute unified query across all hospitals using FDW
     * This queries the unified views in hospital1 database (which has FDW to
     * hospital2)
     * Private database is NOT involved for security reasons
     */
    public List<Map<String, Object>> executeUnifiedQuery(String query) {
        return hospital1JdbcTemplate.queryForList(query);
    }

    /**
     * Execute query on a specific database
     * For cross-hospital queries, use executeUnifiedQuery instead
     */
    public List<Map<String, Object>> executeQueryOnDatabase(String query, String database) {
        JdbcTemplate template = getJdbcTemplate(database);
        return template.queryForList(query);
    }

    /**
     * Execute update/insert/delete on a specific database
     */
    public void executeUpdate(String sql, String database) {
        JdbcTemplate template = getJdbcTemplate(database);
        template.execute(sql);
    }

    private JdbcTemplate getJdbcTemplate(String database) {
        switch (database) {
            case "hospital1":
                return hospital1JdbcTemplate;
            case "hospital2":
                return hospital2JdbcTemplate;
            case "private":
                return privateJdbcTemplate;
            default:
                throw new IllegalArgumentException("Unknown database: " + database);
        }
    }
}