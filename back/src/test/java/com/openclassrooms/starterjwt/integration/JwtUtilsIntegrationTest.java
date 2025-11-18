package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;

import io.jsonwebtoken.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JwtUtilsIntegrationTest {

    @Autowired
    private JwtUtils jwtUtils;

    private UserDetailsImpl testUserDetails;
    private Authentication auth;

    @BeforeEach
    void setup() {
        testUserDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@yoga.com")
                .firstName("Test")
                .lastName("User")
                .password("Password123!")
                .admin(false)
                .build();

        auth = new UsernamePasswordAuthenticationToken(
                testUserDetails, null, testUserDetails.getAuthorities());
    }

    // --------------------------------------------------------------------
    // 1. Token expiré
    // --------------------------------------------------------------------
    @Test
    @DisplayName("validateJwtToken() – JWT expiré retourne false + ExpiredJwtException")
    void testExpiredJwtToken() throws InterruptedException {
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 1);

        String token = jwtUtils.generateJwtToken(auth);
        Thread.sleep(10);

        assertFalse(jwtUtils.validateJwtToken(token));
        assertThrows(ExpiredJwtException.class, () -> jwtUtils.getUserNameFromJwtToken(token));
    }

    // --------------------------------------------------------------------
    // 2. Signature invalide
    // --------------------------------------------------------------------
    @Test
    @DisplayName("validateJwtToken() – signature invalide retourne false")
    void testInvalidSignatureJwtToken() {

        // Clé HS512 aléatoire et valide Base64
        String wrongKey = "r8XyGa6A8nXnJk5lCqfBv1fRESjpnPR0cVpt5Rr9xWry1m3X52z4qJVZ8y4nQp7utjWZNA4xS9tQVn8zHcQq7g==";
        String tokenWithWrongKey = Jwts.builder()
                .setSubject("test")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10000))
                .signWith(SignatureAlgorithm.HS512, wrongKey)
                .compact();

        assertFalse(jwtUtils.validateJwtToken(tokenWithWrongKey));
    }

    // --------------------------------------------------------------------
    // 3. Token vide
    // --------------------------------------------------------------------
    @Test
    @DisplayName("validateJwtToken() – token vide retourne false")
    void testValidateEmptyToken() {
        assertFalse(jwtUtils.validateJwtToken(""));
    }

    // --------------------------------------------------------------------
    // 4. Token null
    // --------------------------------------------------------------------
    @Test
    @DisplayName("validateJwtToken() – token null retourne false")
    void testValidateNullToken() {
        assertFalse(jwtUtils.validateJwtToken(null));
    }

    // --------------------------------------------------------------------
    // 5. Token malformé
    // --------------------------------------------------------------------
    @Test
    @DisplayName("validateJwtToken() – token mal formé retourne false")
    void testMalformedJwtToken() {
        assertFalse(jwtUtils.validateJwtToken("abc.def")); // structure invalide
    }

    // --------------------------------------------------------------------
    // 6. Token avec algorithme non supporté (JJWT >= 0.11 sans NONE)
    // --------------------------------------------------------------------
    @Test
    @DisplayName("validateJwtToken() – algorithme non supporté retourne false")
    void testUnsupportedJwtAlgorithm() {
        // On force un header "alg: none" manuellement → considéré comme non supporté
        String unsupportedToken = Jwts.builder()
                .setHeaderParam("alg", "none")
                .setSubject("test")
                .compact();

        assertFalse(jwtUtils.validateJwtToken(unsupportedToken));
    }

}
