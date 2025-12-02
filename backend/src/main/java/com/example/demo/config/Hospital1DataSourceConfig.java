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
public class Hospital1DataSourceConfig {

    @Bean
    @ConfigurationProperties("hospital1.datasource")
    public DataSourceProperties hospital1DataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "hospital1DataSource")
    public DataSource hospital1DataSource() {
        return hospital1DataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Bean(name = "hospital1JdbcTemplate")
    public JdbcTemplate hospital1JdbcTemplate(@Qualifier("hospital1DataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
