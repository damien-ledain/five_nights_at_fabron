package fr.univ.fabron.fnaf_fabron.game;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class GameEngineService {
    // Lie l'ID du joueur à sa partie en cours
    private final Map<Long, GameState> activeGames = new ConcurrentHashMap<>();

    public void initGame(Long playerId, int nightLevel) {
        activeGames.put(playerId, new GameState(nightLevel));
    }

    public GameState getGameState(Long playerId) {
        return activeGames.get(playerId);
    }

    public void removeGame(Long playerId) {
        activeGames.remove(playerId);
    }
}