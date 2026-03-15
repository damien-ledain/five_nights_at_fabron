package fr.univ.fabron.fnaf_fabron.score;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Contrôleur REST exposant l'API liée au classement (Leaderboard).
 */
@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*") 
public class ScoreController {

    private final ScoreRepository scoreRepository;

    /**
     * Injection de dépendance via le constructeur.
     * * @param scoreRepository Le repository d'accès aux scores.
     */
    public ScoreController(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    /**
     * Récupère le classement des 10 meilleurs joueurs.
     * * @return Une liste d'objets LeaderboardEntryDTO contenant les noms et scores.
     */
    @GetMapping
    public List<LeaderboardEntryDTO> getLeaderboard() {
        // Pourquoi utiliser un Record (DTO) plutôt qu'une Map<String, Object> ?
        // Les Maps masquent la structure des données et empêchent le compilateur de 
        // vérifier les erreurs de frappe (ex: "playername" au lieu de "playerName").
        // Le DTO garantit un contrat d'API strict tout en générant le même JSON final.
        return scoreRepository.findTop10ByOrderByScoreValueDesc()
                .stream()
                .map(score -> new LeaderboardEntryDTO(
                        score.getPlayer().getUsername(), 
                        score.getScoreValue()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Record agissant comme un Data Transfer Object (DTO) pour le classement.
     * (Déclaré en interne pour ne pas polluer l'architecture avec de nouveaux fichiers).
     */
    public record LeaderboardEntryDTO(String playerName, Integer scoreValue) {}
}