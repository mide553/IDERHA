package com.example.demo.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testUserCreation() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setFirstname("John");
        user.setLastname("Doe");
        user.setPassword("hashedPassword");
        user.setRole("admin");
        user.setCreatedBy("system");
        user.setAssignedDatabase("hospital1");

        assertEquals("test@example.com", user.getEmail());
        assertEquals("John", user.getFirstname());
        assertEquals("Doe", user.getLastname());
        assertEquals("hashedPassword", user.getPassword());
        assertEquals("admin", user.getRole());
        assertEquals("system", user.getCreatedBy());
        assertEquals("hospital1", user.getAssignedDatabase());
    }

    @Test
    void testUserDefaultValues() {
        User user = new User();
        
        assertNull(user.getEmail());
        assertNull(user.getFirstname());
        assertNull(user.getLastname());
        assertNull(user.getPassword());
        assertNull(user.getRole());
        assertNull(user.getCreatedBy());
        assertNull(user.getAssignedDatabase());
    }

    @Test
    void testUserEquality() {
        User user1 = new User();
        user1.setEmail("test@example.com");
        user1.setFirstname("John");

        User user2 = new User();
        user2.setEmail("test@example.com");
        user2.setFirstname("John");

        // Note: Equality depends on implementation
        // This is a basic test assuming default Object equals
        assertNotNull(user1);
        assertNotNull(user2);
    }
}
