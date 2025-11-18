package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherControllerTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private TeacherMapper teacherMapper;

    @InjectMocks
    private TeacherController teacherController;

    // ------------------ GET /api/teacher/{id} ------------------

    @DisplayName("Get teacher by id - success")
    @Test
    void shouldGetTeacherById() {
        Teacher teacher = new Teacher();
        teacher.setId(1L);
        teacher.setFirstName("John");
        teacher.setLastName("Doe");

        when(teacherService.findById(1L)).thenReturn(teacher);
        when(teacherMapper.toDto(teacher)).thenReturn(new TeacherDto(1L, "John", "Doe", null, null));

        ResponseEntity<?> resp = teacherController.findById("1");
        assertEquals(200, resp.getStatusCode().value());
        assertTrue(resp.getBody() instanceof TeacherDto);
    }

    @DisplayName("Get teacher by id - bad request for invalid id")
    @Test
    void shouldReturnBadRequestForInvalidId() {
        ResponseEntity<?> resp = teacherController.findById("abc");
        assertEquals(400, resp.getStatusCode().value());
    }

    @DisplayName("Get teacher by id - not found")
    @Test
    void shouldReturnNotFoundIfTeacherNotExist() {
        when(teacherService.findById(99L)).thenReturn(null);
        ResponseEntity<?> resp = teacherController.findById("99");
        assertEquals(404, resp.getStatusCode().value());
    }

    // ------------------ GET /api/teacher ------------------

    @DisplayName("Get all teachers - success")
    @Test
    void shouldGetAllTeachers() {
        Teacher t1 = new Teacher().setId(1L).setFirstName("John").setLastName("Doe");
        Teacher t2 = new Teacher().setId(2L).setFirstName("Jane").setLastName("Smith");

        when(teacherService.findAll()).thenReturn(List.of(t1, t2));
        when(teacherMapper.toDto(List.of(t1, t2))).thenReturn(
                List.of(
                        new TeacherDto(1L, "John", "Doe", null, null),
                        new TeacherDto(2L, "Jane", "Smith", null, null)
                )
        );

        ResponseEntity<?> resp = teacherController.findAll();
        assertEquals(200, resp.getStatusCode().value());
        assertTrue(resp.getBody() instanceof List);
        assertEquals(2, ((List<?>) resp.getBody()).size());
    }
}
