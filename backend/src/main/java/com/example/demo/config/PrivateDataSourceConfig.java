package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
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
    @Primary
    @Bean(name = "privateDataSource")
    @ConfigurationProperties(prefix = "private.datasource")
    public DataSource privateDataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5432/private_eHealth_Insights")
                .username("postgres")
                .password("password")
                .driverClassName("org.postgresql.Driver")
                .build();
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
}