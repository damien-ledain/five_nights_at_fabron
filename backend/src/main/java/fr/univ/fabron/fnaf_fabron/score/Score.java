package fr.univ.fabron.fnaf_fabron.score;

import fr.univ.fabron.fnaf_fabron.player.Player;
import jakarta.persistence.*;

/**
 * Entité représentant le score global et la progression d'un joueur.
 * La relation avec le joueur est de type 1:1, où l'identifiant du joueur
 * devient également l'identifiant du score.
 */
@Entity
@Table(name = "scores")
public class Score {

    @Id
    private Long id;

    // Pourquoi @MapsId ? Cela garantit que la clé primaire de Score est 
    // exactement la même que celle de Player. Cela optimise la base de données 
    // en évitant de créer une colonne d'ID auto-générée inutile pour Score.
    /** Le joueur associé à ce score. */
    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Player player;

    /** Valeur du meilleur score cumulé ou réalisé par le joueur. */
    @Column(nullable = false)
    private Integer scoreValue;

    /** Numéro de la nuit la plus avancée atteinte par le joueur. */
    @Column(nullable = false)
    private Integer maxNight;

    /** Constructeur par défaut requis par JPA. */
    public Score() {}

    /**
     * Constructeur pour initialiser un nouveau score.
     * * @param player Le joueur propriétaire du score.
     * @param scoreValue La valeur initiale du score (généralement 0).
     * @param maxNight La nuit maximale atteinte (généralement 1).
     */
    public Score(Player player, Integer scoreValue, Integer maxNight) {
        this.player = player;
        this.scoreValue = scoreValue;
        this.maxNight = maxNight;
    }

    // --- Getters et Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }

    public Integer getScoreValue() { return scoreValue; }
    
    // Pourquoi pas de validation stricte ici ? La validation est déléguée aux couches 
    // supérieures (Controller/Service), mais on pourrait ajouter un `Math.max(0, scoreValue)`.
    public void setScoreValue(Integer scoreValue) { this.scoreValue = scoreValue; }

    public Integer getMaxNight() { return maxNight; }
    public void setMaxNight(Integer maxNight) { this.maxNight = maxNight; }
}