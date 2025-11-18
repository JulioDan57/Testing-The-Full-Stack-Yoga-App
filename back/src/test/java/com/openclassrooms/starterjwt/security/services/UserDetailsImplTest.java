package com.openclassrooms.starterjwt.security.services;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collection;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

class UserDetailsImplTest {

    private UserDetailsImpl user;

    @BeforeEach
    void setUp() {
        user = UserDetailsImpl.builder()
                .id(1L)
                .username("john.doe")
                .firstName("John")
                .lastName("Doe")
                .admin(true)
                .password("secret")
                .build();
    }

    @Test
    @DisplayName("Test des getters de UserDetailsImpl")
    void testGetters() {
        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getUsername()).isEqualTo("john.doe");
        assertThat(user.getFirstName()).isEqualTo("John");
        assertThat(user.getLastName()).isEqualTo("Doe");
        assertThat(user.getPassword()).isEqualTo("secret");
        assertThat(user.getAdmin()).isTrue();
    }

    @Test
    @DisplayName("Test de la récupération des autorités (devrait être vide)")
    void testGetAuthorities() {
        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        assertThat(authorities).isNotNull();
        assertThat(authorities).isEmpty();
    }

    @Test
    @DisplayName("Test des méthodes de statut du compte (non expiré, non verrouillé, etc.)")
    void testAccountStatusMethods() {
        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();
        assertThat(user.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("Test de l'égalité avec le même objet")
    void testEquals_sameObject() {
        assertThat(user).isEqualTo(user);
    }

    @Test
    @DisplayName("Test de l'égalité avec un autre objet ayant le même ID")
    void testEquals_differentObjectSameId() {
        UserDetailsImpl user2 = UserDetailsImpl.builder()
                .id(1L)
                .username("other")
                .firstName("Other")
                .lastName("User")
                .admin(false)
                .password("otherpass")
                .build();
        assertThat(user).isEqualTo(user2);
    }

    @Test
    @DisplayName("Test de l'inégalité avec un objet ayant un ID différent")
    void testEquals_differentObjectDifferentId() {
        UserDetailsImpl user2 = UserDetailsImpl.builder()
                .id(2L)
                .username("other")
                .firstName("Other")
                .lastName("User")
                .admin(false)
                .password("otherpass")
                .build();
        assertThat(user).isNotEqualTo(user2);
    }

    @Test
    @DisplayName("Test de l'inégalité avec null")
    void testEquals_null() {
        assertThat(user).isNotEqualTo(null);
    }

    @Test
    @DisplayName("Test de l'inégalité avec un objet d'une autre classe")
    void testEquals_differentClass() {
        assertThat(user).isNotEqualTo("some string");
    }
}
