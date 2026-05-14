# CLAUDE.md — Five Nights at Fabron

Jeu de survie horrifique Point-and-Click, fan-game de FNaF, réalisé pour le BUT Informatique 2ᵉ année à l'IUT Côte d'Azur (Nice). Architecture **client-serveur** strict : toute la logique de jeu tourne côté serveur (server-authoritative).

---

## Stack technique

| Couche | Techno |
|---|---|
| Backend | Java 17 · Spring Boot 3.2.4 · Spring Security · JWT (Auth0) |
| Base de données | MariaDB 11 (prod IUT) · H2 in-memory (tests) |
| ORM | Spring Data JPA / Hibernate (`ddl-auto=update`) |
| Frontend | Vanilla JS ES6 · HTML5 · CSS3 — **aucun framework** |
| Communication | Fetch API — polling REST toutes les secondes sur `/api/game/state` |

---

## Lancer le projet en local (Docker — recommandé)

```bash
# Depuis la racine du projet
docker compose up --build
```

- **Frontend** : [http://localhost:80](http://localhost:80)
- **Backend API** : [http://localhost:8080](http://localhost:8080)
- **Base de données** : MariaDB sur le port `3307` de l'hôte (évite les conflits avec un MySQL local)

Docker gère tout : MariaDB est initialisée automatiquement via Hibernate (`ddl-auto=update`), aucun script SQL à jouer manuellement.

Pour stopper et supprimer les données :
```bash
docker compose down -v
```

---

## Lancer sans Docker (méthode originale IUT)

Nécessite un accès VPN à `linserv-info-01.campus.unice.fr:3306`.

```bash
cd backend/
./mvnw spring-boot:run   # Linux/Mac
mvnw.cmd spring-boot:run  # Windows
```

Ouvrir `frontend/index.html` avec **Live Server** (VS Code) sur le port 5500.

---

## Architecture des packages backend

```
fr.univ.fabron.fnaf_fabron/
├── auth/           # Inscription, login, génération JWT
│   ├── AuthController.java     — POST /api/auth/register|login
│   └── JwtUtil.java            — HMAC256, token 24h
├── config/
│   └── SecurityConfig.java     — CORS *, CSRF off, routes publiques
├── game/
│   ├── GameController.java     — POST /api/game/start|state|gameover + endpoints dev
│   ├── GameEngineService.java  — ConcurrentHashMap<playerId, GameState> (état RAM)
│   ├── GameState.java          — État instantané d'une partie
│   ├── Animatronic.java        — Classe abstraite : tick D20, cooldown, position
│   ├── Bluebear.java           — Attaque porte droite, PATH de 7 salles
│   ├── Redbear.java            — Attaque porte gauche, attend que Bluebear parte
│   ├── Burncap.java            — Attaque la fenêtre, chemin séparé
│   ├── Oneeyed.java            — Oneeyed a sa propre logique de spawn
│   └── GameSession.java        — Entité JPA : session en base (start_time, night_level)
├── player/
│   ├── Player.java             — Entité JPA : username (unique), password (BCrypt), currentNight
│   └── PlayerRepository.java
└── score/
    ├── Score.java              — Entité JPA : @MapsId (même PK que Player), scoreValue, maxNight
    ├── ScoreRepository.java    — findTop10ByOrderByScoreValueDesc()
    └── ScoreController.java    — GET /api/leaderboard
```

---

## Logique de jeu — points clés

### Animatroniques

Chaque animatronique hérite de `Animatronic`. À chaque tick (1 seconde côté serveur) :
1. Si `(maintenant - lastMoveTime) >= tickIntervalSeconds` → lancer un D20
2. Si `roll <= aiLevel` (aiLevel = min(nightLevel, 10)) → `move()`
3. Un son `sfx_chair_scoot` est déclenché aléatoirement (25 %)

Les animatroniques ont chacun un `PATH[]` statique (liste de salles). Quand ils arrivent à `porte_droite`/`porte_gauche`/`fenetre` :
- Porte fermée ≥ 3s → ils repartent (`leaveDoor`)
- Porte ouverte ≥ `currentJumpscareDelay` (3–9s aléatoire) → GAME OVER

### Collisions
`GameState.handleCollision()` : si deux animatroniques se retrouvent dans la même salle (hors `ext_03` et `office`), le second est forcé d'avancer.

### Température (frontend only)
La température monte quand les caméras sont ouvertes ou les portes fermées. C'est géré **uniquement dans `main.js`** — le backend n'en est pas informé. À 100 %, le frontend déclenche un blackout et appelle `/api/game/gameover`.

### Calcul du score
- Victoire (6h passées) : `currentNight * 1000` ajouté si > meilleur score, nuit +1
- Défaite : `(completedNights * 1000) + (fraction de la nuit survécue * 1000)`

---

## Points d'attention (bugs connus / dette technique)

| # | Problème | Fichier | Impact |
|---|---|---|---|
| 1 | JWT secret en dur dans le code | `JwtUtil.java:17` | Sécurité (prod) |
| 2 | `orElseThrow()` sans message sur le Score | `GameController.java:131,162` | NPE générique si score manquant |
| 3 | `@CrossOrigin(origins = "*")` global | Tous les controllers | OK dev, à restreindre en prod |
| 4 | Température gérée côté frontend uniquement | `main.js` | Trichable |
| 5 | Noms développeurs hardcodés dans les routes dev | `GameController.java:215,238,259` | Fragile |
| 6 | `GameState` utilise `HashMap` (non thread-safe) | `GameState.java:21` | OK car un seul thread par état, mais surprenant |

---

## Suggestions d'améliorations (non implémentées)

1. **WebSocket** : remplacer le polling 1s par WebSocket (SockJS/STOMP) → latence réduite, moins de requêtes
2. **AnimatronicFactory** : le constructeur de `GameState` crée les 4 animatroniques en dur — violer OCP; une factory permettrait d'ajouter des nuits spéciales
3. **JWT secret en env var** : `@Value("${jwt.secret}")` + variable d'env Docker
4. **Température côté serveur** : déplacer le calcul thermique dans `GameState` pour éviter la triche
5. **Route /api/leaderboard** est publique mais Spring Security l'a sous `/api/game/**` (permit all étendu) — vérifier la config SecurityConfig

---

## Tests

```bash
cd backend/
./mvnw test
```

Les tests utilisent H2 in-memory. Pas de connexion MySQL nécessaire. Couverture : AuthController, JwtUtil, SecurityConfig, PlayerRepository, GameEngineService, ScoreController.

---

## Équipe

| Dev | Rôle |
|---|---|
| Hamza KARROUCHI | Logique fonctionnelle, équilibrage, clean code |
| Nathan LASSAUNIÈRE | Architecture backend, Spring Boot, JWT, moteur de jeu |
| Damien LE DAIN | Frontend, animations CSS, MySQL, Git |
