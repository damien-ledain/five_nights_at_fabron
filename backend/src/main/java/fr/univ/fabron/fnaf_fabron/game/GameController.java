package fr.univ.fabron.fnaf_fabron.game;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.univ.fabron.fnaf_fabron.auth.JwtUtil;
import fr.univ.fabron.fnaf_fabron.player.Player;
import fr.univ.fabron.fnaf_fabron.player.PlayerRepository;
import fr.univ.fabron.fnaf_fabron.score.Score;
import fr.univ.fabron.fnaf_fabron.score.ScoreRepository;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*")
public class GameController {

    private static final int SECONDS_PER_HOUR = 10; 
    private static final int TOTAL_NIGHT_HOURS = 6; 

    private final GameSessionRepository gameSessionRepository;
    private final PlayerRepository playerRepository;
    private final ScoreRepository scoreRepository;
    private final JwtUtil jwtUtil;

    public GameController(GameSessionRepository gameSessionRepository, PlayerRepository playerRepository, ScoreRepository scoreRepository, JwtUtil jwtUtil) {
        this.gameSessionRepository = gameSessionRepository;
        this.playerRepository = playerRepository;
        this.scoreRepository = scoreRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startGame(@RequestHeader("Authorization") String authHeader) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

        // On récupère TOUTES les anciennes sessions bloquées en true et on les désactive
        List<GameSession> oldSessions = gameSessionRepository.findByPlayerAndActiveTrue(player);
        for (GameSession oldSession : oldSessions) {
            oldSession.setActive(false);
        }
        if (!oldSessions.isEmpty()) {
            gameSessionRepository.saveAll(oldSessions);
        }

        int currentNight = player.getCurrentNight();

        GameSession session = new GameSession();
        session.setPlayer(player);
        session.setNightLevel(currentNight);
        session.setActive(true);
        session.setStartTime(LocalDateTime.now());
        gameSessionRepository.save(session);

        return ResponseEntity.ok(Map.of("message", "Nuit commencée", "night", currentNight));
    }

    @GetMapping("/state")
    public ResponseEntity<?> getGameState(@RequestHeader("Authorization") String authHeader) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

        List<GameSession> sessions = gameSessionRepository.findByPlayerAndActiveTrue(player);
        if (sessions.isEmpty()) return ResponseEntity.badRequest().body("Aucune partie en cours");

        // S'il y en a plusieurs, on prend la première de la liste
        GameSession session = sessions.get(0);
        long secondsElapsed = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();

        int hoursPassed = (int) (secondsElapsed / SECONDS_PER_HOUR);
        int currentHour = (hoursPassed == 0) ? 12 : hoursPassed;
        
        Map<String, Object> state = new HashMap<>();
        state.put("currentHour", currentHour);
        state.put("nightLevel", session.getNightLevel());
        state.put("status", "PLAYING");

        // CONDITIONS DE VICTOIRE
        if (hoursPassed >= TOTAL_NIGHT_HOURS) {
            state.put("status", "WON");
            session.setActive(false);
            gameSessionRepository.save(session);
            
            Score score = scoreRepository.findById(player.getId()).orElseThrow();
            
            int runScore = player.getCurrentNight() * 1000;
            if (runScore > score.getScoreValue()) {
                score.setScoreValue(runScore);
            }
            
            player.setCurrentNight(player.getCurrentNight() + 1);
            playerRepository.save(player);
            
            if (player.getCurrentNight() > score.getMaxNight()) {
                score.setMaxNight(player.getCurrentNight());
            }
            scoreRepository.save(score);
            
            state.put("newCurrentNight", player.getCurrentNight());
            state.put("newBestScore", score.getScoreValue());
        }

        return ResponseEntity.ok(state);
    }

    @PostMapping("/gameover")
    public ResponseEntity<?> gameOver(@RequestHeader("Authorization") String authHeader) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

        Score score = scoreRepository.findById(player.getId()).orElseThrow();
        
        List<GameSession> sessions = gameSessionRepository.findByPlayerAndActiveTrue(player);
        if (!sessions.isEmpty()) {
            GameSession session = sessions.get(0); // On calcule le score sur la première session trouvée
            
            long secondsElapsed = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();
            int totalNightSeconds = SECONDS_PER_HOUR * TOTAL_NIGHT_HOURS;
            
            if (secondsElapsed > totalNightSeconds) secondsElapsed = totalNightSeconds;
            
            int completedNights = player.getCurrentNight() - 1;
            int partialScore = (int) (((double) secondsElapsed / totalNightSeconds) * 1000);
            int totalScore = (completedNights * 1000) + partialScore;

            if (totalScore > score.getScoreValue()) {
                score.setScoreValue(totalScore);
                scoreRepository.save(score);
            }

            // On désactive TOUTES les sessions en cours
            for (GameSession s : sessions) {
                s.setActive(false);
            }
            gameSessionRepository.saveAll(sessions);
        }

        // Remise à zéro de la série après la mort
        player.setCurrentNight(1);
        playerRepository.save(player);

        return ResponseEntity.ok(Map.of(
            "message", "Game Over", 
            "currentNight", 1, 
            "bestScore", score.getScoreValue()
        ));
    }

    private Player getPlayerFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        try {
            String username = jwtUtil.getUsername(token); 
            return playerRepository.findByUsername(username).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}