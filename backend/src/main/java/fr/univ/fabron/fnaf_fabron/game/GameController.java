package fr.univ.fabron.fnaf_fabron.game;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    private static final int SECONDS_PER_HOUR = 60; 
    private static final int TOTAL_NIGHT_HOURS = 6; 

    private final GameSessionRepository gameSessionRepository;
    private final PlayerRepository playerRepository;
    private final ScoreRepository scoreRepository;
    private final JwtUtil jwtUtil;
    
    private final GameEngineService gameEngine;

    public GameController(GameSessionRepository gameSessionRepository, PlayerRepository playerRepository, ScoreRepository scoreRepository, JwtUtil jwtUtil, GameEngineService gameEngine) {
        this.gameSessionRepository = gameSessionRepository;
        this.playerRepository = playerRepository;
        this.scoreRepository = scoreRepository;
        this.jwtUtil = jwtUtil;
        this.gameEngine = gameEngine;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startGame(@RequestHeader("Authorization") String authHeader) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

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

        gameEngine.initGame(player.getId(), currentNight);

        return ResponseEntity.ok(Map.of("message", "Nuit commencée", "night", currentNight));
    }

    @PostMapping("/state")
    public ResponseEntity<?> syncGameState(@RequestHeader("Authorization") String authHeader, @RequestBody(required = false) Map<String, Object> playerActions) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

        GameState memoryState = gameEngine.getGameState(player.getId());
        if (memoryState == null) return ResponseEntity.badRequest().body("Partie non initialisée en mémoire");

        // 1. Mettre à jour l'état envoyé par le front (Portes, Fenêtre, Caméra)
        if (playerActions != null) {
            if (playerActions.containsKey("rightDoorClosed")) memoryState.setRightDoorClosed((Boolean) playerActions.get("rightDoorClosed"));
            if (playerActions.containsKey("leftDoorClosed")) memoryState.setLeftDoorClosed((Boolean) playerActions.get("leftDoorClosed"));
            if (playerActions.containsKey("windowClosed")) memoryState.setWindowClosed((Boolean) playerActions.get("windowClosed"));
            if (playerActions.containsKey("currentCamera")) {
                Object cam = playerActions.get("currentCamera");
                memoryState.setCurrentCamera(cam != null ? cam.toString() : "");
            }
        }

        // 2. Faire calculer l'IA (mouvements)
        memoryState.updateAll();

        List<GameSession> sessions = gameSessionRepository.findByPlayerAndActiveTrue(player);
        if (sessions.isEmpty()) return ResponseEntity.badRequest().body("Aucune partie en base");

        GameSession session = sessions.get(0);
        long secondsElapsed = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();

        int hoursPassed = (int) (secondsElapsed / SECONDS_PER_HOUR);
        int currentHour = (hoursPassed == 0) ? 12 : hoursPassed;
        
        Map<String, Object> stateResponse = new HashMap<>();
        stateResponse.put("currentHour", currentHour);
        stateResponse.put("nightLevel", session.getNightLevel());
        stateResponse.put("status", "PLAYING");

        // 3. Ajouter les positions des animatroniques pour le Front-end
        Map<String, String> positions = new HashMap<>();
        memoryState.getAnimatronics().forEach((name, anim) -> positions.put(name, anim.getCurrentLocation()));
        stateResponse.put("positions", positions);

        // Transmettre les événements audio
        List<String> events = memoryState.consumeEvents();
        if (!events.isEmpty()) {
            stateResponse.put("events", events);
        }

        // 4. CONDITIONS DE FIN
        if (memoryState.isGameOver()) {
            stateResponse.put("status", "JUMPSCARE");
            stateResponse.put("jumpscareAnimatronic", memoryState.getJumpscareAnimatronic());
            gameEngine.removeGame(player.getId()); 
            
        } else if (hoursPassed >= TOTAL_NIGHT_HOURS) {
            stateResponse.put("status", "WON");
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
            
            stateResponse.put("newCurrentNight", player.getCurrentNight());
            stateResponse.put("newBestScore", score.getScoreValue());
            
            gameEngine.removeGame(player.getId()); 
        }

        return ResponseEntity.ok(stateResponse);
    }

    @PostMapping("/gameover")
    public ResponseEntity<?> gameOver(@RequestHeader("Authorization") String authHeader) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

        gameEngine.removeGame(player.getId());

        Score score = scoreRepository.findById(player.getId()).orElseThrow();
        
        List<GameSession> sessions = gameSessionRepository.findByPlayerAndActiveTrue(player);
        if (!sessions.isEmpty()) {
            GameSession session = sessions.get(0); 
            
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

            for (GameSession s : sessions) {
                s.setActive(false);
            }
            gameSessionRepository.saveAll(sessions);
        }

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

    @PostMapping("/dev/move")
    public ResponseEntity<?> devMoveAnimatronic(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> request) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

        // SÉCURITÉ : Seulement Hamza, Nathan, Damien
        if (!List.of("Hamza", "Nathan", "Damien").contains(player.getUsername())) {
            return ResponseEntity.status(403).body("Accès refusé. Réservé aux développeurs.");
        }

        GameState memoryState = gameEngine.getGameState(player.getId());
        if (memoryState == null) return ResponseEntity.badRequest().body("Partie non initialisée");

        String direction = request.get("direction");
        String animatronicName = request.getOrDefault("animatronic", "Bluebear"); 
        Animatronic anim = memoryState.getAnimatronics().get(animatronicName);
        
        if (anim != null) {
            anim.forceMove("forward".equals(direction), memoryState);
        }

        return ResponseEntity.ok(Map.of("message", animatronicName + " moved " + direction));
    }

    @PostMapping("/dev/set-night")
    public ResponseEntity<?> devSetNight(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Integer> request) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

        // SÉCURITÉ : Seulement Hamza, Nathan, Damien
        if (!List.of("Hamza", "Nathan", "Damien").contains(player.getUsername())) {
            return ResponseEntity.status(403).body("Accès refusé. Réservé aux développeurs.");
        }

        int targetNight = request.getOrDefault("night", 1);
        
        // On force la nuit du joueur
        player.setCurrentNight(targetNight);
        playerRepository.save(player);

        return ResponseEntity.ok(Map.of("message", "Nuit modifiée", "night", targetNight));
    }

    @PostMapping("/dev/jumpscare")
    public ResponseEntity<?> devForceJumpscare(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> request) {
        Player player = getPlayerFromToken(authHeader);
        if (player == null) return ResponseEntity.status(401).body("Non autorisé");

        // SÉCURITÉ : Seulement Hamza, Nathan, Damien
        if (!List.of("Hamza", "Nathan", "Damien").contains(player.getUsername())) {
            return ResponseEntity.status(403).body("Accès refusé. Réservé aux développeurs.");
        }

        GameState memoryState = gameEngine.getGameState(player.getId());
        if (memoryState == null) return ResponseEntity.badRequest().body("Partie non initialisée");

        // On récupère le nom de l'animatronique sélectionné
        String animatronicName = request.getOrDefault("animatronic", "Bluebear"); 
        
        // On force immédiatement la fin de la partie avec ce screamer
        memoryState.setGameOver(true);
        memoryState.setJumpscareAnimatronic(animatronicName);

        return ResponseEntity.ok(Map.of("message", "Jumpscare forcé pour " + animatronicName));
    }
}