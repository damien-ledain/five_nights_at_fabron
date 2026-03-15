package fr.univ.fabron.fnaf_fabron.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests pour valider la logique du moteur de jeu en mémoire.
 */
class GameEngineServiceTest {

    private GameEngineService gameEngine;

    @BeforeEach
    void setUp() {
        gameEngine = new GameEngineService();
    }

    @Test
    @DisplayName("Doit créer et stocker une nouvelle partie correctement")
    void testInitGame() {
        Long playerId = 1L;
        int nightLevel = 3;

        gameEngine.initGame(playerId, nightLevel);
        GameState state = gameEngine.getGameState(playerId);

        assertNotNull(state, "Le GameState devrait exister dans le moteur");
        assertFalse(state.isGameOver(), "La partie ne devrait pas être en GameOver dès le début");
    }

    @Test
    @DisplayName("Doit supprimer une partie terminée de la mémoire")
    void testRemoveGame() {
        Long playerId = 99L;
        
        gameEngine.initGame(playerId, 1);
        assertNotNull(gameEngine.getGameState(playerId));

        gameEngine.removeGame(playerId);
        assertNull(gameEngine.getGameState(playerId), "Le GameState devrait être supprimé après removeGame()");
    }
}