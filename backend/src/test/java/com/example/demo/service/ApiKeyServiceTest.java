package com.example.demo.service;

import com.example.demo.model.ApiKey;
import com.example.demo.repository.ApiKeyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyServiceTest {

    @Mock
    private ApiKeyRepository apiKeyRepository;

    @InjectMocks
    private ApiKeyService apiKeyService;

    private ApiKey testApiKey;

    @BeforeEach
    void setUp() {
        testApiKey = new ApiKey();
        testApiKey.setId(1L);
        testApiKey.setKeyValue("test-api-key-12345");
        testApiKey.setKeyName("Test Key");
        testApiKey.setDescription("Test API Key");
        testApiKey.setCreatedBy("test@example.com");
        testApiKey.setCreatedAt(LocalDateTime.now());
        testApiKey.setActive(true);
        testApiKey.setHospitalId("hospital1");
        testApiKey.setAssignedDatabase("hospital1_db");
    }

    @Test
    void testFindByKeyValue_KeyExists() {
        when(apiKeyRepository.findByKeyValue("test-api-key-12345")).thenReturn(Optional.of(testApiKey));

        Optional<ApiKey> result = apiKeyRepository.findByKeyValue("test-api-key-12345");

        assertTrue(result.isPresent());
        assertEquals("test-api-key-12345", result.get().getKeyValue());
        assertTrue(result.get().isActive());
        verify(apiKeyRepository, times(1)).findByKeyValue("test-api-key-12345");
    }

    @Test
    void testFindByKeyValue_KeyDoesNotExist() {
        when(apiKeyRepository.findByKeyValue("nonexistent-key")).thenReturn(Optional.empty());

        Optional<ApiKey> result = apiKeyRepository.findByKeyValue("nonexistent-key");

        assertFalse(result.isPresent());
        verify(apiKeyRepository, times(1)).findByKeyValue("nonexistent-key");
    }

    @Test
    void testFindByCreatedBy() {
        ApiKey apiKey2 = new ApiKey();
        apiKey2.setId(2L);
        apiKey2.setKeyValue("another-key");
        apiKey2.setCreatedBy("test@example.com");

        List<ApiKey> apiKeys = Arrays.asList(testApiKey, apiKey2);
        when(apiKeyRepository.findByCreatedBy("test@example.com")).thenReturn(apiKeys);

        List<ApiKey> result = apiKeyRepository.findByCreatedBy("test@example.com");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("test@example.com", result.get(0).getCreatedBy());
        verify(apiKeyRepository, times(1)).findByCreatedBy("test@example.com");
    }

    @Test
    void testGenerateApiKey() {
        when(apiKeyRepository.save(any(ApiKey.class))).thenReturn(testApiKey);

        ApiKey result = apiKeyService.generateApiKey("Test Key", "hospital1", "hospital1_db", "test@example.com", "Test API Key");

        assertNotNull(result);
        verify(apiKeyRepository, times(1)).save(any(ApiKey.class));
    }

    @Test
    void testDeactivateApiKey() {
        when(apiKeyRepository.findByKeyValue("test-api-key-12345")).thenReturn(Optional.of(testApiKey));
        when(apiKeyRepository.save(any(ApiKey.class))).thenReturn(testApiKey);

        boolean result = apiKeyService.deactivateApiKey("test-api-key-12345");

        assertTrue(result);
        verify(apiKeyRepository, times(1)).findByKeyValue("test-api-key-12345");
        verify(apiKeyRepository, times(1)).save(any(ApiKey.class));
    }

    @Test
    void testDeleteApiKey() {
        when(apiKeyRepository.findByKeyValue("test-api-key-12345")).thenReturn(Optional.of(testApiKey));
        doNothing().when(apiKeyRepository).delete(any(ApiKey.class));

        boolean result = apiKeyService.deleteApiKey("test-api-key-12345");

        assertTrue(result);
        verify(apiKeyRepository, times(1)).findByKeyValue("test-api-key-12345");
        verify(apiKeyRepository, times(1)).delete(testApiKey);
    }

    @Test
    void testGetActiveApiKeys() {
        List<ApiKey> activeKeys = Arrays.asList(testApiKey);
        when(apiKeyRepository.findByIsActiveTrue()).thenReturn(activeKeys);

        List<ApiKey> result = apiKeyService.getActiveApiKeys();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(apiKeyRepository, times(1)).findByIsActiveTrue();
    }
}
