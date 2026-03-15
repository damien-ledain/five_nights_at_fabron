package fr.univ.fabron.fnaf_fabron.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
    }

    @Test
    @DisplayName("Doit générer un token valide qui contient le bon nom d'utilisateur")
    void shouldGenerateAndReadToken() {
        // Arrange
        String username = "Hamza";

        // Act
        String token = jwtUtil.generateToken(username);

        // Assert
        assertNotNull(token, "Le token ne doit pas être nul");
        
        // Vérifie qu'on arrive bien à extraire le nom "Hamza" de ce token
        String extractedUsername = jwtUtil.getUsername(token);
        assertEquals(username, extractedUsername, "Le nom extrait doit correspondre au nom d'origine");
    }
}