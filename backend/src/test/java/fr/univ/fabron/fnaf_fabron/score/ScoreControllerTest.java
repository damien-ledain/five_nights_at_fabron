package fr.univ.fabron.fnaf_fabron.score;
import fr.univ.fabron.fnaf_fabron.player.Player;
import fr.univ.fabron.fnaf_fabron.score.Score;
import fr.univ.fabron.fnaf_fabron.score.ScoreController;
import fr.univ.fabron.fnaf_fabron.score.ScoreRepository;
import fr.univ.fabron.fnaf_fabron.score.ScoreController.LeaderboardEntryDTO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

/**
 * Tests unitaires pour la classe ScoreController.
 */
@ExtendWith(MockitoExtension.class)
public class ScoreControllerTest {

    @Mock
    private ScoreRepository scoreRepository;

    @InjectMocks
    private ScoreController scoreController;

    private Score score1;
    private Score score2;

    @BeforeEach
    void setUp() {
        // Initialisation des données fictives pour les tests
        Player player1 = new Player();
        player1.setUsername("Hamza");
        
        Player player2 = new Player();
        player2.setUsername("Nathan");

        score1 = new Score(player1, 5000, 5);
        score2 = new Score(player2, 3000, 3);
    }

    @Test
    @DisplayName("Doit retourner le leaderboard formaté correctement (Happy Path)")
    void getLeaderboard_ShouldReturnFormattedTopScores() {
        // Arrange : On simule le comportement du repository
        when(scoreRepository.findTop10ByOrderByScoreValueDesc())
                .thenReturn(Arrays.asList(score1, score2));

        // Act : Appel de la méthode du contrôleur
        List<ScoreController.LeaderboardEntryDTO> result = scoreController.getLeaderboard();

        // Assert : Vérifications
        assertEquals(2, result.size(), "Le leaderboard doit contenir 2 entrées.");
        
        // Vérification du mapping (Entité -> DTO)
        assertEquals("Hamza", result.get(0).playerName());
        assertEquals(5000, result.get(0).scoreValue());
        
        assertEquals("Nathan", result.get(1).playerName());
        assertEquals(3000, result.get(1).scoreValue());

        // Vérifie que le repository a bien été appelé une seule fois
        verify(scoreRepository, times(1)).findTop10ByOrderByScoreValueDesc();
    }

    @Test
    @DisplayName("Doit retourner une liste vide si aucun score n'existe (Edge Case)")
    void getLeaderboard_ShouldReturnEmptyList_WhenNoScores() {
        // Arrange
        when(scoreRepository.findTop10ByOrderByScoreValueDesc())
                .thenReturn(Collections.emptyList());

        // Act
        List<ScoreController.LeaderboardEntryDTO> result = scoreController.getLeaderboard();

        // Assert
        assertTrue(result.isEmpty(), "La liste doit être vide si la BDD est vide.");
        verify(scoreRepository, times(1)).findTop10ByOrderByScoreValueDesc();
    }
}