package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class Hospital1DataSourceConfig {
    @Bean(name = "hospital1DataSource")
    @ConfigurationProperties(prefix = "hospital1.datasource")
    public DataSource hospital1DataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5433/hospital1_eHealth_Insights")
                .username("postgres")
                .password("password")
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean(name = "hospital1JdbcTemplate")
    public JdbcTemplate hospital1JdbcTemplate(@Qualifier("hospital1DataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
