package fr.univ.fabron.fnaf_fabron.game;

public class Burncap extends Animatronic {
    private int phase = 0; // 0 = ext_01_0 (vide), 1 = ext_01_1, 2 = ext_01_2, 3 = ext_01_3 (Attaque)
    private long timeArrivedAtWindow = 0;
    private long timeWindowClosedStart = 0;

    public Burncap(int nightLevel) {
        super("Burncap", nightLevel, 5); 
        if (nightLevel < 2) {
            this.aiLevel = 0; // Inactif la nuit 1
        }
        this.currentLocation = "ext_01_0";
    }

    @Override
    public void update(GameState gameState) {
        if (aiLevel <= 0) return;

        long currentTime = System.currentTimeMillis();

        // PHASE 3 : IL EST À LA FENÊTRE (cam_ext_01_burncap_03)
        if (phase == 3) {
            // Si la fenêtre est fermée pour se protéger
            if (gameState.isWindowClosed()) {
                if (timeWindowClosedStart == 0) {
                    // Il vient de se cogner à la fenêtre fermée
                    timeWindowClosedStart = currentTime;
                    gameState.triggerEvent("sfx_window_knock"); // On joue le son instantanément
                } else if (currentTime - timeWindowClosedStart >= 3000) {
                    // Après 3 secondes d'attente à la fenêtre fermée, il retourne en phase 1
                    phase = 1;
                    this.currentLocation = "ext_01_1";
                    this.timeWindowClosedStart = 0;
                    this.timeArrivedAtWindow = 0;
                    this.lastMoveTime = currentTime;
                }
            } else {
                // Si la fenêtre est ouverte, le danger est présent !
                timeWindowClosedStart = 0; // On réinitialise au cas où le joueur rouvre la fenêtre trop tôt
                
                boolean isBeingWatched = "ext_01".equals(gameState.getCurrentCamera());
                
                // 4 secondes si on le regarde, 10 secondes si on ne le regarde pas
                long killDelay = isBeingWatched ? 4000 : 10000;
                
                if (currentTime - timeArrivedAtWindow >= killDelay) {
                    gameState.setGameOver(true);
                    gameState.setJumpscareAnimatronic(this.name);
                }
            }
        } 
        // PHASES 0, 1, 2 : IL AVANCE
        else {
            boolean isBeingWatched = "ext_01".equals(gameState.getCurrentCamera());

            if (isBeingWatched) {
                // Le regarder fige son avancement
                this.lastMoveTime = currentTime; 
            } else {
                // S'il n'est pas regardé, il avance
                long phaseDelay = Math.max(2000, 10000 - (aiLevel * 400L));
                if (currentTime - lastMoveTime >= phaseDelay) {
                    this.lastMoveTime = currentTime;
                    int roll = random.nextInt(20) + 1;
                    if (roll <= aiLevel) {
                        move(gameState);
                    }
                }
            }
        }
    }

    @Override
    protected void move(GameState gameState) {
        if (phase < 3) {
            phase++;
            if (phase == 3) {
                // Il arrive à la phase finale
                timeArrivedAtWindow = System.currentTimeMillis();
                timeWindowClosedStart = 0;
            }
            this.currentLocation = "ext_01_" + phase;
        }
    }

    @Override
    public void forceMove(boolean forward, GameState gameState) {
        if (forward && phase < 3) {
            move(gameState);
        } else if (!forward && phase > 0) {
            phase--;
            this.currentLocation = phase == 0 ? "ext_01_0" : "ext_01_" + phase;
        }
    }
}