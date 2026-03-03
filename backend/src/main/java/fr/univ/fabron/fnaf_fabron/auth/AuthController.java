package fr.univ.fabron.fnaf_fabron.auth;

import fr.univ.fabron.fnaf_fabron.player.Player;
import fr.univ.fabron.fnaf_fabron.player.PlayerRepository;
import fr.univ.fabron.fnaf_fabron.score.Score;
import fr.univ.fabron.fnaf_fabron.score.ScoreRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final PlayerRepository playerRepository;
    private final ScoreRepository scoreRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(PlayerRepository playerRepository, ScoreRepository scoreRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.playerRepository = playerRepository;
        this.scoreRepository = scoreRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (playerRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Nom d'utilisateur déjà pris !");
        }
        
        // 1. On crée et on sauvegarde le joueur
        Player player = new Player();
        player.setUsername(request.getUsername());
        player.setPassword(passwordEncoder.encode(request.getPassword()));
        player = playerRepository.save(player); // La sauvegarde lui génère un ID
        
        // 2. On crée sa ligne de score unique avec le même ID
        Score initialScore = new Score(player, 0, 1);
        scoreRepository.save(initialScore);
        
        String token = jwtUtil.generateToken(player.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, player.getUsername(), 1, 0));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<Player> playerOpt = playerRepository.findByUsername(request.getUsername());
        
        if (playerOpt.isPresent() && passwordEncoder.matches(request.getPassword(), playerOpt.get().getPassword())) {
            Player player = playerOpt.get();
            String token = jwtUtil.generateToken(player.getUsername());

            // 3. On récupère le score du joueur en cherchant avec l'ID du joueur
            Score playerScore = scoreRepository.findById(player.getId())
                    .orElse(new Score(player, 0, 1)); // Sécurité au cas où la ligne n'existe pas

            return ResponseEntity.ok(new AuthResponse(token, player.getUsername(), playerScore.getMaxNight(), playerScore.getScoreValue()));
        }
        
        return ResponseEntity.status(401).body("Identifiants incorrects !");
    }

    public static class AuthRequest {
        private String username;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        public String token;
        public String username;
        public int maxNight;
        public int bestScore;
        public AuthResponse(String token, String username, int maxNight, int bestScore) {
            this.token = token; this.username = username; this.maxNight = maxNight; this.bestScore = bestScore;
        }
    }
}