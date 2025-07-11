package com.example.dalanda.dto;

import java.util.UUID;

public class UserDTO {
    private UUID id;
    private String username;

    // Constructors, Getters, Setters
    public UserDTO() {}

    public UserDTO(UUID id, String username) {
        this.id = id;
        this.username = username;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
