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
@EnableJpaRepositories(entityManagerFactoryRef = "publicEntityManagerFactory", transactionManagerRef = "publicTransactionManager", basePackages = {
        "com.example.demo.repository.publicdb" })
public class PublicDataSourceConfig {
    @Bean(name = "publicDataSource")
    @ConfigurationProperties(prefix = "public.datasource")
    public DataSource publicDataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5433/public_eHealth_Insights")
                .username("postgres")
                .password("password")
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean(name = "publicEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean publicEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("publicDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.demo.model.publicdb")
                .persistenceUnit("public")
                .build();
    }

    @Bean(name = "publicTransactionManager")
    public PlatformTransactionManager publicTransactionManager(
            @Qualifier("publicEntityManagerFactory") EntityManagerFactory publicEntityManagerFactory) {
        return new JpaTransactionManager(publicEntityManagerFactory);
    }

    @Bean(name = "publicJdbcTemplate")
    public JdbcTemplate publicJdbcTemplate(@Qualifier("publicDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}