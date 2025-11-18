package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setup() throws Exception {
        userRepository.deleteAll();

        // créer un utilisateur pour tester la connexion
        SignupRequest request = new SignupRequest();
        request.setEmail("login@yoga.com");
        request.setPassword("Password123!");
        request.setFirstName("Login");
        request.setLastName("User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/auth/login – connexion réussie")
    void testLoginSuccess() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("login@yoga.com");
        login.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("POST /api/auth/login – mot de passe incorrect")
    void testLoginBadPassword() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("login@yoga.com");
        login.setPassword("WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login – email non existant")
    void testLoginUnknownEmail() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("unknown@yoga.com");
        login.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }


    // -----------------------------------------
    // Tests des champs obligatoires
    // -----------------------------------------
    @Test
    @DisplayName("POST /api/auth/login – échec absence email")
    void testLoginMissingEmail() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setPassword("Password123!");
        // email manquant

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login – échec absence mot de passe")
    void testLoginMissingPassword() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("login@yoga.com");
        // mot de passe manquant

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login – utilisateur admin obtient admin=true")
    void testLoginAdminUser() throws Exception {
        // création d’un admin
        SignupRequest signup = new SignupRequest();
        signup.setEmail("admin@yoga.com");
        signup.setPassword("AdminPass123!");
        signup.setFirstName("Admin");
        signup.setLastName("User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk());

        // mise à jour pour mettre admin = true
        var admin = userRepository.findByEmail("admin@yoga.com").get();
        admin.setAdmin(true);
        userRepository.save(admin);

        // login
        LoginRequest login = new LoginRequest();
        login.setEmail("admin@yoga.com");
        login.setPassword("AdminPass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.admin").value(true));
    }


    @Test
    @DisplayName("POST /api/auth/register – email déjà existant")
    void testRegisterExistingEmail() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("login@yoga.com"); // déjà créé dans setup
        request.setPassword("Password123!");
        request.setFirstName("Duplicate");
        request.setLastName("User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));
    }

    @Test
    @DisplayName("POST /api/auth/login – utilisateur introuvable")
    void testLoginUserNotFound() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("notfound@yoga.com"); // email inexistant
        login.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }
}
