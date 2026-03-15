package fr.univ.fabron.fnaf_fabron.auth;

import fr.univ.fabron.fnaf_fabron.player.Player;
import fr.univ.fabron.fnaf_fabron.player.PlayerRepository;
import fr.univ.fabron.fnaf_fabron.score.Score;
import fr.univ.fabron.fnaf_fabron.score.ScoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private PlayerRepository playerRepository;
    @Mock private ScoreRepository scoreRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    private Player mockPlayer;

    @BeforeEach
    void setUp() {
        mockPlayer = new Player();
        mockPlayer.setId(1L);
        mockPlayer.setUsername("Nathan");
        mockPlayer.setPassword("hashedPassword");
        mockPlayer.setCurrentNight(2);
    }

    @Test
    @DisplayName("Login : Succès si les identifiants sont corrects")
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        // Arrange
        AuthController.AuthRequest request = new AuthController.AuthRequest("Nathan", "password123");
        
        when(playerRepository.findByUsername("Nathan")).thenReturn(Optional.of(mockPlayer));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("Nathan")).thenReturn("fake-jwt-token");
        
        Score mockScore = new Score(mockPlayer, 5000, 3);
        when(scoreRepository.findById(1L)).thenReturn(Optional.of(mockScore));

        // Act
        ResponseEntity<?> response = authController.login(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        AuthController.AuthResponse authResponse = (AuthController.AuthResponse) response.getBody();
        assertNotNull(authResponse);
        assertEquals("fake-jwt-token", authResponse.token());
        assertEquals("Nathan", authResponse.username());
        assertEquals(3, authResponse.maxNight());
    }

    @Test
    @DisplayName("Login : Erreur 401 si le mot de passe est faux")
    void login_ShouldReturn401_WhenPasswordIsWrong() {
        // Arrange
        AuthController.AuthRequest request = new AuthController.AuthRequest("Nathan", "wrongPass");
        when(playerRepository.findByUsername("Nathan")).thenReturn(Optional.of(mockPlayer));
        when(passwordEncoder.matches("wrongPass", "hashedPassword")).thenReturn(false);

        // Act
        ResponseEntity<?> response = authController.login(request);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Identifiants incorrects !", response.getBody());
    }

    @Test
    @DisplayName("Register : Erreur 400 si le pseudo est déjà pris")
    void register_ShouldReturn400_WhenUsernameExists() {
        // Arrange
        AuthController.AuthRequest request = new AuthController.AuthRequest("Nathan", "password");
        when(playerRepository.findByUsername("Nathan")).thenReturn(Optional.of(mockPlayer));

        // Act
        ResponseEntity<?> response = authController.register(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Nom d'utilisateur déjà pris !", response.getBody());
    }
}