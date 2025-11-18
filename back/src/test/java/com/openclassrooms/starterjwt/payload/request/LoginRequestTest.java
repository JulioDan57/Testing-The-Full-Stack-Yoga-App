package com.openclassrooms.starterjwt.payload.request;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LoginRequestTest {

    @Test
    @DisplayName("Test des getters et setters de LoginRequest")
    void gettersAndSetters() {
        LoginRequest login = new LoginRequest();
        login.setEmail("john@example.com");
        login.setPassword("secret");

        assertThat(login.getEmail()).isEqualTo("john@example.com");
        assertThat(login.getPassword()).isEqualTo("secret");
    }
}
