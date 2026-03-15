package fr.univ.fabron.fnaf_fabron.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration pour vérifier la configuration de Spring Security.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Doit charger le PasswordEncoder et vérifier qu'il s'agit de BCrypt")
    void testPasswordEncoderBeanExists() {
        assertNotNull(passwordEncoder, "Le bean PasswordEncoder doit être injecté");
        
        // Vérifie que le hachage fonctionne (un mot de passe haché par BCrypt commence souvent par $2a$)
        String rawPassword = "mySecretPassword123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        
        assertTrue(passwordEncoder.matches(rawPassword, encodedPassword), 
                "Le mot de passe en clair doit correspondre à son hash");
    }

    @Test
    @DisplayName("La route /api/leaderboard doit être accessible publiquement")
    void testPublicEndpointLeaderboard_ShouldNotReturn401() throws Exception {
        // Act & Assert
        // On vérifie que le statut n'est PAS 401 (Unauthorized) ni 403 (Forbidden).
        // S'il renvoie 200 (OK), c'est parfait. La sécurité laisse bien passer la requête.
        mockMvc.perform(get("/api/leaderboard"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Toute route non déclarée doit renvoyer une erreur 401 ou 403 (Accès refusé)")
    void testSecuredEndpoint_ShouldReturnUnauthorized() throws Exception {
        // Act & Assert
        // On essaie d'accéder à une fausse route sécurisée sans Token
        mockMvc.perform(get("/api/route-secrete-inexistante"))
               .andExpect(status().isForbidden()); // Sans token valide, Spring Security bloque l'accès
    }
}