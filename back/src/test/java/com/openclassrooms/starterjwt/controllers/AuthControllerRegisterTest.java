package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerRegisterTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthController authController;

    @Test
    @DisplayName("Création de compte réussie : nouvel utilisateur enregistré")
    void shouldRegisterSuccessfully() {
        SignupRequest request = new SignupRequest();
        request.setEmail("new@test.com");
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setPassword("123456");

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(encoder.encode("123456")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        ResponseEntity<?> response = authController.registerUser(request);

        assertEquals(200, response.getStatusCode().value());

        Object body = response.getBody();
        assertNotNull(body, "Response body should not be null");

        if (body instanceof MessageResponse messageResponse) {
            assertEquals("User registered successfully!", messageResponse.getMessage());
        } else {
            fail("Unexpected response type: " + body.getClass());
        }
    }

    @Test
    @DisplayName("Échec création compte : email déjà enregistré")
    void shouldFailIfEmailAlreadyExists() {
        SignupRequest request = new SignupRequest();
        request.setEmail("exists@test.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("123456");

        when(userRepository.existsByEmail("exists@test.com")).thenReturn(true);

        ResponseEntity<?> response = authController.registerUser(request);

        assertEquals(400, response.getStatusCode().value());

        Object body = response.getBody();
        assertNotNull(body, "Response body should not be null");

        if (body instanceof MessageResponse messageResponse) {
            assertEquals("Error: Email is already taken!", messageResponse.getMessage());
        } else {
            fail("Unexpected response type: " + body.getClass());
        }
    }

    @Test
    @DisplayName("Échec création compte : champ obligatoire manquant (email ou mot de passe)")
    void shouldFailIfMissingRequiredField() {
        SignupRequest request = new SignupRequest();
        // No email, no password

        assertThrows(NullPointerException.class, () -> authController.registerUser(request));
    }
}
