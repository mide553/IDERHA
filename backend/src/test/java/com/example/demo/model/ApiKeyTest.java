package com.example.demo.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ApiKeyTest {

    @Test
    void testApiKeyCreation() {
        ApiKey apiKey = new ApiKey();
        apiKey.setId(1L);
        apiKey.setKeyValue("api-key-12345");
        apiKey.setKeyName("Test API Key");
        apiKey.setDescription("Test API Key");
        apiKey.setCreatedBy("test@example.com");
        LocalDateTime now = LocalDateTime.now();
        apiKey.setCreatedAt(now);
        apiKey.setActive(true);

        assertEquals(1L, apiKey.getId());
        assertEquals("api-key-12345", apiKey.getKeyValue());
        assertEquals("Test API Key", apiKey.getKeyName());
        assertEquals("Test API Key", apiKey.getDescription());
        assertEquals("test@example.com", apiKey.getCreatedBy());
        assertEquals(now, apiKey.getCreatedAt());
        assertTrue(apiKey.isActive());
    }

    @Test
    void testApiKeyDefaultValues() {
        ApiKey apiKey = new ApiKey();
        
        assertNull(apiKey.getId());
        assertNull(apiKey.getKeyValue());
        assertNull(apiKey.getKeyName());
        assertNull(apiKey.getDescription());
        assertNull(apiKey.getCreatedBy());
        assertNotNull(apiKey.getCreatedAt()); // CreatedAt is set in constructor
        assertFalse(apiKey.isActive()); // Default is false (though constructor may set to true)
    }

    @Test
    void testApiKeyActiveFlag() {
        ApiKey apiKey = new ApiKey();
        
        assertFalse(apiKey.isActive());
        
        apiKey.setActive(true);
        assertTrue(apiKey.isActive());
        
        apiKey.setActive(false);
        assertFalse(apiKey.isActive());
    }
}
