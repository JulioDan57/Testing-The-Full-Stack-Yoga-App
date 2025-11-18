package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionControllerTest {

    @Mock
    private SessionService sessionService;

    @Mock
    private SessionMapper sessionMapper;

    @InjectMocks
    private SessionController sessionController;

    // ------------------------- Helpers -------------------------
    private Session createSession() {
        return new Session();
    }

    private SessionDto createDto() {
        return new SessionDto();
    }

    private List<Session> createSessionList() {
        return List.of(new Session(), new Session());
    }

    private List<SessionDto> createDtoList() {
        return List.of(new SessionDto(), new SessionDto());
    }

    // ------------------------- GET /api/session/{id} -------------------------
    @Test
    @DisplayName("GET by ID – OK: session found")
    void testFindByIdSuccess() {
        Session session = createSession();
        SessionDto dto = createDto();

        when(sessionService.getById(1L)).thenReturn(session);
        when(sessionMapper.toDto(session)).thenReturn(dto);

        ResponseEntity<?> response = sessionController.findById("1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    @DisplayName("GET by ID – 404: session not found")
    void testFindByIdNotFound() {
        when(sessionService.getById(1L)).thenReturn(null);

        ResponseEntity<?> response = sessionController.findById("1");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("GET by ID – 400: invalid id format")
    void testFindByIdBadRequest() {
        ResponseEntity<?> response = sessionController.findById("abc");
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // ------------------------- GET /api/session -------------------------
    @Test
    @DisplayName("GET All – OK: list returned")
    void testFindAll() {
        List<Session> sessions = createSessionList();
        List<SessionDto> dtos = createDtoList();

        when(sessionService.findAll()).thenReturn(sessions);
        when(sessionMapper.toDto(sessions)).thenReturn(dtos);

        ResponseEntity<?> response = sessionController.findAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dtos, response.getBody());
    }

    // ------------------------- POST /api/session -------------------------
    @Test
    @DisplayName("POST Create – OK: session created")
    void testCreateSession() {
        SessionDto dto = createDto();
        Session entity = createSession();
        Session saved = createSession();
        SessionDto savedDto = createDto();

        when(sessionMapper.toEntity(dto)).thenReturn(entity);
        when(sessionService.create(entity)).thenReturn(saved);
        when(sessionMapper.toDto(saved)).thenReturn(savedDto);

        ResponseEntity<?> response = sessionController.create(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(savedDto, response.getBody());
    }

    @Test
    @DisplayName("POST Create – échoue si champ obligatoire manquant")
    void testCreateSessionMissingField() {
        SessionDto dto = createDto();
        dto.setName(null);

        doThrow(jakarta.validation.ConstraintViolationException.class)
                .when(sessionMapper).toEntity(dto);

        assertThrows(jakarta.validation.ConstraintViolationException.class, () -> sessionController.create(dto));
    }

    // ------------------------- PUT /api/session/{id} -------------------------
    @Test
    @DisplayName("PUT Update – OK: session updated")
    void testUpdateSession() {
        SessionDto dto = createDto();
        Session entity = createSession();
        Session updated = createSession();
        SessionDto updatedDto = createDto();

        when(sessionMapper.toEntity(dto)).thenReturn(entity);
        when(sessionService.update(1L, entity)).thenReturn(updated);
        when(sessionMapper.toDto(updated)).thenReturn(updatedDto);

        ResponseEntity<?> response = sessionController.update("1", dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedDto, response.getBody());
    }

    @Test
    @DisplayName("PUT Update – 400: invalid ID format")
    void testUpdateSessionBadRequest() {
        SessionDto dto = createDto();
        ResponseEntity<?> response = sessionController.update("abc", dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("PUT Update – échoue si champ obligatoire manquant")
    void testUpdateSessionMissingField() {
        SessionDto dto = createDto();
        dto.setName(null);

        doThrow(jakarta.validation.ConstraintViolationException.class)
                .when(sessionMapper).toEntity(dto);

        assertThrows(jakarta.validation.ConstraintViolationException.class, () -> sessionController.update("1", dto));
    }

    // ------------------------- DELETE /api/session/{id} -------------------------
    @Test
    @DisplayName("DELETE – OK: session deleted")
    void testDeleteSessionSuccess() {
        Session session = createSession();
        when(sessionService.getById(1L)).thenReturn(session);

        ResponseEntity<?> response = sessionController.save("1");

        verify(sessionService).delete(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("DELETE – 404: session not found")
    void testDeleteSessionNotFound() {
        when(sessionService.getById(1L)).thenReturn(null);

        ResponseEntity<?> response = sessionController.save("1");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("DELETE – 400: invalid ID format")
    void testDeleteSessionBadRequest() {
        ResponseEntity<?> response = sessionController.save("abc");
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // ------------------------- POST /api/session/{id}/participate/{userId} -------------------------
    @Test
    @DisplayName("Participate – OK")
    void testParticipate() {
        ResponseEntity<?> response = sessionController.participate("1", "2");

        verify(sessionService).participate(1L, 2L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("Participate – 400: invalid ID")
    void testParticipateBadRequest() {
        ResponseEntity<?> response = sessionController.participate("a", "1");
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // ------------------------- DELETE /api/session/{id}/participate/{userId} -------------------------
    @Test
    @DisplayName("No longer participate – OK")
    void testNoLongerParticipate() {
        ResponseEntity<?> response = sessionController.noLongerParticipate("1", "2");

        verify(sessionService).noLongerParticipate(1L, 2L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("No longer participate – 400: invalid ID")
    void testNoLongerParticipateBadRequest() {
        ResponseEntity<?> response = sessionController.noLongerParticipate("1", "x");
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
