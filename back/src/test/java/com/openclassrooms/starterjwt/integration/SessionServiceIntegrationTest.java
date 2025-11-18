package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class SessionServiceIntegrationTest {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;
    private Session session;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        sessionRepository.deleteAll();

        user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.doe@test.com");
        user.setPassword("Password123!");
        userRepository.save(user);

        session = new Session();
        session.setName("Yoga Class");
        session.setDescription("Morning yoga session");
        session.setDate(new Date());
        session.setUsers(new ArrayList<>());
        sessionService.create(session);
    }

    @Test
    @DisplayName("Créer une session")
    void testCreateSession() {
        Session newSession = new Session();
        newSession.setName("Pilates Class");
        newSession.setDescription("Pilates session");
        newSession.setDate(new Date());
        newSession.setUsers(new ArrayList<>());

        Session saved = sessionService.create(newSession);
        assertNotNull(saved.getId());
        assertEquals("Pilates Class", saved.getName());
    }

    @Test
    @DisplayName("Trouver toutes les sessions")
    void testFindAll() {
        List<Session> sessions = sessionService.findAll();
        assertFalse(sessions.isEmpty());
        assertEquals(1, sessions.size());
    }

    @Test
    @DisplayName("Récupérer une session par ID")
    void testGetById() {
        Session found = sessionService.getById(session.getId());
        assertNotNull(found);
        assertEquals("Yoga Class", found.getName());
    }

    @Test
    @DisplayName("Mettre à jour une session")
    void testUpdate() {
        session.setName("Updated Yoga");
        Session updated = sessionService.update(session.getId(), session);
        assertEquals("Updated Yoga", updated.getName());
    }

    @Test
    @DisplayName("Supprimer une session")
    void testDelete() {
        sessionService.delete(session.getId());
        assertNull(sessionService.getById(session.getId()));
    }

    @Test
    @DisplayName("Participer à une session")
    void testParticipate() {
        sessionService.participate(session.getId(), user.getId());
        Session updated = sessionService.getById(session.getId());
        assertTrue(updated.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId())));
    }

    @Test
    @DisplayName("Participer à une session déjà inscrite – exception")
    void testParticipateAlreadyExists() {
        sessionService.participate(session.getId(), user.getId());
        assertThrows(BadRequestException.class, () -> sessionService.participate(session.getId(), user.getId()));
    }

    @Test
    @DisplayName("Se désinscrire d'une session")
    void testNoLongerParticipate() {
        sessionService.participate(session.getId(), user.getId());
        sessionService.noLongerParticipate(session.getId(), user.getId());
        Session updated = sessionService.getById(session.getId());
        assertTrue(updated.getUsers().isEmpty());
    }

    @Test
    @DisplayName("Se désinscrire d'une session non inscrite – exception")
    void testNoLongerParticipateNotExists() {
        assertThrows(BadRequestException.class, () -> sessionService.noLongerParticipate(session.getId(), user.getId()));
    }

    @Test
    @DisplayName("Participer ou se désinscrire d'une session inexistante – exception")
    void testSessionNotFound() {
        Long invalidId = 999L;
        assertThrows(NotFoundException.class, () -> sessionService.participate(invalidId, user.getId()));
        assertThrows(NotFoundException.class, () -> sessionService.noLongerParticipate(invalidId, user.getId()));
    }

    @Test
    @DisplayName("Participer – user inexistant doit lever NotFoundException")
    void testParticipateUserNotFound() {
        Long invalidUserId = 999L;

        assertThrows(NotFoundException.class,
                () -> sessionService.participate(session.getId(), invalidUserId));
    }

    @Test
    @DisplayName("Participer – un autre user est déjà inscrit mais pas celui-ci : OK")
    void testParticipateWithOtherUsersAlreadyInSession() {

        // Create another user already in session
        User other = new User();
        other.setFirstName("Alice");
        other.setLastName("Tester");
        other.setEmail("alice@test.com");
        other.setPassword("pass");
        userRepository.save(other);

        session.getUsers().add(other);
        sessionRepository.save(session);

        // Now add the main test user
        sessionService.participate(session.getId(), user.getId());

        Session updated = sessionService.getById(session.getId());
        assertEquals(2, updated.getUsers().size());
        assertTrue(updated.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId())));
    }

    @Test
    @DisplayName("Participer – session inexistante et user inexistante doivent lever NotFoundException")
    void testParticipateBothNotFound() {
        assertThrows(NotFoundException.class,
                () -> sessionService.participate(999L, 999L));
    }


    @Test
    @DisplayName("Se désinscrire parmi plusieurs users — les autres doivent rester")
    void testNoLongerParticipateAmongMultipleUsers() {

        // Second user
        User other = new User();
        other.setFirstName("Alice");
        other.setLastName("Tester");
        other.setEmail("alice@test.com");
        other.setPassword("pass");
        userRepository.save(other);

        // Add both users
        sessionService.participate(session.getId(), user.getId());
        sessionService.participate(session.getId(), other.getId());

        // Remove only first user
        sessionService.noLongerParticipate(session.getId(), user.getId());

        Session updated = sessionService.getById(session.getId());

        assertEquals(1, updated.getUsers().size());
        assertEquals(other.getId(), updated.getUsers().get(0).getId());
    }

    @Test
    @DisplayName("Se désinscrire deux fois — deuxième tentative doit lever BadRequestException")
    void testNoLongerParticipateTwice() {

        sessionService.participate(session.getId(), user.getId());

        // First removal OK
        sessionService.noLongerParticipate(session.getId(), user.getId());

        // Second removal must fail
        assertThrows(BadRequestException.class,
                () -> sessionService.noLongerParticipate(session.getId(), user.getId()));
    }

    @Test
    @DisplayName("Se désinscrire alors que d'autres participants sont inscrits — mais pas lui — exception")
    void testNoLongerParticipateOtherUsersButNotThisOne() {

        // Another user registered
        User other = new User();
        other.setFirstName("Bob");
        other.setLastName("Tester");
        other.setEmail("bob@test.com");
        other.setPassword("pass");
        userRepository.save(other);

        sessionService.participate(session.getId(), other.getId());

        // user has NOT participated → should fail
        assertThrows(BadRequestException.class,
                () -> sessionService.noLongerParticipate(session.getId(), user.getId()));
    }


}
