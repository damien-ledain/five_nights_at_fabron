package fr.univ.fabron.fnaf_fabron.score;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository permettant l'accès aux données des scores dans la base de données.
 * Hérite des opérations CRUD standard de JpaRepository.
 */
@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    
    /**
     * Récupère les 10 meilleurs scores globaux.
     * * Pourquoi utiliser le nommage de méthode Spring Data ?
     * Cela permet à Hibernate de générer automatiquement la requête SQL :
     * "SELECT * FROM scores ORDER BY score_value DESC LIMIT 10"
     * sans avoir besoin d'écrire de requête @Query native (code plus propre).
     * * @return Une liste des 10 meilleurs scores triés par ordre décroissant.
     */
    List<Score> findTop10ByOrderByScoreValueDesc();
}