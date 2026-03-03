package fr.univ.fabron.fnaf_fabron.game;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fr.univ.fabron.fnaf_fabron.player.Player;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    
    // On remplace Optional par List pour éviter les crashs s'il y a des sessions fantômes
    List<GameSession> findByPlayerAndActiveTrue(Player player);
}