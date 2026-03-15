package fr.univ.fabron.fnaf_fabron.game;

/**
 * Animatronique qui attaque par la porte Droite.
 */
public class Bluebear extends Animatronic {
    private static final String[] PATH = { "ext_03", "ext_02", "int_05", "int_03", "esc_01", "porte_droite", "office" };
    private int pathIndex = 0;
    private long timeArrivedAtDoor = 0;
    private long timeDoorClosedStart = 0;
    private long currentJumpscareDelay = 5000;

    public Bluebear(int nightLevel) {
        super("Bluebear", nightLevel, 4);
        this.currentLocation = PATH[pathIndex];
    }

    @Override
    public void update(GameState gameState) {
        if (currentLocation.equals("porte_droite")) {
            long currentTime = System.currentTimeMillis();
            if (gameState.isRightDoorClosed()) {
                if (timeDoorClosedStart == 0) timeDoorClosedStart = currentTime;
                else if (currentTime - timeDoorClosedStart >= 3000) leaveDoor(gameState); // Abandonne après 3s face à une porte fermée
            } else {
                timeDoorClosedStart = 0;
                if (currentTime - timeArrivedAtDoor >= currentJumpscareDelay) triggerJumpscare(gameState); // GAME OVER
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
                currentJumpscareDelay = 3000 + random.nextInt(6001);
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
        if (!gameState.isOccupied("ext_03", this)) pathIndex = 0;
        else if (!gameState.isOccupied("ext_02", this)) pathIndex = 1;
        else pathIndex = 2;
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