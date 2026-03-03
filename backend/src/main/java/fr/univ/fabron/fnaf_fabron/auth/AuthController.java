package fr.univ.fabron.fnaf_fabron.auth;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.univ.fabron.fnaf_fabron.player.Player;
import fr.univ.fabron.fnaf_fabron.player.PlayerRepository;
import fr.univ.fabron.fnaf_fabron.score.Score;
import fr.univ.fabron.fnaf_fabron.score.ScoreRepository;

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
        
        Player player = new Player();
        player.setUsername(request.getUsername());
        player.setPassword(passwordEncoder.encode(request.getPassword()));
        player.setCurrentNight(1); // Commence nuit 1
        player = playerRepository.save(player); 
        
        Score initialScore = new Score(player, 0, 1);
        scoreRepository.save(initialScore);
        
        String token = jwtUtil.generateToken(player.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, player.getUsername(), 1, 0, 1));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<Player> playerOpt = playerRepository.findByUsername(request.getUsername());
        
        if (playerOpt.isPresent() && passwordEncoder.matches(request.getPassword(), playerOpt.get().getPassword())) {
            Player player = playerOpt.get();
            String token = jwtUtil.generateToken(player.getUsername());

            Score playerScore = scoreRepository.findById(player.getId())
                    .orElse(new Score(player, 0, 1)); 

            // On envoie aussi player.getCurrentNight() au front
            return ResponseEntity.ok(new AuthResponse(token, player.getUsername(), playerScore.getMaxNight(), playerScore.getScoreValue(), player.getCurrentNight()));
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
        public int currentNight;
        public AuthResponse(String token, String username, int maxNight, int bestScore, int currentNight) {
            this.token = token; this.username = username; this.maxNight = maxNight; this.bestScore = bestScore; this.currentNight = currentNight;
        }
    }
}