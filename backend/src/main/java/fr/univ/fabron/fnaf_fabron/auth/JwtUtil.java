package fr.univ.fabron.fnaf_fabron.auth;

import java.util.Date;

import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

@Component
public class JwtUtil {
    
    // La clé secrète du serveur pour signer les badges (à ne jamais partager en vrai !)
    private final String SECRET = "CrousFabronSecretKey123!_NePasPirater";
    private final Algorithm algorithm = Algorithm.HMAC256(SECRET);

    public String generateToken(String username) {
        return JWT.create()
                .withSubject(username)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 86400000)) // Expire dans 1 jour
                .sign(algorithm);
    }

    // Méthode à ajouter dans JwtUtil.java
    public String getUsername(String token) {
        return JWT.require(algorithm).build().verify(token).getSubject();
    }
}