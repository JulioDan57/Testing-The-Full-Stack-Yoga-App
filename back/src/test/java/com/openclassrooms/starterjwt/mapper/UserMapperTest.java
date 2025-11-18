package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperTest {

    private final UserMapper mapper = Mappers.getMapper(UserMapper.class);

    @Test
    @DisplayName("Mapping d'un UserDto vers User")
    void shouldMapToEntity() {
        UserDto dto = new UserDto(
                1L,
                "email@test.com",
                "Doe",
                "John",
                true,
                "password",
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        User entity = mapper.toEntity(dto);

        assertEquals(dto.getId(), entity.getId());
        assertEquals(dto.getEmail(), entity.getEmail());
        assertEquals(dto.getLastName(), entity.getLastName());
        assertEquals(dto.getFirstName(), entity.getFirstName());
        assertEquals(dto.isAdmin(), entity.isAdmin());
        assertEquals(dto.getPassword(), entity.getPassword());
    }

    @Test
    @DisplayName("Mapping d'un User vers UserDto")
    void shouldMapToDto() {
        User entity = User.builder()
                .id(10L)
                .email("ex@test.com")
                .lastName("Lennon")
                .firstName("John")
                .admin(false)
                .password("secret")
                .build();

        UserDto dto = mapper.toDto(entity);

        assertEquals(entity.getId(), dto.getId());
        assertEquals(entity.getEmail(), dto.getEmail());
        assertEquals(entity.getLastName(), dto.getLastName());
        assertEquals(entity.getFirstName(), dto.getFirstName());
        assertEquals(entity.isAdmin(), dto.isAdmin());
    }
}
