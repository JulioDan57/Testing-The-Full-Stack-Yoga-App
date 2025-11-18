package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class SessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User normalUser;
    private Teacher teacher;
    private String adminToken;
    private String userToken;

    @BeforeEach
    void setup() throws Exception {
        // Nettoyage des tables
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        // Création d’un enseignant
        teacher = teacherRepository.save(new Teacher(null, "Margot", "DELAHAYE", null, null));

        // Création des utilisateurs
        adminUser = userRepository.save(new User(null, "admin@yoga.com", "Admin", "Admin",
                passwordEncoder.encode("Admin123!"), true, null, null));

        normalUser = userRepository.save(new User(null, "user@yoga.com", "User", "User",
                passwordEncoder.encode("User123!"), false, null, null));

        // Récupération des tokens JWT
        adminToken = obtainToken("admin@yoga.com", "Admin123!");
        userToken = obtainToken("user@yoga.com", "User123!");
    }

    private String obtainToken(String email, String password) throws Exception {
        var loginRequest = new com.openclassrooms.starterjwt.payload.request.LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        var result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        var responseJson = result.getResponse().getContentAsString();
        return objectMapper.readTree(responseJson).get("token").asText();
    }

    private Date toDate(LocalDateTime ldt) {
        return Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
    }

    // ---------------------------------------------------------
    // GET /api/session
    // ---------------------------------------------------------
    @Test
    @DisplayName("GET /api/session – retourne toutes les sessions")
    void testGetAllSessions() throws Exception {
        Session s1 = new Session(null, "Yoga Flow", toDate(LocalDateTime.now()), "Session débutant",
                teacher, new ArrayList<>(), null, null);
        sessionRepository.save(s1);

        mockMvc.perform(get("/api/session")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Yoga Flow"));
    }

    @Test
    @DisplayName("GET /api/session/{id} – retourne une session")
    void testGetSessionById() throws Exception {
        Session session = sessionRepository.save(new Session(null, "Power Yoga", toDate(LocalDateTime.now()),
                "Session avancé", teacher, new ArrayList<>(), null, null));

        mockMvc.perform(get("/api/session/{id}", session.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Power Yoga"));
    }

    // ---------------------------------------------------------
    // POST /api/session
    // ---------------------------------------------------------
    @Test
    @DisplayName("POST /api/session – créer une session")
    void testCreateSession() throws Exception {
        SessionDto dto = new SessionDto();
        dto.setName("Hatha Yoga");
        dto.setDescription("Session Hatha pour tous");
        dto.setDate(toDate(LocalDateTime.now()));
        dto.setTeacher_id(teacher.getId());

        mockMvc.perform(post("/api/session")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Hatha Yoga"));
    }

    // ---------------------------------------------------------
    // PUT /api/session/{id}
    // ---------------------------------------------------------
    @Test
    @DisplayName("PUT /api/session/{id} – mettre à jour une session")
    void testUpdateSession() throws Exception {
        Session session = sessionRepository.save(new Session(null, "Yoga Nidra", toDate(LocalDateTime.now()),
                "Session relaxation", teacher, new ArrayList<>(), null, null));

        SessionDto dto = new SessionDto();
        dto.setName("Yoga Nidra Modifié");
        dto.setDescription("Relaxation totale");
        dto.setDate(toDate(LocalDateTime.now()));
        dto.setTeacher_id(teacher.getId());

        mockMvc.perform(put("/api/session/{id}", session.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga Nidra Modifié"));
    }

    // ---------------------------------------------------------
    // DELETE /api/session/{id}
    // ---------------------------------------------------------
    @Test
    @DisplayName("DELETE /api/session/{id} – supprimer une session")
    void testDeleteSession() throws Exception {
        Session session = sessionRepository.save(new Session(null, "Vinyasa", toDate(LocalDateTime.now()),
                "Flow dynamique", teacher, new ArrayList<>(), null, null));

        mockMvc.perform(delete("/api/session/{id}", session.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    // ---------------------------------------------------------
    // POST /api/session/{id}/participate/{userId}
    // ---------------------------------------------------------
    @Test
    @DisplayName("POST /api/session/{id}/participate/{userId} – l'utilisateur participe")
    void testParticipate() throws Exception {
        Session session = sessionRepository.save(new Session(null, "Ashtanga", toDate(LocalDateTime.now()),
                "Session Ashtanga", teacher, new ArrayList<>(), null, null));

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), normalUser.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }

    // ---------------------------------------------------------
    // DELETE /api/session/{id}/participate/{userId}
    // ---------------------------------------------------------
    @Test
    @DisplayName("DELETE /api/session/{id}/participate/{userId} – l'utilisateur se désinscrit")
    void testNoLongerParticipate() throws Exception {
        Session session = sessionRepository.save(new Session(null, "Ashtanga", toDate(LocalDateTime.now()),
                "Session Ashtanga", teacher, new ArrayList<>(), null, null));

        // Inscription préalable
        session.getUsers().add(normalUser);
        sessionRepository.save(session);

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", session.getId(), normalUser.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }


    @Test
    @DisplayName("POST /api/session – échec création si champ obligatoire manquant")
    void testCreateSessionMissingField() throws Exception {
        SessionDto dto = new SessionDto();
        dto.setDescription("Session sans nom ni date");

        mockMvc.perform(post("/api/session")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/session/{id} – échec modification si champ obligatoire manquant")
    void testUpdateSessionMissingField() throws Exception {
        Session session = sessionRepository.save(new Session(null, "Yoga Test", toDate(LocalDateTime.now()),
                "Description", teacher, new ArrayList<>(), null, null));

        SessionDto dto = new SessionDto(); // pas de champ name ni date

        mockMvc.perform(put("/api/session/{id}", session.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/session/{id} – retourne 404 si session inexistante")
    void testGetSessionByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/session/{id}", 9999)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/session/{id} – retourne 400 si id invalide")
    void testGetSessionByIdInvalidId() throws Exception {
        mockMvc.perform(get("/api/session/{id}", "abc")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/session/{id} – retourne 404 si session inexistante")
    void testDeleteSessionNotFound() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", 9999)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/session/{id} – retourne 400 si id invalide")
    void testDeleteSessionInvalidId() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", "abc")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/session/{id}/participate/{userId} – retourne 400 si id invalide")
    void testParticipateInvalidIds() throws Exception {
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", "abc", "xyz")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/session/{id}/participate/{userId} – retourne 400 si id invalide")
    void testNoLongerParticipateInvalidIds() throws Exception {
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", "abc", "xyz")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest());
    }

}
