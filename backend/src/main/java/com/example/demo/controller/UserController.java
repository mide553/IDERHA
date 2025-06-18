package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request, HttpSession session) {
        String email = request.get("email");
        String password = request.get("password");
        User user = userService.findByEmail(email);

        Map<String, String> response = new HashMap<>();
        if (user != null && user.getPassword().equals(password)) {
            session.setAttribute("user", user);
            response.put("status", "success");
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/check-session")
    public ResponseEntity<Map<String, String>> checkSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        Map<String, String> response = new HashMap<>();

        if (user != null) {
            response.put("status", "success");
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            if (user.getAssignedDatabase() != null) {
                response.put("assignedDatabase", user.getAssignedDatabase());
            }
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", "No active session");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        session.invalidate();
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    // Admin endpoints for user management

    // Get all users with role-based filtering
    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        List<User> users = userRepository.findAll();

        if ("hospital".equals(currentUser.getRole())) {
            users = users.stream()
                    .filter(user -> currentUser.getEmail().equals(user.getCreatedBy()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(users);
    }

    // Add new user
    @PostMapping("/admin/users")
    public ResponseEntity<?> addUser(@RequestBody User newUser, HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        if (userRepository.findByEmail(newUser.getEmail()) != null) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "User with this email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        if ("hospital".equals(currentUser.getRole()) &&
                ("admin".equals(newUser.getRole()) || "hospital".equals(newUser.getRole()))) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Hospital users can only create researcher accounts");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if ("hospital".equals(newUser.getRole()) && 
            (newUser.getAssignedDatabase() == null || newUser.getAssignedDatabase().trim().isEmpty())) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Hospital users must be assigned a database");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        newUser.setCreatedBy(currentUser.getEmail());

        try {
            User savedUser = userRepository.save(newUser);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to create user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Edit user
    @PutMapping("/admin/users/{email}")
    public ResponseEntity<?> editUser(@PathVariable String email, @RequestBody User updatedUser, HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User existingUser = userRepository.findByEmail(email);
        if (existingUser == null) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if ("hospital".equals(currentUser.getRole()) &&
                !currentUser.getEmail().equals(existingUser.getCreatedBy())) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "You can only edit users you created");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if ("hospital".equals(currentUser.getRole()) && "admin".equals(updatedUser.getRole())) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Hospital users cannot assign admin role");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if ("hospital".equals(updatedUser.getRole()) && 
            (updatedUser.getAssignedDatabase() == null || updatedUser.getAssignedDatabase().trim().isEmpty())) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Hospital users must be assigned a database");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setFirstname(updatedUser.getFirstname());
        existingUser.setLastname(updatedUser.getLastname());
        existingUser.setRole(updatedUser.getRole());
        
        existingUser.setAssignedDatabase(updatedUser.getAssignedDatabase());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
            existingUser.setPassword(updatedUser.getPassword());
        }

        try {
            if (!email.equals(updatedUser.getEmail())) {
                userRepository.deleteById(email);
            }

            User savedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to update user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Delete user
    @DeleteMapping("/admin/users/{email}")
    public ResponseEntity<?> deleteUser(@PathVariable String email, HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        // Prevent self-deletion
        if (email.equals(currentUser.getEmail())) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "You cannot delete yourself");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        User userToDelete = userRepository.findByEmail(email);
        if (userToDelete == null) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // hospital users can only delete users they created
        if ("hospital".equals(currentUser.getRole()) &&
                !currentUser.getEmail().equals(userToDelete.getCreatedBy())) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "You can only delete users you created");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            userRepository.deleteById(email);
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
