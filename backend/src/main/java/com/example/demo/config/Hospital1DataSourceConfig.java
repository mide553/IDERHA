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
@EnableJpaRepositories(entityManagerFactoryRef = "hospital1EntityManagerFactory", transactionManagerRef = "hospital1TransactionManager", basePackages = {
        "com.example.demo.repository.hospital1db" })
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

    @Bean(name = "hospital1EntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean hospital1EntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("hospital1DataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.demo.model.hospital1db")
                .persistenceUnit("hospital1")
                .build();
    }

    @Bean(name = "hospital1TransactionManager")
    public PlatformTransactionManager hospital1TransactionManager(
            @Qualifier("hospital1EntityManagerFactory") EntityManagerFactory hospital1EntityManagerFactory) {
        return new JpaTransactionManager(hospital1EntityManagerFactory);
    }

    @Bean(name = "hospital1JdbcTemplate")
    public JdbcTemplate hospital1JdbcTemplate(@Qualifier("hospital1DataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
