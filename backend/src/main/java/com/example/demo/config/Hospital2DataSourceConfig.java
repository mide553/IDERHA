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
@EnableJpaRepositories(entityManagerFactoryRef = "hospital2EntityManagerFactory", transactionManagerRef = "hospital2TransactionManager", basePackages = {
        "com.example.demo.repository.hospital2db" })
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

    @Bean(name = "hospital2EntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean hospital2EntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("hospital2DataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.demo.model.hospital2db")
                .persistenceUnit("hospital2")
                .build();
    }

    @Bean(name = "hospital2TransactionManager")
    public PlatformTransactionManager hospital2TransactionManager(
            @Qualifier("hospital2EntityManagerFactory") EntityManagerFactory hospital2EntityManagerFactory) {
        return new JpaTransactionManager(hospital2EntityManagerFactory);
    }

    @Bean(name = "hospital2JdbcTemplate")
    public JdbcTemplate hospital2JdbcTemplate(@Qualifier("hospital2DataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
