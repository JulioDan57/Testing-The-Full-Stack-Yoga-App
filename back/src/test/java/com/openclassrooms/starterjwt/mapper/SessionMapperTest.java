package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SessionMapperTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private UserService userService;

    @InjectMocks
    private SessionMapperImpl mapper;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Mapping d'un SessionDto vers Session avec teacher et users")
    void shouldMapToEntity() {
        Teacher teacher = Teacher.builder().id(5L).firstName("John").build();
        User user1 = User.builder().id(1L).email("a@test.com").lastName("A").firstName("A").password("p").admin(false).build();
        User user2 = User.builder().id(2L).email("b@test.com").lastName("B").firstName("B").password("p").admin(false).build();

        when(teacherService.findById(5L)).thenReturn(teacher);
        when(userService.findById(1L)).thenReturn(user1);
        when(userService.findById(2L)).thenReturn(user2);

        SessionDto dto = new SessionDto(
                10L,
                "Yoga",
                new Date(),
                5L,
                "Good session",
                Arrays.asList(1L, 2L),
                null, null
        );

        Session session = mapper.toEntity(dto);

        assertEquals(dto.getName(), session.getName());
        assertEquals(teacher, session.getTeacher());
        assertEquals(2, session.getUsers().size());
    }

    @Test
    @DisplayName("Mapping d'un SessionDto vers Session sans teacher")
    void shouldMapToEntityWithNullTeacher() {
        SessionDto dto = new SessionDto(
                10L, "Yoga", new Date(),
                null, "desc", Collections.emptyList(),
                null, null
        );

        Session session = mapper.toEntity(dto);
        assertNull(session.getTeacher());
        assertEquals(0, session.getUsers().size());
    }

    @Test
    @DisplayName("Mapping d'un Session vers SessionDto avec teacher et users")
    void shouldMapToDto() {
        Teacher teacher = Teacher.builder().id(7L).build();
        User u1 = User.builder().id(1L).email("a@a.com").lastName("A").firstName("A").password("p").admin(false).build();
        User u2 = User.builder().id(2L).email("b@b.com").lastName("B").firstName("B").password("p").admin(false).build();

        Session session = Session.builder()
                .id(88L)
                .name("Meditation")
                .date(new Date())
                .teacher(teacher)
                .description("desc")
                .users(Arrays.asList(u1, u2))
                .build();

        SessionDto dto = mapper.toDto(session);

        assertEquals(7L, dto.getTeacher_id());
        assertEquals(2, dto.getUsers().size());
        assertEquals("Meditation", dto.getName());
    }
}
