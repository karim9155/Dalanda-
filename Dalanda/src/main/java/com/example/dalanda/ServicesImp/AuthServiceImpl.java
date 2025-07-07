package com.example.dalanda.ServicesImp;

import com.example.dalanda.Entities.User;
import com.example.dalanda.Repositories.UserRepository;
import com.example.dalanda.Services.JwtUtil;
import com.example.dalanda.Services.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(AuthenticationManager authManager,
                           UserRepository userRepo,
                           JwtUtil jwtUtil) {
        this.authManager = authManager;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public String login(String username, String password) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (AuthenticationException ex) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        User u = userRepo.findByUsername(username)
                .orElseThrow();
        return jwtUtil.generateToken(u.getUsername());
    }

    @Override
    public String refreshToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Cannot refresh invalid token");
        }
        String username = jwtUtil.extractUsername(token);
        return jwtUtil.generateToken(username);
    }

    @Override
    public void logout(String token) {
        // if you maintain a blacklist, add it here.
    }
}
