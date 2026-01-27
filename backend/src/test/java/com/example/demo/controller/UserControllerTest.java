package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    private User testUser;
    private MockHttpSession session;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setFirstname("Test");
        testUser.setLastname("User");
        testUser.setPassword("$2a$10$hashedPassword");
        testUser.setRole("admin");
        testUser.setCreatedBy("admin@example.com");

        session = new MockHttpSession();
    }

    @Test
    @WithMockUser
    void testLogin_Success() throws Exception {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "test@example.com");
        loginRequest.put("password", "password123");

        when(userService.findByEmail("test@example.com")).thenReturn(testUser);
        when(userService.validatePassword("password123", "$2a$10$hashedPassword")).thenReturn(true);

        mockMvc.perform(post("/api/users/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("admin"));

        verify(userService, times(1)).findByEmail("test@example.com");
        verify(userService, times(1)).validatePassword("password123", "$2a$10$hashedPassword");
    }

    @Test
    @WithMockUser
    void testLogin_InvalidCredentials() throws Exception {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "test@example.com");
        loginRequest.put("password", "wrongPassword");

        when(userService.findByEmail("test@example.com")).thenReturn(testUser);
        when(userService.validatePassword("wrongPassword", "$2a$10$hashedPassword")).thenReturn(false);

        mockMvc.perform(post("/api/users/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @WithMockUser
    void testLogin_UserNotFound() throws Exception {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "nonexistent@example.com");
        loginRequest.put("password", "password123");

        when(userService.findByEmail("nonexistent@example.com")).thenReturn(null);

        mockMvc.perform(post("/api/users/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    @WithMockUser
    void testCheckSession_ValidSession() throws Exception {
        session.setAttribute("user", testUser);

        mockMvc.perform(get("/api/users/check-session")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("admin"));
    }

    @Test
    @WithMockUser
    void testCheckSession_NoSession() throws Exception {
        mockMvc.perform(get("/api/users/check-session")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("No active session"));
    }

    @Test
    @WithMockUser
    void testLogout() throws Exception {
        session.setAttribute("user", testUser);

        mockMvc.perform(post("/api/users/logout")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    @WithMockUser
    void testGetAllUsers_AsAdmin() throws Exception {
        session.setAttribute("user", testUser);

        User user2 = new User();
        user2.setEmail("researcher@example.com");
        user2.setRole("researcher");

        List<User> users = Arrays.asList(testUser, user2);
        when(userRepository.findAll()).thenReturn(users);

        mockMvc.perform(get("/api/users/admin/users")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void testGetAllUsers_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/users/admin/users")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void testAddUser_Success() throws Exception {
        session.setAttribute("user", testUser);

        User newUser = new User();
        newUser.setEmail("newuser@example.com");
        newUser.setFirstname("New");
        newUser.setLastname("User");
        newUser.setPassword("password123");
        newUser.setRole("researcher");

        when(userRepository.findByEmail("newuser@example.com")).thenReturn(null);
        when(userService.encodePassword("password123")).thenReturn("$2a$10$encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        mockMvc.perform(post("/api/users/admin/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newUser))
                        .session(session))
                .andExpect(status().isOk());

        verify(userService, times(1)).encodePassword("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @WithMockUser
    void testAddUser_EmailAlreadyExists() throws Exception {
        session.setAttribute("user", testUser);

        User newUser = new User();
        newUser.setEmail("test@example.com");
        newUser.setPassword("password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

        mockMvc.perform(post("/api/users/admin/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newUser))
                        .session(session))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("User with this email already exists"));
    }

    @Test
    @WithMockUser
    void testDeleteUser_Success() throws Exception {
        session.setAttribute("user", testUser);

        User userToDelete = new User();
        userToDelete.setEmail("delete@example.com");
        userToDelete.setCreatedBy("admin@example.com");

        when(userRepository.findByEmail("delete@example.com")).thenReturn(userToDelete);
        doNothing().when(userRepository).deleteById("delete@example.com");

        mockMvc.perform(delete("/api/users/admin/users/delete@example.com")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));

        verify(userRepository, times(1)).deleteById("delete@example.com");
    }

    @Test
    @WithMockUser
    void testDeleteUser_CannotDeleteSelf() throws Exception {
        session.setAttribute("user", testUser);

        mockMvc.perform(delete("/api/users/admin/users/test@example.com")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You cannot delete yourself"));
    }
}
