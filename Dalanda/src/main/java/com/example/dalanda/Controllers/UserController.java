package com.example.dalanda.Controllers;

import com.example.dalanda.Repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/users")    // <-- changed here
public class UserController {

    private final UserRepository userRepo;

    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String,String>> whoAmI(Principal principal) {
        String username = principal.getName();
        UUID id = userRepo.findByUsername(username)
                .map(u -> u.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + username)
                );
        return ResponseEntity.ok(
                Collections.singletonMap("id", id.toString())
        );
    }
}
