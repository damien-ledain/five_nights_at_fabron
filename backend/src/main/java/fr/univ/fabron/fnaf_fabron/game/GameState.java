package fr.univ.fabron.fnaf_fabron.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Représente l'état instantané d'une partie (portes, caméras, monstres).
 */
public class GameState {
    private boolean rightDoorClosed = false;
    private boolean leftDoorClosed = false;
    private boolean windowClosed = false;
    private String currentCamera = "";
    
    private boolean gameOver = false;
    private String jumpscareAnimatronic = null;
    
    private Map<String, Animatronic> animatronics = new HashMap<>();
    
    /** File d'attente des événements sonores à renvoyer au Front-end. */
    private List<String> events = new ArrayList<>(); 

    public GameState(int nightLevel) {
        // QDev : Cette instanciation "en dur" viole le principe Ouvert/Fermé (SOLID).
        // Si le jeu grandit, une classe 'AnimatronicFactory' serait recommandée.
        animatronics.put("Bluebear", new Bluebear(nightLevel));
        animatronics.put("Redbear", new Redbear(nightLevel));
        animatronics.put("Burncap", new Burncap(nightLevel)); 
        animatronics.put("Oneeyed", new Oneeyed(nightLevel));
    }

    /** Demande à tous les animatroniques de calculer leurs mouvements. */
    public void updateAll() {
        if (gameOver) return;
        animatronics.values().forEach(anim -> anim.update(this));
    }

    /**
     * Gère les collisions : si deux monstres sont dans la même pièce,
     * l'un d'eux est forcé de se déplacer à la pièce suivante.
     * * @param mover L'animatronique initiant le mouvement.
     */
    public void handleCollision(Animatronic mover) {
        for (Animatronic other : animatronics.values()) {
            if (mover == other) continue;

            String loc = mover.getCurrentLocation();
            // L'extérieur et le bureau peuvent contenir plusieurs monstres sans collision
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

    public void triggerEvent(String eventName) { events.add(eventName); }

    public List<String> consumeEvents() {
        List<String> copy = new ArrayList<>(events);
        events.clear();
        return copy;
    }

    // --- Getters / Setters ---
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