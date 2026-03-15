package fr.univ.fabron.fnaf_fabron.game;

import java.time.LocalDateTime;
import fr.univ.fabron.fnaf_fabron.player.Player;
import jakarta.persistence.*;

/**
 * Entité représentant une session de jeu (une tentative de survie) en base de données.
 * Permet de tracer le temps passé et la réussite ou l'échec du joueur.
 */
@Entity
@Table(name = "game_sessions")
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Le joueur effectuant la session. (Relation Many-to-One) */
    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    /** Le niveau de difficulté (la nuit) de cette session. */
    @Column(nullable = false)
    private int nightLevel;
    
    /** Indique si la session est actuellement en cours. */
    @Column(nullable = false)
    private boolean active;
    
    /** L'heure réelle de début de la session sur le serveur. */
    @Column(nullable = false)
    private LocalDateTime startTime;

    public GameSession() {}

    // --- Getters et Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }
    public int getNightLevel() { return nightLevel; }
    public void setNightLevel(int nightLevel) { this.nightLevel = nightLevel; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
}