package fr.univ.fabron.fnaf_fabron.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    // Permet de chercher un joueur par son nom lors de la connexion
    Optional<Player> findByUsername(String username);
}