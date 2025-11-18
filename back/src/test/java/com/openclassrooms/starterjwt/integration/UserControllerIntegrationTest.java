package com.openclassrooms.starterjwt.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private String userToken;
    private User testUser;

    @BeforeEach
    @DisplayName("Initialisation avant chaque test : création d'un utilisateur test et génération du JWT")
    void setUp() {
        // Crée un utilisateur de test
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setAdmin(false);
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        userRepository.saveAndFlush(testUser);

        // Crée le UserDetails et JWT
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(testUser.getId())
                .username(testUser.getEmail())
                .firstName(testUser.getFirstName())
                .lastName(testUser.getLastName())
                .password(testUser.getPassword())
                .admin(testUser.isAdmin())
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        userToken = jwtUtils.generateJwtToken(auth);
    }

    @Test
    @DisplayName("Récupérer un utilisateur par ID avec succès")
    void testGetUserById() throws Exception {
        mockMvc.perform(get("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                .andExpect(jsonPath("$.firstName").value(testUser.getFirstName()))
                .andExpect(jsonPath("$.lastName").value(testUser.getLastName()));
    }

    @Test
    @DisplayName("Récupérer un utilisateur inexistant renvoie 404")
    void testGetUserById_NotFound() throws Exception {
        mockMvc.perform(get("/api/user/99999")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Suppression d'un utilisateur existant réussie")
    void testDeleteUser_Success() throws Exception {
        mockMvc.perform(delete("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Suppression d'un utilisateur non autorisée renvoie 401")
    void testDeleteUser_Unauthorized() throws Exception {
        // Crée un autre utilisateur
        User anotherUser = new User();
        anotherUser.setEmail("other@example.com");
        anotherUser.setPassword("password");
        anotherUser.setAdmin(false);
        anotherUser.setFirstName("Other");
        anotherUser.setLastName("User");
        userRepository.saveAndFlush(anotherUser);

        mockMvc.perform(delete("/api/user/" + anotherUser.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Suppression d'un utilisateur inexistant renvoie 404")
    void testDeleteUser_NotFound() throws Exception {
        mockMvc.perform(delete("/api/user/99999")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isNotFound());
    }
}
