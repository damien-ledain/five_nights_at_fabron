package fr.univ.fabron.fnaf_fabron.game;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * Service gérant l'état en mémoire vive (RAM) de toutes les parties en cours.
 * Il agit comme le "moteur" du jeu pour valider les actions côté serveur.
 */
@Service
public class GameEngineService {
    
    // QDev : Utilisation de ConcurrentHashMap parfaite pour garantir la Thread-Safety
    // lorsque plusieurs requêtes HTTP modifient l'état simultanément.
    private final Map<Long, GameState> activeGames = new ConcurrentHashMap<>();

    /**
     * Crée et stocke une nouvelle partie pour un joueur.
     * * @param playerId L'ID du joueur.
     * @param nightLevel La difficulté de la nuit.
     */
    public void initGame(Long playerId, int nightLevel) {
        activeGames.put(playerId, new GameState(nightLevel));
    }

    /**
     * Récupère l'état de la partie en cours d'un joueur.
     */
    public GameState getGameState(Long playerId) {
        return activeGames.get(playerId);
    }

    /**
     * Supprime la partie de la mémoire (fin de partie ou Game Over).
     */
    public void removeGame(Long playerId) {
        activeGames.remove(playerId);
    }
}