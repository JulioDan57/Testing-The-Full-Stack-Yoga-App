package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class UserDetailsServiceImplIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @BeforeEach
    void setup() {
        // On vide la table pour avoir un contexte propre
        userRepository.deleteAll();

        // Création d’un utilisateur de test
        User u = new User();
        u.setEmail("john@yoga.com");
        u.setPassword("encodedPassword"); // peu importe
        u.setFirstName("John");
        u.setLastName("Doe");
        u.setAdmin(true);

        userRepository.save(u);
    }

    @Test
    @DisplayName("UserDetailsServiceImpl – email introuvable doit lever UsernameNotFoundException")
    void testLoadUserByUsernameNotFound() {
        assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("unknown@yoga.com")
        );
    }
}
