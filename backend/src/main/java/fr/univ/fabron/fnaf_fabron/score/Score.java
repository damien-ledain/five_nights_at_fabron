package fr.univ.fabron.fnaf_fabron.score;

import fr.univ.fabron.fnaf_fabron.player.Player;
import jakarta.persistence.*;

@Entity
@Table(name = "scores")
public class Score {

    // On ne met pas @GeneratedValue ici ! L'ID sera fourni par @MapsId
    @Id
    private Long id;

    // @OneToOne : 1 Joueur = 1 Score global
    // @MapsId : L'ID de ce Score sera exactement l'ID du Player associé
    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Player player;

    @Column(nullable = false)
    private Integer scoreValue;

    @Column(nullable = false)
    private Integer maxNight;

    public Score() {}

    public Score(Player player, Integer scoreValue, Integer maxNight) {
        this.player = player;
        this.scoreValue = scoreValue;
        this.maxNight = maxNight;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }

    public Integer getScoreValue() { return scoreValue; }
    public void setScoreValue(Integer scoreValue) { this.scoreValue = scoreValue; }

    public Integer getMaxNight() { return maxNight; }
    public void setMaxNight(Integer maxNight) { this.maxNight = maxNight; }
}