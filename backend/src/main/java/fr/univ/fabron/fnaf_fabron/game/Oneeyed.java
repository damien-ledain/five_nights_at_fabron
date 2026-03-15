package fr.univ.fabron.fnaf_fabron.game;

public class Oneeyed extends Animatronic {
    // Chemin vers la porte droite
    private static final String[] PATH = { "ext_03", "ext_02", "int_05", "int_04", "int_03", "esc_01", "porte_droite", "office" };
    private int pathIndex = 0;
    private long timeArrivedAtDoor = 0;
    private long timeDoorClosedStart = 0;
    private long currentJumpscareDelay = 5000;

    public Oneeyed(int nightLevel) {
        super("Oneeyed", nightLevel, 6); // Se déplace toutes les 6 secondes (ajustable)
        if (nightLevel < 3) {
            this.aiLevel = 0; // Totalement inactif les nuits 1 et 2
        }
        this.currentLocation = PATH[pathIndex];
    }

    @Override
    public void update(GameState gameState) {
        if (aiLevel <= 0) return;

        // 1. ORDRE STRICT DE SORTIE DU SPAWN
        if (currentLocation.equals("ext_03")) {
            Animatronic bluebear = gameState.getAnimatronics().get("Bluebear");
            Animatronic redbear = gameState.getAnimatronics().get("Redbear");
            
            // Si Bluebear OU Redbear est encore au spawn, Oneeyed attend.
            if (bluebear.getCurrentLocation().equals("ext_03") || redbear.getCurrentLocation().equals("ext_03")) {
                return; 
            }
        }

        // 2. VÉRIFICATION PORTE DROITE
        if (currentLocation.equals("porte_droite")) {
            long currentTime = System.currentTimeMillis();
            if (gameState.isRightDoorClosed()) {
                if (timeDoorClosedStart == 0) timeDoorClosedStart = currentTime;
                else if (currentTime - timeDoorClosedStart >= 3000) leaveDoor(gameState);
            } else {
                timeDoorClosedStart = 0;
                if (currentTime - timeArrivedAtDoor >= currentJumpscareDelay) triggerJumpscare(gameState);
            }
        } else {
            super.update(gameState);
        }
    }

    @Override
    protected void move(GameState gameState) {
        if (pathIndex < PATH.length - 1) {
            pathIndex++;
            currentLocation = PATH[pathIndex];
            if (currentLocation.equals("porte_droite")) {
                timeArrivedAtDoor = System.currentTimeMillis();
                currentJumpscareDelay = 3000 + random.nextInt(6001); // Entre 3 et 9 sec avant d'attaquer
            }
            gameState.handleCollision(this);
        }
    }

    @Override
    public void forceMove(boolean forward, GameState gameState) {
        if (forward && pathIndex < PATH.length - 1) {
            pathIndex++;
            currentLocation = PATH[pathIndex];
            gameState.handleCollision(this);
        } else if (!forward && pathIndex > 0) {
            pathIndex--;
            currentLocation = PATH[pathIndex];
        }
        if (currentLocation.equals("porte_droite")) {
            timeArrivedAtDoor = System.currentTimeMillis();
            currentJumpscareDelay = 3000 + random.nextInt(6001);
        }
    }

    private void leaveDoor(GameState gameState) {
        Animatronic redbear = gameState.getAnimatronics().get("Redbear");
        
        // Il retourne au spawn uniquement si Redbear y est
        if (redbear.getCurrentLocation().equals("ext_03")) {
            pathIndex = 0;
        } else if (!gameState.isOccupied("ext_02", this)) {
            pathIndex = 1;
        } else if (!gameState.isOccupied("int_05", this)) {
            pathIndex = 2;
        } else {
            pathIndex = 3; // Repli par défaut en int_04 s'il y a des bouchons
        }
        
        currentLocation = PATH[pathIndex];
        timeArrivedAtDoor = 0;
        timeDoorClosedStart = 0;
        lastMoveTime = System.currentTimeMillis();
    }

    private void triggerJumpscare(GameState gameState) {
        pathIndex = PATH.length - 1;
        currentLocation = "office";
        gameState.setGameOver(true);
        gameState.setJumpscareAnimatronic(this.name);
    }
}