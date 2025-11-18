package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    @BeforeEach
    void init() {
        MockitoAnnotations.openMocks(this);
    }

    // -------------------------------------------------------
    // create()
    // -------------------------------------------------------
    @Test
    @DisplayName("create() : sauvegarde la session")
    void testCreate() {
        Session session = new Session();
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.create(session);

        assertEquals(session, result);
        verify(sessionRepository).save(session);
    }

    // -------------------------------------------------------
    // delete()
    // -------------------------------------------------------
    @Test
    @DisplayName("delete() : supprime la session")
    void testDelete() {
        doNothing().when(sessionRepository).deleteById(1L);

        sessionService.delete(1L);

        verify(sessionRepository).deleteById(1L);
    }

    // -------------------------------------------------------
    // findAll()
    // -------------------------------------------------------
    @Test
    @DisplayName("findAll() : retourne toutes les sessions")
    void testFindAll() {
        List<Session> list = List.of(new Session(), new Session());
        when(sessionRepository.findAll()).thenReturn(list);

        List<Session> result = sessionService.findAll();

        assertEquals(2, result.size());
        verify(sessionRepository).findAll();
    }

    // -------------------------------------------------------
    // getById()
    // -------------------------------------------------------
    @Test
    @DisplayName("getById() : session trouvée")
    void testGetByIdFound() {
        Session session = new Session();
        session.setId(5L);

        when(sessionRepository.findById(5L)).thenReturn(Optional.of(session));

        assertEquals(session, sessionService.getById(5L));
    }

    @Test
    @DisplayName("getById() : session non trouvée → null")
    void testGetByIdNotFound() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertNull(sessionService.getById(99L));
    }

    // -------------------------------------------------------
    // update()
    // -------------------------------------------------------
    @Test
    @DisplayName("update() : mise à jour OK")
    void testUpdate() {
        Session session = new Session();
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.update(10L, session);

        assertEquals(10L, result.getId());
        verify(sessionRepository).save(session);
    }

    // -------------------------------------------------------
    // participate()
    // -------------------------------------------------------
    @Test
    @DisplayName("participate() : ajoute un utilisateur")
    void testParticipateOK() {
        Session session = new Session();
        session.setId(1L);
        session.setUsers(new ArrayList<>());

        User user = new User();
        user.setId(7L);

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(sessionRepository.save(session)).thenReturn(session);

        sessionService.participate(1L, 7L);

        assertEquals(1, session.getUsers().size());
        assertEquals(7L, session.getUsers().get(0).getId());
    }

    @Test
    @DisplayName("participate() : session ou user inexistant → NotFoundException")
    void testParticipateNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sessionService.participate(1L, 7L));
    }

    @Test
    @DisplayName("participate() : déjà inscrit → BadRequestException")
    void testParticipateAlreadyExists() {
        User user = new User();
        user.setId(7L);

        Session session = new Session();
        session.setUsers(new ArrayList<>(List.of(user)));

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> sessionService.participate(1L, 7L));
    }

    // -------------------------------------------------------
    // noLongerParticipate()
    // -------------------------------------------------------
    @Test
    @DisplayName("noLongerParticipate() : retire un utilisateur")
    void testNoLongerParticipateOK() {
        User user = new User();
        user.setId(7L);

        Session session = new Session();
        session.setUsers(new ArrayList<>(List.of(user)));

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(session)).thenReturn(session);

        sessionService.noLongerParticipate(1L, 7L);

        assertEquals(0, session.getUsers().size());
    }

    @Test
    @DisplayName("noLongerParticipate() : session absente → NotFoundException")
    void testNoLongerParticipateSessionNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sessionService.noLongerParticipate(1L, 7L));
    }

    @Test
    @DisplayName("noLongerParticipate() : user pas inscrit → BadRequestException")
    void testNoLongerParticipateNotParticipating() {
        Session session = new Session();
        session.setUsers(new ArrayList<>());

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThrows(BadRequestException.class, () -> sessionService.noLongerParticipate(1L, 7L));
    }
}
