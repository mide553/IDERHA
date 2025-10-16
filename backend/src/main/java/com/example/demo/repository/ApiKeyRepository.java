package com.example.demo.repository;

import com.example.demo.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {

    Optional<ApiKey> findByKeyValue(String keyValue);

    List<ApiKey> findByHospitalId(String hospitalId);

    List<ApiKey> findByAssignedDatabase(String assignedDatabase);

    List<ApiKey> findByIsActiveTrue();

    List<ApiKey> findByCreatedBy(String createdBy);

    Optional<ApiKey> findByKeyValueAndIsActiveTrue(String keyValue);
}