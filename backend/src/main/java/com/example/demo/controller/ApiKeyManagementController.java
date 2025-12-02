package com.example.demo.controller;

import com.example.demo.model.ApiKey;
import com.example.demo.model.User;
import com.example.demo.service.ApiKeyService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/api-keys")
public class ApiKeyManagementController {

    @Autowired
    private ApiKeyService apiKeyService;

    /**
     * Generate a new API key for a hospital
     * POST /api/admin/api-keys/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateApiKey(
            @RequestBody Map<String, Object> request,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // Check admin authentication
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null || !"admin".equals(currentUser.getRole())) {
            response.put("status", "error");
            response.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            String keyName = (String) request.get("keyName");
            String hospitalId = (String) request.get("hospitalId");
            String assignedDatabase = (String) request.get("assignedDatabase");
            String description = (String) request.get("description");

            // Validate required fields
            if (keyName == null || keyName.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Key name is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (hospitalId == null || hospitalId.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Hospital ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (assignedDatabase == null || assignedDatabase.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Assigned database is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Check if expiration date is provided
            LocalDateTime expiresAt = null;
            if (request.containsKey("expiresAt") && request.get("expiresAt") != null) {
                String expiresAtStr = (String) request.get("expiresAt");
                try {
                    expiresAt = LocalDateTime.parse(expiresAtStr);
                } catch (Exception e) {
                    response.put("status", "error");
                    response.put("message", "Invalid expiration date format. Use ISO format: 2024-12-31T23:59:59");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            ApiKey apiKey;
            if (expiresAt != null) {
                apiKey = apiKeyService.generateApiKey(keyName, hospitalId, assignedDatabase, currentUser.getEmail(),
                        description, expiresAt);
            } else {
                apiKey = apiKeyService.generateApiKey(keyName, hospitalId, assignedDatabase, currentUser.getEmail(),
                        description);
            }

            response.put("status", "success");
            response.put("message", "API key generated successfully");
            response.put("apiKey", apiKey.getKeyValue());
            response.put("keyName", apiKey.getKeyName());
            response.put("hospitalId", apiKey.getHospitalId());
            response.put("assignedDatabase", apiKey.getAssignedDatabase());
            response.put("createdAt", apiKey.getCreatedAt());
            response.put("expiresAt", apiKey.getExpiresAt());
            response.put("description", apiKey.getDescription());

            // Warning about key security
            response.put("warning", "Store this API key securely. It will not be shown again.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to generate API key: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * List all API keys
     * GET /api/admin/api-keys
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listApiKeys(
            @RequestParam(value = "hospitalId", required = false) String hospitalId,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // Check admin authentication
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null || !"admin".equals(currentUser.getRole())) {
            response.put("status", "error");
            response.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            List<ApiKey> apiKeys;
            if (hospitalId != null && !hospitalId.trim().isEmpty()) {
                apiKeys = apiKeyService.getApiKeysByHospital(hospitalId);
            } else {
                apiKeys = apiKeyService.getActiveApiKeys();
            }

            // Remove sensitive key values from response
            List<Map<String, Object>> sanitizedKeys = apiKeys.stream().map(key -> {
                Map<String, Object> keyInfo = new HashMap<>();
                keyInfo.put("id", key.getId());
                keyInfo.put("keyName", key.getKeyName());
                keyInfo.put("hospitalId", key.getHospitalId());
                keyInfo.put("assignedDatabase", key.getAssignedDatabase());
                keyInfo.put("isActive", key.isActive());
                keyInfo.put("createdAt", key.getCreatedAt());
                keyInfo.put("expiresAt", key.getExpiresAt());
                keyInfo.put("lastUsedAt", key.getLastUsedAt());
                keyInfo.put("createdBy", key.getCreatedBy());
                keyInfo.put("description", key.getDescription());
                keyInfo.put("isExpired", key.isExpired());
                keyInfo.put("keyValuePreview", key.getKeyValue().substring(0, 10) + "...");
                return keyInfo;
            }).toList();

            response.put("status", "success");
            response.put("apiKeys", sanitizedKeys);
            response.put("total", sanitizedKeys.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to retrieve API keys: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Deactivate an API key by ID
     * POST /api/admin/api-keys/deactivate-by-id
     */
    @PostMapping("/deactivate-by-id")
    public ResponseEntity<Map<String, Object>> deactivateApiKeyById(
            @RequestBody Map<String, Object> request,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // Check admin authentication
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null || !"admin".equals(currentUser.getRole())) {
            response.put("status", "error");
            response.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            Object idObj = request.get("id");
            if (idObj == null) {
                response.put("status", "error");
                response.put("message", "API key ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            Long id;
            if (idObj instanceof Integer) {
                id = ((Integer) idObj).longValue();
            } else if (idObj instanceof Long) {
                id = (Long) idObj;
            } else {
                try {
                    id = Long.valueOf(idObj.toString());
                } catch (NumberFormatException e) {
                    response.put("status", "error");
                    response.put("message", "Invalid API key ID format");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            boolean deactivated = apiKeyService.deactivateApiKeyById(id);

            if (deactivated) {
                response.put("status", "success");
                response.put("message", "API key deactivated successfully");
            } else {
                response.put("status", "error");
                response.put("message", "API key not found");
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to deactivate API key: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Deactivate an API key
     * POST /api/admin/api-keys/deactivate
     */
    @PostMapping("/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateApiKey(
            @RequestBody Map<String, Object> request,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // Check admin authentication
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null || !"admin".equals(currentUser.getRole())) {
            response.put("status", "error");
            response.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            String keyValue = (String) request.get("keyValue");

            if (keyValue == null || keyValue.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "API key value is required");
                return ResponseEntity.badRequest().body(response);
            }

            boolean deactivated = apiKeyService.deactivateApiKey(keyValue);

            if (deactivated) {
                response.put("status", "success");
                response.put("message", "API key deactivated successfully");
            } else {
                response.put("status", "error");
                response.put("message", "API key not found");
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to deactivate API key: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Delete an API key
     * DELETE /api/admin/api-keys
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteApiKey(
            @RequestBody Map<String, Object> request,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // Check admin authentication
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null || !"admin".equals(currentUser.getRole())) {
            response.put("status", "error");
            response.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            String keyValue = (String) request.get("keyValue");

            if (keyValue == null || keyValue.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "API key value is required");
                return ResponseEntity.badRequest().body(response);
            }

            boolean deleted = apiKeyService.deleteApiKey(keyValue);

            if (deleted) {
                response.put("status", "success");
                response.put("message", "API key deleted successfully");
            } else {
                response.put("status", "error");
                response.put("message", "API key not found");
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to delete API key: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}