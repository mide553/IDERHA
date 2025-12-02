package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class Hospital2DataSourceConfig {

    @Bean
    @ConfigurationProperties("hospital2.datasource")
    public DataSourceProperties hospital2DataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "hospital2DataSource")
    public DataSource hospital2DataSource() {
        return hospital2DataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Bean(name = "hospital2JdbcTemplate")
    public JdbcTemplate hospital2JdbcTemplate(@Qualifier("hospital2DataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
