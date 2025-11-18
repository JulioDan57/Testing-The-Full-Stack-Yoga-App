package com.openclassrooms.starterjwt.payload.response;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtResponseTest {

    @Test
    @DisplayName("Test du constructeur et des getters de JwtResponse")
    void constructorAndGetters() {
        JwtResponse jwt = new JwtResponse("token123", 1L, "john.doe", "John", "Doe", true);

        assertThat(jwt.getToken()).isEqualTo("token123");
        assertThat(jwt.getType()).isEqualTo("Bearer");
        assertThat(jwt.getId()).isEqualTo(1L);
        assertThat(jwt.getUsername()).isEqualTo("john.doe");
        assertThat(jwt.getFirstName()).isEqualTo("John");
        assertThat(jwt.getLastName()).isEqualTo("Doe");
        assertThat(jwt.getAdmin()).isTrue();
    }
}
