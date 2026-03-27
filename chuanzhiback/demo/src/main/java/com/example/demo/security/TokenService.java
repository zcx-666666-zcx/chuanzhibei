package com.example.demo.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
public class TokenService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String TOKEN_PREFIX = "v1";

    @Value("${app.auth.token-secret:dev-only-change-me}")
    private String tokenSecret;

    @Value("${app.auth.token-expire-seconds:2592000}")
    private long tokenExpireSeconds;

    public String generateToken(Long userId) {
        long expiryEpochSecond = Instant.now().getEpochSecond() + tokenExpireSeconds;
        String payload = TOKEN_PREFIX + ":" + userId + ":" + expiryEpochSecond;
        String payloadBase64 = base64Url(payload.getBytes(StandardCharsets.UTF_8));
        String signature = sign(payloadBase64);
        return payloadBase64 + "." + signature;
    }

    public Optional<Long> parseUserId(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            return Optional.empty();
        }

        String payloadBase64 = parts[0];
        String providedSignature = parts[1];
        String expectedSignature = sign(payloadBase64);
        if (!MessageDigest.isEqual(
                providedSignature.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            return Optional.empty();
        }

        String payload;
        try {
            payload = new String(Base64.getUrlDecoder().decode(payloadBase64), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }

        String[] payloadParts = payload.split(":");
        if (payloadParts.length != 3 || !TOKEN_PREFIX.equals(payloadParts[0])) {
            return Optional.empty();
        }

        try {
            Long userId = Long.parseLong(payloadParts[1]);
            long expiry = Long.parseLong(payloadParts[2]);
            if (Instant.now().getEpochSecond() > expiry) {
                return Optional.empty();
            }
            return Optional.of(userId);
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private String sign(String payloadBase64) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] digest = mac.doFinal(payloadBase64.getBytes(StandardCharsets.UTF_8));
            return base64Url(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("token sign failed", ex);
        }
    }

    private String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }
}
