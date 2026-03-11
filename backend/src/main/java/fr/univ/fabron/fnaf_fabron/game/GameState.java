package fr.univ.fabron.fnaf_fabron.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GameState {
    private boolean rightDoorClosed = false;
    private boolean leftDoorClosed = false;
    private boolean windowClosed = false;
    private String currentCamera = "";
    
    private boolean gameOver = false;
    private String jumpscareAnimatronic = null;
    private Map<String, Animatronic> animatronics = new HashMap<>();
    private List<String> events = new ArrayList<>(); // Pour gérer les effets sonores envoyés au front

    public GameState(int nightLevel) {
        animatronics.put("Bluebear", new Bluebear(nightLevel));
        animatronics.put("Redbear", new Redbear(nightLevel));
        animatronics.put("Burncap", new Burncap(nightLevel)); // Ajout de Burncap
        animatronics.put("Oneeyed", new Oneeyed(nightLevel));
    }

    public void updateAll() {
        if (gameOver) return;
        animatronics.get("Bluebear").update(this);
        animatronics.get("Redbear").update(this);
        animatronics.get("Burncap").update(this);
        animatronics.get("Oneeyed").update(this);
    }

    public void handleCollision(Animatronic mover) {
        for (Animatronic other : animatronics.values()) {
            if (mover == other) continue;

            String loc = mover.getCurrentLocation();
            if (!loc.equals("ext_03") && !loc.equals("office") && loc.equals(other.getCurrentLocation())) {
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

    public void triggerEvent(String eventName) {
        events.add(eventName);
    }

    public List<String> consumeEvents() {
        List<String> copy = new ArrayList<>(events);
        events.clear();
        return copy;
    }

    // Getters / Setters
    public boolean isRightDoorClosed() { return rightDoorClosed; }
    public void setRightDoorClosed(boolean val) { this.rightDoorClosed = val; }
    
    public boolean isLeftDoorClosed() { return leftDoorClosed; }
    public void setLeftDoorClosed(boolean val) { this.leftDoorClosed = val; }
    
    public boolean isWindowClosed() { return windowClosed; }
    public void setWindowClosed(boolean val) { this.windowClosed = val; }
    
    public String getCurrentCamera() { return currentCamera; }
    public void setCurrentCamera(String val) { this.currentCamera = val; }
    
    public boolean isGameOver() { return gameOver; }
    public void setGameOver(boolean val) { this.gameOver = val; }
    
    public String getJumpscareAnimatronic() { return jumpscareAnimatronic; }
    public void setJumpscareAnimatronic(String name) { this.jumpscareAnimatronic = name; }
    
    public Map<String, Animatronic> getAnimatronics() { return animatronics; }
}