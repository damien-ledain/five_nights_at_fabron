package fr.univ.fabron.fnaf_fabron.game;

import jakarta.persistence.Embeddable;

@Embeddable
public class AnimatronicState {
    private int currentPosIndex;
    private boolean isAtDoor;
    private int lastProcessedTick; // Pour savoir jusqu'à quel "tic" de 5s on a calculé

    public AnimatronicState() {
        this.currentPosIndex = 0;
        this.isAtDoor = false;
        this.lastProcessedTick = 0;
    }

    // Getters et Setters
    public int getCurrentPosIndex() { return currentPosIndex; }
    public void setCurrentPosIndex(int currentPosIndex) { this.currentPosIndex = currentPosIndex; }

    public boolean isAtDoor() { return isAtDoor; }
    public void setAtDoor(boolean atDoor) { isAtDoor = atDoor; }

    public int getLastProcessedTick() { return lastProcessedTick; }
    public void setLastProcessedTick(int lastProcessedTick) { this.lastProcessedTick = lastProcessedTick; }
}