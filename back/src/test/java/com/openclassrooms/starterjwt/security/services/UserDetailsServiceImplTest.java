package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("loadUserByUsername → utilisateur trouvé")
    void testLoadUserFound() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@mail.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPassword("hashed");

        when(userRepository.findByEmail("test@mail.com"))
                .thenReturn(Optional.of(user));

        UserDetailsImpl details =
                (UserDetailsImpl) userDetailsService.loadUserByUsername("test@mail.com");

        assertEquals("test@mail.com", details.getUsername());
        assertEquals("hashed", details.getPassword());
    }

    @Test
    @DisplayName("loadUserByUsername → utilisateur non trouvé")
    void testLoadUserNotFound() {
        when(userRepository.findByEmail("unknown@mail.com"))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("unknown@mail.com"));
    }


    // ---------------------------------------------------------
    // equals()
    // ---------------------------------------------------------
    @Test
    @DisplayName("equals() – UserDetailsImpl avec même ID doivent être égaux")
    void testEqualsSameId() {
        UserDetailsImpl u1 = UserDetailsImpl.builder().id(10L).build();
        UserDetailsImpl u2 = UserDetailsImpl.builder().id(10L).build();

        assertEquals(u1, u2);
    }

    @Test
    @DisplayName("equals() – UserDetailsImpl avec IDs différents ne doivent pas être égaux")
    void testEqualsDifferentId() {
        UserDetailsImpl u1 = UserDetailsImpl.builder().id(1L).build();
        UserDetailsImpl u2 = UserDetailsImpl.builder().id(2L).build();

        assertNotEquals(u1, u2);
    }

    @Test
    @DisplayName("equals() – comparaison avec null")
    void testEqualsNull() {
        UserDetailsImpl u1 = UserDetailsImpl.builder().id(1L).build();
        assertNotEquals(u1, null);
    }

    @Test
    @DisplayName("equals() – même instance")
    void testEqualsSameInstance() {
        UserDetailsImpl u1 = UserDetailsImpl.builder().id(3L).build();
        assertEquals(u1, u1);
    }

    @Test
    @DisplayName("equals() – comparaison avec autre type")
    void testEqualsDifferentClass() {
        UserDetailsImpl u1 = UserDetailsImpl.builder().id(1L).build();
        assertNotEquals(u1, "not a user");
    }
}
