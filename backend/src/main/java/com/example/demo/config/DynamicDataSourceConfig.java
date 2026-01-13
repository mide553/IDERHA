package com.example.demo.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dynamic DataSource Configuration
 * Automatically detects and configures all hospital databases from
 * application.properties
 * To add a new hospital, just add properties like:
 * hospital3.datasource.url=...
 * hospital3.datasource.username=...
 * hospital3.datasource.password=...
 */
@Configuration
public class DynamicDataSourceConfig {

    private final Environment environment;
    private final Map<String, JdbcTemplate> jdbcTemplates = new HashMap<>();

    public DynamicDataSourceConfig(Environment environment) {
        this.environment = environment;
        initializeHospitalDatabases();
    }

    /**
     * Scan application.properties for all hospital*.datasource.url patterns
     * and create JdbcTemplates for each
     */
    private void initializeHospitalDatabases() {
        Set<String> hospitalNames = findHospitalDatabases();

        for (String hospitalName : hospitalNames) {
            try {
                DataSource dataSource = createDataSource(hospitalName);
                JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
                jdbcTemplates.put(hospitalName, jdbcTemplate);
                System.out.println("✓ Initialized database: " + hospitalName);
            } catch (Exception e) {
                System.err.println("✗ Failed to initialize database: " + hospitalName);
                e.printStackTrace();
            }
        }
    }

    /**
     * Find all hospital database configurations by scanning property keys
     */
    private Set<String> findHospitalDatabases() {
        Set<String> hospitalNames = new HashSet<>();

        // Check for hospitalN pattern (hospital1, hospital2, hospital3, etc.)
        for (int i = 1; i <= 20; i++) {
            String hospitalName = "hospital" + i;
            String urlKey = hospitalName + ".datasource.url";
            if (environment.getProperty(urlKey) != null) {
                hospitalNames.add(hospitalName);
            }
        }

        return hospitalNames;
    }

    /**
     * Create a DataSource for a specific hospital
     */
    private DataSource createDataSource(String hospitalName) {
        String url = environment.getProperty(hospitalName + ".datasource.url");
        String username = environment.getProperty(hospitalName + ".datasource.username");
        String password = environment.getProperty(hospitalName + ".datasource.password");
        String driverClassName = environment.getProperty(hospitalName + ".datasource.driver-class-name",
                "org.postgresql.Driver");

        return DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName(driverClassName)
                .build();
    }

    /**
     * Get JdbcTemplate for a specific database
     */
    public JdbcTemplate getJdbcTemplate(String databaseName) {
        if ("private".equals(databaseName)) {
            // Private database is handled separately by PrivateDataSourceConfig
            throw new IllegalArgumentException("Use privateJdbcTemplate for private database");
        }

        JdbcTemplate template = jdbcTemplates.get(databaseName);
        if (template == null) {
            throw new IllegalArgumentException("Database not found: " + databaseName +
                    ". Available databases: " + getAvailableDatabases());
        }
        return template;
    }

    /**
     * Get all available hospital database names
     */
    public List<String> getAvailableDatabases() {
        return new ArrayList<>(jdbcTemplates.keySet()).stream()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Check if a database exists
     */
    public boolean hasDatabase(String databaseName) {
        return jdbcTemplates.containsKey(databaseName);
    }

    /**
     * Bean to expose available databases list
     */
    @Bean
    public List<String> availableHospitalDatabases() {
        return getAvailableDatabases();
    }
}
