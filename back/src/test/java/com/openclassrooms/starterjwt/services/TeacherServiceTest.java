package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("findAll → retourne la liste complète")
    void testFindAll() {
        Teacher t1 = new Teacher();
        Teacher t2 = new Teacher();

        when(teacherRepository.findAll()).thenReturn(Arrays.asList(t1, t2));

        assertEquals(2, teacherService.findAll().size());
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findById → trouvé")
    void testFindByIdFound() {
        Teacher teacher = new Teacher();
        teacher.setId(1L);

        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        assertNotNull(teacherService.findById(1L));
        assertEquals(1L, teacherService.findById(1L).getId());
    }

    @Test
    @DisplayName("findById → non trouvé retourne null")
    void testFindByIdNotFound() {
        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());

        assertNull(teacherService.findById(99L));
    }
}
