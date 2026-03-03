package fr.univ.fabron.fnaf_fabron.game;

import java.time.LocalDateTime;

import fr.univ.fabron.fnaf_fabron.player.Player;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "game_sessions")
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    private int nightLevel;
    
    // CORRECTION : Renommé de "isActive" en "active" pour la compatibilité Spring Data JPA
    private boolean active;
    
    // Heure réelle à laquelle la partie a commencé sur le serveur
    private LocalDateTime startTime;

    public GameSession() {}

    // Getters et Setters
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