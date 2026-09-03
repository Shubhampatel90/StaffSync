package com.staffsync.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration BLOCK_DURATION = Duration.ofMinutes(15);

    private final Map<String, Integer> attempts = new ConcurrentHashMap<>();
    private final Map<String, Instant> blockedUntil = new ConcurrentHashMap<>();

    public void loginFailed(String ip) {
        int count = attempts.merge(ip, 1, Integer::sum);
        if (count >= MAX_ATTEMPTS) {
            blockedUntil.put(ip, Instant.now().plus(BLOCK_DURATION));
        }
    }

    public void loginSucceeded(String ip) {
        attempts.remove(ip);
        blockedUntil.remove(ip);
    }

    public boolean isBlocked(String ip) {
        Instant until = blockedUntil.get(ip);
        if (until == null) {
            return false;
        }
        if (Instant.now().isAfter(until)) {
            blockedUntil.remove(ip);
            attempts.remove(ip);
            return false;
        }
        return true;
    }

    public int getRemainingAttempts(String ip) {
        return Math.max(0, MAX_ATTEMPTS - attempts.getOrDefault(ip, 0));
    }
}