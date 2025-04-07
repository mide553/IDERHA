package com.example.demo.controller;

import com.example.demo.service.UserService;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        User user = userService.findByEmail(email);

        Map<String, String> response = new HashMap<>();
        if (user != null && user.getPassword().equals(password)) {
            response.put("status", "success");
            response.put("email", user.getEmail());
        } else {
            response.put("status", "error");
            response.put("message", "Invalid email or password");
        }
        return response;
    }
}