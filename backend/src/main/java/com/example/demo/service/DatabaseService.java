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

    public List<Map<String, Object>> executeQuery(String query) {
        return hospital1JdbcTemplate.queryForList(query);
    }

    public List<Map<String, Object>> executeQueryOnHospital2(String query) {
        return hospital2JdbcTemplate.queryForList(query);
    }

    public List<Map<String, Object>> executeQueryOnDatabase(String query, String database) {
        if ("hospital2".equals(database)) {
            return hospital2JdbcTemplate.queryForList(query);
        } else {
            return hospital1JdbcTemplate.queryForList(query);
        }
    }

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
            default:
                throw new IllegalArgumentException("Unknown database: " + database);
        }
    }
}