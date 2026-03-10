package fr.univ.fabron.fnaf_fabron.game;

import java.util.HashMap;
import java.util.Map;

public class GameState {
    private boolean rightDoorClosed = false;
    private boolean leftDoorClosed = false;
    private boolean gameOver = false;
    private String jumpscareAnimatronic = null;
    private Map<String, Animatronic> animatronics = new HashMap<>();

    public GameState(int nightLevel) {
        animatronics.put("Bluebear", new Bluebear(nightLevel));
        animatronics.put("Redbear", new Redbear(nightLevel));
    }

    public void updateAll() {
        if (gameOver) return;
        animatronics.get("Bluebear").update(this);
        animatronics.get("Redbear").update(this);
    }

    public void handleCollision(Animatronic mover) {
        for (Animatronic other : animatronics.values()) {
            if (mover == other) continue;

            String loc = mover.getCurrentLocation();
            // Règle : Pas de collision au spawn (ext_03) ni dans l'office
            if (!loc.equals("ext_03") && !loc.equals("office") && loc.equals(other.getCurrentLocation())) {
                // On passe 'this' pour que la poussée puisse continuer en cascade
                other.forceMove(true, this);
            }
        }
    }

    public boolean isOccupied(String location, Animatronic self) {
        if (location.equals("ext_03") || location.equals("office")) return false;
        for (Animatronic a : animatronics.values()) {
            if (a != self && a.getCurrentLocation().equals(location)) return true;
        }
        return false;
    }

    // Getters / Setters standard
    public boolean isRightDoorClosed() { return rightDoorClosed; }
    public void setRightDoorClosed(boolean val) { this.rightDoorClosed = val; }
    public boolean isLeftDoorClosed() { return leftDoorClosed; }
    public void setLeftDoorClosed(boolean val) { this.leftDoorClosed = val; }
    public boolean isGameOver() { return gameOver; }
    public void setGameOver(boolean val) { this.gameOver = val; }
    public String getJumpscareAnimatronic() { return jumpscareAnimatronic; }
    public void setJumpscareAnimatronic(String name) { this.jumpscareAnimatronic = name; }
    public Map<String, Animatronic> getAnimatronics() { return animatronics; }
}