package fr.univ.fabron.fnaf_fabron.game;

import java.util.Random;

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

    public void update(GameState gameState) {
        long currentTime = System.currentTimeMillis();
        if ((currentTime - lastMoveTime) >= tickIntervalSeconds * 1000L) {
            this.lastMoveTime = currentTime;
            int roll = random.nextInt(20) + 1;
            if (roll <= aiLevel) {
                String oldLocation = currentLocation;
                move(gameState);
                
                // Si l'animatronique a bien bougé et qu'il n'attaque pas la porte ou l'office
                if (!oldLocation.equals(currentLocation) && !currentLocation.startsWith("porte") && !currentLocation.equals("office")) {
                    // 25% de chance de faire le bruit de chaise
                    if (random.nextInt(100) < 25) {
                        gameState.triggerEvent("sfx_chair_scoot");
                    }
                }
            }
        }
    }

    protected abstract void move(GameState gameState);
    
    // NOUVELLE SIGNATURE : On passe le gameState
    public abstract void forceMove(boolean forward, GameState gameState);

    public String getCurrentLocation() { return currentLocation; }
    public String getName() { return name; }
}