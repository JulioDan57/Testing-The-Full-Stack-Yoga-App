package com.openclassrooms.starterjwt.payload.response;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MessageResponseTest {

    @Test
    @DisplayName("Test du constructeur et des getters/setters de MessageResponse")
    void constructorAndGettersSetters() {
        MessageResponse msg = new MessageResponse("Success");
        assertThat(msg.getMessage()).isEqualTo("Success");

        msg.setMessage("Error");
        assertThat(msg.getMessage()).isEqualTo("Error");
    }
}
