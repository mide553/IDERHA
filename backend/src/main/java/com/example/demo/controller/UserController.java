package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Login + Save session
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
}
