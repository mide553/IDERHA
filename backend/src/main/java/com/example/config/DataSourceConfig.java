package com.example.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.iderha")
    public DataSourceProperties iderhaDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource iderhaDataSource() {
        return iderhaDataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Bean
    public JdbcTemplate iderhaJdbcTemplate(@Qualifier("iderhaDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.private-db")
    public DataSourceProperties privateDbDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource privateDbDataSource() {
        return privateDbDataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Bean
    public JdbcTemplate privateDbJdbcTemplate(@Qualifier("privateDbDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}