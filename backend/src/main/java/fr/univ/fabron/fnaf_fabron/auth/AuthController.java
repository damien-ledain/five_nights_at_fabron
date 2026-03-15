package fr.univ.fabron.fnaf_fabron.auth;

import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import fr.univ.fabron.fnaf_fabron.player.Player;
import fr.univ.fabron.fnaf_fabron.player.PlayerRepository;
import fr.univ.fabron.fnaf_fabron.score.Score;
import fr.univ.fabron.fnaf_fabron.score.ScoreRepository;

/**
 * Contrôleur REST gérant l'authentification des joueurs (Inscription et Connexion).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final PlayerRepository playerRepository;
    private final ScoreRepository scoreRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(PlayerRepository playerRepository, ScoreRepository scoreRepository, 
                          PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.playerRepository = playerRepository;
        this.scoreRepository = scoreRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Inscrit un nouveau joueur dans la base de données.
     * * @param request Les identifiants envoyés par le client (DTO).
     * @return ResponseEntity contenant les données du joueur ou un message d'erreur.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        // 1. Vérification si l'utilisateur existe déjà
        if (playerRepository.findByUsername(request.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Nom d'utilisateur déjà pris !");
        }
        
        // 2. Création et sauvegarde du joueur (avec mot de passe haché)
        Player player = new Player();
        player.setUsername(request.username());
        player.setPassword(passwordEncoder.encode(request.password()));
        player.setCurrentNight(1); // On commence toujours à la nuit 1
        player = playerRepository.save(player); 
        
        // 3. Initialisation du score
        Score initialScore = new Score(player, 0, 1);
        scoreRepository.save(initialScore);
        
        // 4. Génération du token et réponse
        String token = jwtUtil.generateToken(player.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, player.getUsername(), 1, 0, 1));
    }

    /**
     * Authentifie un joueur existant et lui délivre un token JWT.
     * * @param request Les identifiants envoyés par le client (DTO).
     * @return ResponseEntity contenant le token et l'état de progression, ou une erreur 401.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<Player> playerOpt = playerRepository.findByUsername(request.username());
        
        // Vérifie que le joueur existe ET que le mot de passe correspond au hash en BDD
        if (playerOpt.isPresent() && passwordEncoder.matches(request.password(), playerOpt.get().getPassword())) {
            Player player = playerOpt.get();
            String token = jwtUtil.generateToken(player.getUsername());

            // Récupère le score, ou le crée dynamiquement s'il manque
            Score playerScore = scoreRepository.findById(player.getId())
                    .orElse(new Score(player, 0, 1)); 

            return ResponseEntity.ok(new AuthResponse(
                    token, 
                    player.getUsername(), 
                    playerScore.getMaxNight(), 
                    playerScore.getScoreValue(), 
                    player.getCurrentNight()
            ));
        }
        
        // 401 Unauthorized
        return ResponseEntity.status(401).body("Identifiants incorrects !");
    }

    // --- REFACTORING : Utilisation des "Records" Java 17 ---
    // Les records génèrent automatiquement les getters, constructeurs, equals et hashCode !
    
    /** DTO pour les requêtes de connexion et d'inscription. */
    public record AuthRequest(String username, String password) {}

    /** DTO pour la réponse renvoyée au front-end après une authentification réussie. */
    public record AuthResponse(String token, String username, int maxNight, int bestScore, int currentNight) {}
}