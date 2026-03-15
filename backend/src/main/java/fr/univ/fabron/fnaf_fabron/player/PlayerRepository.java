package fr.univ.fabron.fnaf_fabron.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository permettant l'accès et la manipulation des données des joueurs en BDD.
 */
@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    
    /**
     * Recherche un joueur par son nom d'utilisateur exact.
     * Utilise Optional pour éviter les NullPointerException si le joueur n'existe pas.
     * * @param username Le nom d'utilisateur à chercher.
     * @return Un Optional contenant le joueur s'il est trouvé, sinon Optional.empty().
     */
    Optional<Player> findByUsername(String username);
}