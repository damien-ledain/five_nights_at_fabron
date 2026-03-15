package fr.univ.fabron.fnaf_fabron.auth;

import java.util.Date;
import org.springframework.stereotype.Component;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

/**
 * Composant utilitaire chargé de la création et de la validation des tokens JWT.
 * Les tokens permettent d'identifier de manière sécurisée (stateless) le joueur lors de ses requêtes.
 */
@Component
public class JwtUtil {
    
    // QDev : En production, ce secret NE DOIT JAMAIS être dans le code source.
    // Il devrait être injecté via @Value("${jwt.secret}") depuis l'environnement.
    private final String SECRET = "CrousFabronSecretKey123!_NePasPirater";
    
    // L'algorithme HMAC256 est utilisé pour signer le token avec notre secret
    private final Algorithm algorithm = Algorithm.HMAC256(SECRET);

    /**
     * Génère un token JWT valide pour un utilisateur donné.
     * Le token expire automatiquement après 24 heures.
     * * @param username Le nom d'utilisateur à inclure dans le token (Subject).
     * @return Le token JWT signé sous forme de chaîne de caractères.
     */
    public String generateToken(String username) {
        return JWT.create()
                .withSubject(username)
                .withIssuedAt(new Date()) // Date de création
                .withExpiresAt(new Date(System.currentTimeMillis() + 86400000)) // Expire dans 1 jour (86 400 000 ms)
                .sign(algorithm);
    }

    /**
     * Décrypte et vérifie un token JWT pour en extraire le nom d'utilisateur.
     * Si le token est expiré ou falsifié, cette méthode lèvera une exception.
     * * @param token Le token JWT à vérifier.
     * @return Le nom d'utilisateur (Subject) contenu dans le token.
     */
    public String getUsername(String token) {
        return JWT.require(algorithm)
                .build()
                .verify(token)
                .getSubject();
    }
}