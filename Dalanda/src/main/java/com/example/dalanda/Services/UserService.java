package com.example.dalanda.Services;

import com.example.dalanda.Entities.Role;
import com.example.dalanda.Entities.User;

import java.util.Optional;
import java.util.Set;

public interface UserService {
    /**
     * Register a brand-new user with raw password.
     * Throws if username already exists.
     */
    User register(String username,
                  String rawPassword,
                  Set<Role> roles);

    Optional<User> findByUsername(String username);
}
