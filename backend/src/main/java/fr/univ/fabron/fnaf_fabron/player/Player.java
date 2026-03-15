package fr.univ.fabron.fnaf_fabron.player;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entité représentant un joueur inscrit dans le jeu.
 * Mappe la table "players" dans la base de données MySQL.
 */
@Entity
@Table(name = "players")
public class Player {

    /** Identifiant unique du joueur, généré automatiquement par la base de données. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // QDev : "unique = true" ajoute une contrainte d'unicité directement dans le schéma SQL.
    // Cela protège la BDD même si le code Java essaie d'insérer un doublon.
    /** Le pseudonyme du joueur. Doit être unique. */
    @Column(unique = true, nullable = false)
    private String username;

    /** Le mot de passe du joueur (stocké sous forme de hash BCrypt). */
    @Column(nullable = false)
    private String password;

    /** * Sauvegarde de la série (streak) de survie en cours.
     * Par défaut, un nouveau joueur commence toujours à la nuit 1.
     */
    @Column(nullable = false)
    private int currentNight = 1;

    /** Constructeur par défaut requis par JPA/Hibernate. */
    public Player() {}

    // --- Getters et Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getCurrentNight() { return currentNight; }
    
    /**
     * Met à jour la nuit courante du joueur.
     * @param currentNight La nouvelle nuit à définir (doit être >= 1).
     */
    public void setCurrentNight(int currentNight) { 
        // QDev : Ajout d'une protection basique pour garantir la cohérence des données
        if (currentNight < 1) {
            this.currentNight = 1;
        } else {
            this.currentNight = currentNight; 
        }
    }
}