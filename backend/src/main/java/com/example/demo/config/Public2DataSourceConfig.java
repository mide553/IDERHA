package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableJpaRepositories(entityManagerFactoryRef = "public2EntityManagerFactory", transactionManagerRef = "public2TransactionManager", basePackages = {
        "com.example.demo.repository.public2db" })
public class Public2DataSourceConfig {

    @Bean(name = "public2DataSource")
    @ConfigurationProperties(prefix = "public2.datasource")
    public DataSource public2DataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5434/public_eHealth_Insights_2")
                .username("postgres")
                .password("password")
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean(name = "public2EntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean public2EntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("public2DataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.demo.model.public2db")
                .persistenceUnit("public2")
                .build();
    }

    @Bean(name = "public2TransactionManager")
    public PlatformTransactionManager public2TransactionManager(
            @Qualifier("public2EntityManagerFactory") EntityManagerFactory public2EntityManagerFactory) {
        return new JpaTransactionManager(public2EntityManagerFactory);
    }

    @Bean(name = "public2JdbcTemplate")
    public JdbcTemplate public2JdbcTemplate(@Qualifier("public2DataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}