package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setFirstname("Test");
        testUser.setLastname("User");
        testUser.setPassword("hashedPassword");
        testUser.setRole("researcher");
    }

    @Test
    void testFindByEmail_UserExists() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

        User result = userService.findByEmail("test@example.com");

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test", result.getFirstname());
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void testFindByEmail_UserDoesNotExist() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(null);

        User result = userService.findByEmail("nonexistent@example.com");

        assertNull(result);
        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    void testValidatePassword_CorrectPassword() {
        when(passwordEncoder.matches("plainPassword", "hashedPassword")).thenReturn(true);

        boolean result = userService.validatePassword("plainPassword", "hashedPassword");

        assertTrue(result);
        verify(passwordEncoder, times(1)).matches("plainPassword", "hashedPassword");
    }

    @Test
    void testValidatePassword_IncorrectPassword() {
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        boolean result = userService.validatePassword("wrongPassword", "hashedPassword");

        assertFalse(result);
        verify(passwordEncoder, times(1)).matches("wrongPassword", "hashedPassword");
    }

    @Test
    void testEncodePassword() {
        String rawPassword = "mySecurePassword123";
        String encodedPassword = "$2a$10$encoded.hash.here";

        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);

        String result = userService.encodePassword(rawPassword);

        assertEquals(encodedPassword, result);
        verify(passwordEncoder, times(1)).encode(rawPassword);
    }

    @Test
    void testEncodePassword_EmptyString() {
        String emptyPassword = "";
        String encodedEmpty = "$2a$10$encoded.empty";

        when(passwordEncoder.encode(emptyPassword)).thenReturn(encodedEmpty);

        String result = userService.encodePassword(emptyPassword);

        assertEquals(encodedEmpty, result);
        verify(passwordEncoder, times(1)).encode(emptyPassword);
    }
}
