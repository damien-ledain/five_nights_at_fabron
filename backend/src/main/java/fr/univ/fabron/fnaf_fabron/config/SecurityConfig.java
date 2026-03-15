package fr.univ.fabron.fnaf_fabron.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuration globale de la sécurité de l'application (Spring Security).
 * Définit les règles d'accès aux routes (endpoints) et l'algorithme de hachage des mots de passe.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configure la chaîne de filtres de sécurité HTTP.
     * * @param http L'objet HttpSecurity à configurer fourni par Spring.
     * @return La SecurityFilterChain construite.
     * @throws Exception Si une erreur de configuration survient.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Désactivation de CSRF (Cross-Site Request Forgery).
            // Pourquoi ? Parce que nous utilisons une API REST avec des tokens JWT.
            // Le front-end n'utilise pas de cookies de session classiques, donc l'attaque CSRF n'est pas possible.
            .csrf(AbstractHttpConfigurer::disable)
            
            // QDev : Déclaration explicite du mode STATELESS. 
            // Empêche Spring de créer des sessions HTTP (JSESSIONID) en mémoire, optimisant ainsi les performances du serveur.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(auth -> auth
                // Autorise l'accès public (sans être connecté) à ces routes spécifiques
                .requestMatchers("/api/leaderboard", "/api/auth/**", "/api/game/**").permitAll()
                
                // Toutes les autres requêtes nécessitent d'être authentifié
                .anyRequest().authenticated()
            );
            
        return http.build();
    }

    /**
     * Déclare le Bean utilisé pour hacher les mots de passe.
     * * @return Une instance de BCryptPasswordEncoder.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt est un standard de l'industrie robuste contre les attaques par force brute
        // grâce à l'utilisation automatique d'un "sel" (salt) aléatoire.
        return new BCryptPasswordEncoder();
    }
}