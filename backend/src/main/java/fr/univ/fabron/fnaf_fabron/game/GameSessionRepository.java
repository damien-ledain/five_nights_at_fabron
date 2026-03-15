package fr.univ.fabron.fnaf_fabron.game;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import fr.univ.fabron.fnaf_fabron.player.Player;

/**
 * Repository pour l'accès aux données des sessions de jeu.
 */
@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    
    /**
     * Récupère la liste des sessions actuellement actives pour un joueur.
     * * @param player Le joueur concerné.
     * @return Une liste de sessions (idéalement de taille 1 ou 0).
     */
    List<GameSession> findByPlayerAndActiveTrue(Player player);
}