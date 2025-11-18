package com.openclassrooms.starterjwt.security.jwt;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;


public class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    // Clé Base64 de 512 bits (exigée par HS512 et compatible JJWT 0.11.5)
    private static final String SECRET_512 =
            "r8XyGa6A8nXnJk5lCqfBv1fRESjpnPR0cVpt5Rr9xWry1m3X53z4qJVZ8y4nQp9utjWZNA4xS9tQVn8zHcQq9g==";

    @BeforeEach
    void setup() {
        jwtUtils = new JwtUtils();

        // On injecte les champs privés avec ReflectionTestUtils
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", SECRET_512);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000); // 1h
    }

    private UserDetailsImpl mockUser() {
        return UserDetailsImpl.builder()
                .id(1L)
                .username("testuser")
                .firstName("Test")
                .lastName("User")
                .admin(false)
                .password("password123")
                .build();
    }

    // -------------------------------------------------------
    // TEST GENERATE TOKEN
    // -------------------------------------------------------
    @Test
    @DisplayName("Génération d'un token JWT valide")
    void testGenerateJwtToken() {
        UserDetailsImpl user = mockUser();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);

        String token = jwtUtils.generateJwtToken(authentication);

        assertNotNull(token, "Le token ne devrait pas être null");
        assertTrue(token.length() > 20, "Le token devrait avoir une taille significative");
    }

    // -------------------------------------------------------
    // TEST GET USERNAME FROM TOKEN
    // -------------------------------------------------------
    @Test
    @DisplayName("Extraction du nom d'utilisateur depuis un token JWT")
    void testGetUserNameFromJwtToken() {
        UserDetailsImpl user = mockUser();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);

        String token = jwtUtils.generateJwtToken(authentication);

        String username = jwtUtils.getUserNameFromJwtToken(token);

        assertEquals("testuser", username);
    }

    // -------------------------------------------------------
    // TEST VALID TOKEN
    // -------------------------------------------------------
    @Test
    @DisplayName("Validation d'un token JWT valide")
    void testValidateJwtToken_valid() {
        UserDetailsImpl user = mockUser();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);

        String token = jwtUtils.generateJwtToken(authentication);

        assertTrue(jwtUtils.validateJwtToken(token));
    }

    // -------------------------------------------------------
    // TEST INVALID TOKEN
    // -------------------------------------------------------
    @Test
    @DisplayName("Validation d'un token JWT invalide")
    void testValidateJwtToken_invalid() {
        assertFalse(jwtUtils.validateJwtToken("abc.def.ghi"));
    }

    // -------------------------------------------------------
    // TEST EXPIRED TOKEN
    // -------------------------------------------------------
    @Test
    @DisplayName("Validation d'un token JWT expiré")
    void testValidateJwtToken_expired() {
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -1); // déjà expiré

        UserDetailsImpl user = mockUser();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);

        String token = jwtUtils.generateJwtToken(authentication);

        assertFalse(jwtUtils.validateJwtToken(token), "Le token doit être expiré");
    }

    @Test
    @DisplayName("Validation d'un token JWT avec signature invalide")
    void testValidateJwtToken_signatureException() {
        UserDetailsImpl user = mockUser();
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(user);

        // Génération d'un token valide
        String token = jwtUtils.generateJwtToken(auth);

        // Changer légèrement la clé pour invalider la signature
        String fakeSecret = "r8XyGa6A8nXnJk5lCqfBv1fRESjpnPR0cVpt5Rr9xWry1m3X52z4qJVZ8y4nQp9utjWZNA4xS9tQVn8zHcQq9g=="; // modifiée
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", fakeSecret);

        assertFalse(jwtUtils.validateJwtToken(token));
    }


    @Test
    @DisplayName("Validation d'un token JWT avec chaine vide")
    void testValidateJwtToken_illegalArgumentException() {
        assertFalse(jwtUtils.validateJwtToken(""));
    }
}
