package fr.univ.fabron.fnaf_fabron.player;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests d'intégration pour le PlayerRepository.
 * @DataJpaTest charge uniquement le contexte lié à la base de données 
 * (plus rapide et isolé du reste de l'application).
 */
@DataJpaTest(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class PlayerRepositoryTest {

    @Autowired
    private PlayerRepository playerRepository;

    @BeforeEach
    void setUp() {
        // Nettoyage avant chaque test pour être sûr de repartir à zéro
        playerRepository.deleteAll();

        // Création d'un joueur fictif en base
        Player player = new Player();
        player.setUsername("Damien");
        player.setPassword("hash1234");
        player.setCurrentNight(3);
        
        playerRepository.save(player);
    }

    @Test
    @DisplayName("Doit trouver un joueur existant par son pseudo (Happy Path)")
    void findByUsername_ShouldReturnPlayer_WhenUsernameExists() {
        // Act
        Optional<Player> result = playerRepository.findByUsername("Damien");

        // Assert
        assertTrue(result.isPresent(), "Le joueur devrait être trouvé");
        assertEquals("Damien", result.get().getUsername(), "Le pseudo doit correspondre");
        assertEquals(3, result.get().getCurrentNight(), "La nuit doit être sauvegardée correctement");
    }

    @Test
    @DisplayName("Ne doit rien retourner si le joueur n'existe pas (Edge Case)")
    void findByUsername_ShouldReturnEmpty_WhenUsernameDoesNotExist() {
        // Act
        Optional<Player> result = playerRepository.findByUsername("Inconnu");

        // Assert
        assertFalse(result.isPresent(), "L'Optional doit être vide si le joueur n'existe pas");
    }

    @Test
    @DisplayName("La contrainte de setter sur currentNight empêche de descendre sous 1")
    void setCurrentNight_ShouldNotAllowZeroOrNegative() {
        // Arrange
        Player newPlayer = new Player();
        newPlayer.setUsername("TestUser");
        newPlayer.setPassword("pass");

        // Act
        newPlayer.setCurrentNight(0); // On essaie de forcer 0
        newPlayer.setCurrentNight(-5); // On essaie de forcer -5

        // Assert
        assertEquals(1, newPlayer.getCurrentNight(), "La nuit ne doit pas pouvoir descendre sous 1");
    }
}