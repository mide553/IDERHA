package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{email}")
    public ResponseEntity<User> updateUser(@PathVariable String email, @RequestBody User userDetails) {
        try {
            User user = userRepository.findByEmail(email);
            if (user != null) {
                // Update all allowed fields
                if (userDetails.getFirstname() != null) {
                    user.setFirstname(userDetails.getFirstname());
                }
                if (userDetails.getLastname() != null) {
                    user.setLastname(userDetails.getLastname());
                }
                if (userDetails.getRole() != null) {
                    user.setRole(userDetails.getRole());
                }
                if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                    user.setPassword(userDetails.getPassword());
                }
                
                user.setAssignedDatabase(userDetails.getAssignedDatabase());

                if (userDetails.getEmail() != null && !userDetails.getEmail().equals(email)) {
                    userRepository.delete(user);
                    user.setEmail(userDetails.getEmail());
                    User updatedUser = userRepository.save(user);
                    return ResponseEntity.ok(updatedUser);
                } else {
                    User updatedUser = userRepository.save(user);
                    return ResponseEntity.ok(updatedUser);
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String email) {
        try {
            User user = userRepository.findByEmail(email);
            if (user != null) {
                userRepository.delete(user);
                Map<String, String> response = new HashMap<>();
                response.put("message", "User deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}