package com.example.dalanda.Services;

public interface AuthService {
    /**
     * Verifies credentials, returns a signed JWT.
     */
    String login(String username, String password);

    /**
     * Issues a fresh JWT given a valid one.
     */
    String refreshToken(String token);

    /**
     * (Optional) Invalidate the token (e.g. blacklist).
     */
    void logout(String token);
}
