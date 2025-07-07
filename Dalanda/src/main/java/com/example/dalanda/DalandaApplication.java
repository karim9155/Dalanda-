package com.example.dalanda;

import io.jsonwebtoken.security.Keys;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Base64;

@SpringBootApplication
public class DalandaApplication {

    public static void main(String[] args) {
        SpringApplication.run(DalandaApplication.class, args);
        byte[] key = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256).getEncoded();
        System.out.println(Base64.getEncoder().encodeToString(key));
    }

}
