package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Users")
public class User {
    @Id
    private String email;
    private String password;


    public String getEmail() {
        return email;
    }


    public String getPassword() {
        return password;
    }



}