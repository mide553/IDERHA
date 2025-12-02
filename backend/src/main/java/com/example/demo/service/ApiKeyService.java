package com.example.demo.service;

import com.example.demo.model.ApiKey;
import com.example.demo.model.User;
import com.example.demo.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class ApiKeyService {

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a new API key for a hospital
     */
    public ApiKey generateApiKey(String keyName, String hospitalId, String assignedDatabase, String createdBy,
            String description) {
        String keyValue = generateSecureKey();

        ApiKey apiKey = new ApiKey(keyValue, keyName, hospitalId, assignedDatabase, createdBy);
        apiKey.setDescription(description);

        return apiKeyRepository.save(apiKey);
    }

    /**
     * Generate a new API key with expiration
     */
    public ApiKey generateApiKey(String keyName, String hospitalId, String assignedDatabase, String createdBy,
            String description, LocalDateTime expiresAt) {
        ApiKey apiKey = generateApiKey(keyName, hospitalId, assignedDatabase, createdBy, description);
        apiKey.setExpiresAt(expiresAt);
        return apiKeyRepository.save(apiKey);
    }

    /**
     * Validate API key and return associated User-like object
     */
    public User validateApiKey(String keyValue) {
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyValueAndIsActiveTrue(keyValue);

        if (apiKeyOpt.isEmpty()) {
            return null;
        }

        ApiKey apiKey = apiKeyOpt.get();

        // Check if key is expired
        if (apiKey.isExpired()) {
            return null;
        }

        // Update last used timestamp
        apiKey.setLastUsedAt(LocalDateTime.now());
        apiKeyRepository.save(apiKey);

        // Create a User object representing the API key's permissions
        User apiUser = new User();
        apiUser.setEmail(apiKey.getHospitalId() + "@api.hospital");
        apiUser.setRole("hospital"); // API keys are hospital-level access
        apiUser.setAssignedDatabase(apiKey.getAssignedDatabase());

        return apiUser;
    }

    /**
     * Get all API keys for a hospital
     */
    public List<ApiKey> getApiKeysByHospital(String hospitalId) {
        return apiKeyRepository.findByHospitalId(hospitalId);
    }

    /**
     * Get all active API keys
     */
    public List<ApiKey> getActiveApiKeys() {
        return apiKeyRepository.findByIsActiveTrue();
    }

    /**
     * Deactivate an API key by ID
     */
    public boolean deactivateApiKeyById(Long id) {
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findById(id);

        if (apiKeyOpt.isPresent()) {
            ApiKey apiKey = apiKeyOpt.get();
            apiKey.setActive(false);
            apiKeyRepository.save(apiKey);
            return true;
        }

        return false;
    }

    /**
     * Deactivate an API key
     */
    public boolean deactivateApiKey(String keyValue) {
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyValue(keyValue);

        if (apiKeyOpt.isPresent()) {
            ApiKey apiKey = apiKeyOpt.get();
            apiKey.setActive(false);
            apiKeyRepository.save(apiKey);
            return true;
        }

        return false;
    }

    /**
     * Delete an API key
     */
    public boolean deleteApiKey(String keyValue) {
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyValue(keyValue);

        if (apiKeyOpt.isPresent()) {
            apiKeyRepository.delete(apiKeyOpt.get());
            return true;
        }

        return false;
    }

    /**
     * Generate a cryptographically secure API key
     */
    private String generateSecureKey() {
        // Generate 32 random bytes (256 bits)
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        // Encode to Base64 and remove padding
        String key = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        // Add prefix for identification
        return "ehealth_" + key;
    }

    /**
     * Hash API key for secure storage (if needed for future security enhancements)
     */
    @SuppressWarnings("unused")
    private String hashApiKey(String apiKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(apiKey.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}