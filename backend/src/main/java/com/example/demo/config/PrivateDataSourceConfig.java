package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(entityManagerFactoryRef = "privateEntityManagerFactory", transactionManagerRef = "privateTransactionManager", basePackages = {
        "com.example.demo.repository" })
public class PrivateDataSourceConfig {

    @Bean
    @ConfigurationProperties("private.datasource")
    public DataSourceProperties privateDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Primary
    @Bean(name = "privateDataSource")
    public DataSource privateDataSource() {
        return privateDataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Primary
    @Bean(name = "privateEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean privateEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("privateDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.demo.model")
                .persistenceUnit("private")
                .build();
    }

    @Primary
    @Bean(name = "privateTransactionManager")
    public PlatformTransactionManager privateTransactionManager(
            @Qualifier("privateEntityManagerFactory") EntityManagerFactory privateEntityManagerFactory) {
        return new JpaTransactionManager(privateEntityManagerFactory);
    }

    @Primary
    @Bean(name = "privateJdbcTemplate")
    public JdbcTemplate privateJdbcTemplate(@Qualifier("privateDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}