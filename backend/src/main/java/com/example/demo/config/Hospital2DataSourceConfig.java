package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class Hospital2DataSourceConfig {

    @Bean(name = "hospital2DataSource")
    @ConfigurationProperties(prefix = "hospital2.datasource")
    public DataSource hospital2DataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5434/hospital2_eHealth_Insights")
                .username("postgres")
                .password("password")
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean(name = "hospital2JdbcTemplate")
    public JdbcTemplate hospital2JdbcTemplate(@Qualifier("hospital2DataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
