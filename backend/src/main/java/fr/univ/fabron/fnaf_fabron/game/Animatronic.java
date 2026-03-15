package fr.univ.fabron.fnaf_fabron.game;

import java.util.Random;

/**
 * Classe abstraite définissant le comportement d'un monstre.
 */
public abstract class Animatronic {
    protected String name;
    protected int aiLevel;
    protected String currentLocation;
    protected int tickIntervalSeconds;
    protected long lastMoveTime;
    protected Random random = new Random();

    public Animatronic(String name, int nightLevel, int tickIntervalSeconds) {
        this.name = name;
        this.aiLevel = Math.min(nightLevel, 10);
        this.tickIntervalSeconds = tickIntervalSeconds;
        this.lastMoveTime = System.currentTimeMillis();
    }

    /** Appelé chaque seconde par le GameState. */
    public void update(GameState gameState) {
        long currentTime = System.currentTimeMillis();
        // Vérifie si c'est le moment de tenter un mouvement
        if ((currentTime - lastMoveTime) >= tickIntervalSeconds * 1000L) {
            this.lastMoveTime = currentTime;
            int roll = random.nextInt(20) + 1; // Système type D&D (D20)
            
            if (roll <= aiLevel) {
                String oldLocation = currentLocation;
                move(gameState);
                
                // Si l'animatronique a bien bougé, on peut déclencher un son (ex: chaise)
                if (!oldLocation.equals(currentLocation) && !currentLocation.startsWith("porte") && !currentLocation.equals("office")) {
                    if (random.nextInt(100) < 25) gameState.triggerEvent("sfx_chair_scoot");
                }
            }
        }
    }

    protected abstract void move(GameState gameState);
    public abstract void forceMove(boolean forward, GameState gameState);

    public String getCurrentLocation() { return currentLocation; }
    public String getName() { return name; }
}