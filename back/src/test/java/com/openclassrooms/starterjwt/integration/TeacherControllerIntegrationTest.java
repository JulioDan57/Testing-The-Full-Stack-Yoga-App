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

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class TeacherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private String adminToken;

    @BeforeEach
    @DisplayName("Initialisation : création d'un admin + token JWT")
    void setUp() {
        teacherRepository.deleteAll();
        teacherRepository.flush();

        User adminUser = new User();
        adminUser.setEmail("admin@example.com");
        adminUser.setPassword("pass123");
        adminUser.setAdmin(true);

        userRepository.saveAndFlush(adminUser);

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(adminUser.getId())
                .username(adminUser.getEmail())
                .password(adminUser.getPassword())
                .admin(adminUser.isAdmin())
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        adminToken = jwtUtils.generateJwtToken(auth);
    }

    // -------------------------------------------------------------------------
    // GET /api/teacher – liste complète
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("GET /api/teacher – retourne OK même si la liste est vide")
    void testGetAllTeachersEmpty() throws Exception {
        mockMvc.perform(get("/api/teacher")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/teacher – retourne plusieurs enseignants")
    void testGetAllTeachersWithData() throws Exception {
        teacherRepository.saveAndFlush(new Teacher(null, "John", "Doe", null, null));
        teacherRepository.saveAndFlush(new Teacher(null, "Jane", "Smith", null, null));

        mockMvc.perform(get("/api/teacher")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].firstName").exists());
    }

    // -------------------------------------------------------------------------
    // GET /api/teacher/{id} – cas OK
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("GET /api/teacher/{id} – retourne un enseignant existant")
    void testGetTeacherById() throws Exception {
        // Crée un enseignant pour le test
        Teacher teacher = new Teacher();
        teacher.setFirstName("John");
        teacher.setLastName("Doe");
        teacher = teacherRepository.saveAndFlush(teacher);

        mockMvc.perform(get("/api/teacher/" + teacher.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacher.getId()))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    // -------------------------------------------------------------------------
    // GET /api/teacher/{id} – erreurs
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("GET /api/teacher/{id} – ID inexistant retourne 404")
    void testGetTeacherNotFound() throws Exception {
        mockMvc.perform(get("/api/teacher/999999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/teacher/{id} – ID invalide (non numérique) → 400")
    void testGetTeacherInvalidId() throws Exception {
        mockMvc.perform(get("/api/teacher/abc")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest());
    }

    // -------------------------------------------------------------------------
    // Authentification
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("GET /api/teacher – accès sans token → 401 Unauthorized")
    void testAccessWithoutToken() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());
    }
}
