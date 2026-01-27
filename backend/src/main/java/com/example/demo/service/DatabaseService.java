package com.example.demo.service;

import com.example.demo.config.DynamicDataSourceConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DatabaseService {

    @Autowired
    @Qualifier("privateJdbcTemplate")
    private JdbcTemplate privateJdbcTemplate;

    @Autowired
    private DynamicDataSourceConfig dynamicDataSourceConfig;

    /**
     * Execute query on private database (authentication only - NO patient data)
     * Private DB is isolated and does not have FDW access
     */
    public List<Map<String, Object>> executeQuery(String query) {
        return privateJdbcTemplate.queryForList(query);
    }

    /**
     * Execute unified query across all hospitals using FDW
     * This queries the unified views in hospital1 database (which has FDW to all
     * hospitals)
     * Private database is NOT involved for security reasons
     */
    public List<Map<String, Object>> executeUnifiedQuery(String query) {
        // Always use hospital1 as it contains the unified FDW views
        return dynamicDataSourceConfig.getJdbcTemplate("hospital1").queryForList(query);
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

    /**
     * Get all available hospital databases
     */
    public List<String> getAvailableDatabases() {
        return dynamicDataSourceConfig.getAvailableDatabases();
    }

    private JdbcTemplate getJdbcTemplate(String database) {
        if ("private".equals(database)) {
            return privateJdbcTemplate;
        }
        return dynamicDataSourceConfig.getJdbcTemplate(database);
    }
}