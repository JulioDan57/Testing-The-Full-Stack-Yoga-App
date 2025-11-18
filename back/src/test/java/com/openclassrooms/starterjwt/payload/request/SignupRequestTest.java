package com.openclassrooms.starterjwt.payload.request;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SignupRequestTest {

    @Test
    @DisplayName("Test des getters et setters de SignupRequest")
    void gettersAndSetters() {
        SignupRequest signup = new SignupRequest();
        signup.setEmail("john@example.com");
        signup.setFirstName("John");
        signup.setLastName("Doe");
        signup.setPassword("secret123");

        assertThat(signup.getEmail()).isEqualTo("john@example.com");
        assertThat(signup.getFirstName()).isEqualTo("John");
        assertThat(signup.getLastName()).isEqualTo("Doe");
        assertThat(signup.getPassword()).isEqualTo("secret123");
    }
}
