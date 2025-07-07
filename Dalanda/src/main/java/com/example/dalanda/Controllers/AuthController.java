package com.example.dalanda.Controllers;

import com.example.dalanda.Entities.Role;
import com.example.dalanda.Entities.User;
import com.example.dalanda.Services.AuthService;
import com.example.dalanda.Services.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        // map incoming role names to Role enum
        Set<Role> roles = req.getRoles().stream()
                .map(Role::valueOf)
                .collect(Collectors.toSet());
        User created = userService.register(req.getUsername(),
                req.getPassword(),
                roles);
        return ResponseEntity.ok(new MessageResponse("User created with id: " + created.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest req) {
        String token = authService.login(req.getUsername(), req.getPassword());
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private Set<String> roles;  // e.g. ["USER"] or ["ADMIN","USER"]
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class JwtResponse {
        private final String token;
    }

    @Data
    public static class MessageResponse {
        private final String message;
    }
}
