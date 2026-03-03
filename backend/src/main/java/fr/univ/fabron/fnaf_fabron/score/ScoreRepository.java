package fr.univ.fabron.fnaf_fabron.score;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    
    // Pour le Leaderboard global
    List<Score> findTop10ByOrderByScoreValueDesc();
    
    // Plus besoin de requêtes complexes ici pour trouver le meilleur score d'un joueur, 
    // on utilisera simplement la méthode de base findById() !
}