package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserController userController;

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    // ------------------ GET /api/user/{id} ------------------

    @DisplayName("Get user by id - success")
    @Test
    void shouldGetUser() {
        User user = new User();
        user.setId(7L);
        user.setEmail("u@test.com");

        when(userService.findById(7L)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(new UserDto(7L,"u@test.com","LN","FN", false, null, null, null));

        ResponseEntity<?> resp = userController.findById("7");
        assertEquals(200, resp.getStatusCode().value());
        assertTrue(resp.getBody() instanceof UserDto);
    }

    @DisplayName("Get user by id - bad request when ID is not a number")
    @Test
    void shouldReturnBadRequestForInvalidId() {
        ResponseEntity<?> resp = userController.findById("abc");
        assertEquals(400, resp.getStatusCode().value());
    }

    @DisplayName("Get user by id - not found")
    @Test
    void shouldReturnNotFoundIfUserNotExist() {
        when(userService.findById(999L)).thenReturn(null);
        ResponseEntity<?> resp = userController.findById("999");
        assertEquals(404, resp.getStatusCode().value());
    }

    // ------------------ DELETE /api/user/{id} ------------------

    @DisplayName("Delete user - unauthorized when principal differs")
    @Test
    void shouldNotDeleteWhenNotOwner() {
        User user = new User();
        user.setId(8L);
        user.setEmail("owner@test.com");
        when(userService.findById(8L)).thenReturn(user);

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(
                new org.springframework.security.core.userdetails.User(
                        "someone@else.com","pwd", java.util.Collections.emptyList()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        ResponseEntity<?> resp = userController.save("8");
        assertEquals(401, resp.getStatusCode().value());
        verify(userService, never()).delete(anyLong());
    }

    @DisplayName("Delete user - success when principal matches")
    @Test
    void shouldDeleteWhenOwner() {
        User user = new User();
        user.setId(9L);
        user.setEmail("me@test.com");
        when(userService.findById(9L)).thenReturn(user);

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(
                new org.springframework.security.core.userdetails.User(
                        "me@test.com","pwd", java.util.Collections.emptyList()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        ResponseEntity<?> resp = userController.save("9");
        assertEquals(200, resp.getStatusCode().value());
        verify(userService, times(1)).delete(9L);
    }

    @DisplayName("Delete user - bad request when ID is not a number")
    @Test
    void shouldReturnBadRequestOnDeleteInvalidId() {
        ResponseEntity<?> resp = userController.save("abc");
        assertEquals(400, resp.getStatusCode().value());
        verify(userService, never()).delete(anyLong());
    }

    @DisplayName("Delete user - not found when user does not exist")
    @Test
    void shouldReturnNotFoundOnDeleteNonExistingUser() {
        when(userService.findById(123L)).thenReturn(null);

        ResponseEntity<?> resp = userController.save("123");
        assertEquals(404, resp.getStatusCode().value());
        verify(userService, never()).delete(anyLong());
    }
}
