// =========================================================
// --- DICTIONNAIRE DES CAMÉRAS ---
// Associe chaque identifiant de caméra à son image par défaut (vide / état initial).
// =========================================================
const cameraFeeds = {
    'ext_01': 'img/cameras/ext_01/cam_ext_01_empty.webp',   // Couloir fenêtre (zone Burncap)
    'ext_02': 'img/cameras/ext_02/cam_ext_02_empty.webp',
    'ext_03': 'img/cameras/ext_03/cam_ext_03_full.webp',    // Spawn : Bluebear, Redbear, Oneeyed
    'int_01': 'img/cameras/int_01/cam_int_01_open.webp',    // Salle des serveurs (porte ouverte par défaut)
    'int_02': 'img/cameras/int_02/cam_int_02_empty.webp',
    'int_03': 'img/cameras/int_03/cam_int_03_empty.webp',
    'int_04': 'img/cameras/int_04/cam_int_04.webp',         // Caméra Oneeyed (boîte à musique)
    'int_05': 'img/cameras/int_05/cam_int_05_empty.webp',
    'esc_01': 'img/cameras/esc_01/cam_esc_01_empty.webp',
    'esc_02': 'img/cameras/esc_02/cam_esc_02_empty.webp',
    'esc_03': 'img/cameras/esc_03/cam_esc_03_empty.webp'
};

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // --- DOM : EFFETS VISUELS & JUMPSCARE ---
    // =========================================================
    const cameraEffects       = document.getElementById('camera-effects');
    const jumpscareContainer  = document.getElementById('jumpscare-container');
    const jumpscareImg        = document.getElementById('jumpscare-img');
    const fadeOverlay         = document.getElementById('fade-overlay');   // Fondu noir (transition vers game over)

    // =========================================================
    // --- DOM : MENUS PRINCIPAL & AUTHENTIFICATION ---
    // =========================================================
    const titleScreen         = document.getElementById('title-screen');
    const btnShowLogin        = document.getElementById('btn-show-login');
    const btnNewGame          = document.getElementById('btn-new-game');
    const btnNewGameText      = document.getElementById('btn-new-game-text');
    const btnNewGameSub       = document.getElementById('btn-new-game-sub');
    const btnLeaderboard      = document.getElementById('btn-leaderboard');
    const playerStatsContainer= document.getElementById('player-stats-container');
    const btnLogout           = document.getElementById('btn-logout');

    // Modale de connexion / inscription
    const authModal           = document.getElementById('auth-modal');
    const btnCloseAuth        = document.getElementById('btn-close-auth');
    const inputUsername       = document.getElementById('auth-username');
    const inputPassword       = document.getElementById('auth-password');
    const btnSubmitLogin      = document.getElementById('btn-submit-login');
    const btnSubmitRegister   = document.getElementById('btn-submit-register');
    const authMessage         = document.getElementById('auth-message');

    // Modale du classement
    const leaderboardModal    = document.getElementById('leaderboard-modal');
    const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
    const scoreBody           = document.getElementById('score-body');

    // =========================================================
    // --- DOM : ÉCRANS DE JEU ---
    // =========================================================
    const gameScreen          = document.getElementById('game-screen');
    const gameOverScreen      = document.getElementById('game-over-screen');
    const victoryScreen       = document.getElementById('victory-screen');
    const hoursRoller         = document.getElementById('hours-roller');   // Animation "6 AM" en victoire
    const inGameHour          = document.getElementById('in-game-hour');
    const inGameNight         = document.getElementById('in-game-night');
    const btnReturnMenuGo     = document.getElementById('btn-return-menu-go');

    // =========================================================
    // --- DOM : BUREAU & CAMÉRAS ---
    // =========================================================
    const mainViewImg         = document.getElementById('main-view-img');  // Image principale du bureau
    const officeControls      = document.getElementById('office-controls');
    const cameraSystem        = document.getElementById('camera-system');
    const btnCamera           = document.getElementById('btn-camera');
    const btnCloseCamera      = document.getElementById('btn-close-camera');
    const camFeedImg          = document.getElementById('cam-feed-img');   // Image du flux caméra actif
    const camBtns             = document.querySelectorAll('.cam-btn');
    const camTransition       = document.getElementById('cam-transition'); // Effet de transition entre caméras

    // =========================================================
    // --- DOM : PORTES & FENÊTRE ---
    // =========================================================
    const doorLeftZone        = document.getElementById('door-left-zone');   // Zone cliquable porte gauche (Redbear)
    const doorRightZone       = document.getElementById('door-right-zone');  // Zone cliquable porte droite (Bluebear / Oneeyed)
    const windowZone          = document.getElementById('window-zone');      // Zone cliquable fenêtre (Burncap)
    const btnWindow           = document.getElementById('btn-window');       // Bouton pour basculer vers la vue fenêtre

    // =========================================================
    // --- DOM : SALLE DES SERVEURS ---
    // =========================================================
    const btnOpenServer       = document.getElementById('btn-open-server'); // Bouton pour ré-ouvrir la porte serveur sur la caméra int_01

    // =========================================================
    // --- DOM : TEMPÉRATURE & PANNEAU DEV ---
    // =========================================================
    const temperatureUI       = document.getElementById('temperature-ui');
    const tempBarFill         = document.getElementById('temp-bar-fill');    // Jauge de remplissage rouge
    const tempPercentage      = document.getElementById('temp-percentage');  // Texte affiché (ex: "85%")
    const devPanelTitle       = document.getElementById('dev-panel-title');
    const btnDevSetNight      = document.getElementById('btn-dev-set-night');
    const devNightInput       = document.getElementById('dev-night-input');
    const btnDevJumpscare     = document.getElementById('btn-dev-jumpscare');
    const btnTempDie          = document.getElementById('btn-temp-die');     // Déclenche manuellement la fin de partie (dev)
    const btnDevForward       = document.getElementById('btn-dev-forward');
    const btnDevBackward      = document.getElementById('btn-dev-backward');
    const devAnimatronicSelect= document.getElementById('dev-animatronic-select');

    // =========================================================
    // --- VARIABLES D'ÉTAT DU JEU ---
    // =========================================================
    let activeNightLevel    = 1;     // Numéro de la nuit en cours (difficulté)
    let isBlackout          = false; // true si la température atteint 100% (coupure de courant)
    let currentTemperature  = 0;     // Température actuelle (0 à 100)
    let isGoldenFabronActive= false; // true si Golden Fabron est apparu sur int_01 (easter egg)

    // =========================================================
    // --- VARIABLES D'ÉTAT : PORTES & FENÊTRE ---
    // =========================================================
    let isLeftDoorClosed    = false; // Porte gauche (Redbear)
    let isRightDoorClosed   = false; // Porte droite (Bluebear / Oneeyed)
    let isWindowClosed      = false; // Fenêtre du couloir (Burncap)
    let inWindowView        = false; // true si le joueur regarde vers la fenêtre (vue alternative)

    // =========================================================
    // --- VARIABLES D'ÉTAT : SALLE DES SERVEURS ---
    // =========================================================
    let isServerDoorOpen    = true;  // La porte serveur (int_01) est ouverte par défaut au lancement

    // =========================================================
    // --- VARIABLES D'ÉTAT : POSITIONS DES ANIMATRONIQUES ---
    // Positions initiales au démarrage : tous au spawn (ext_03 ou ext_01_0).
    // Oneeyed n'a pas de position initiale ici car il sort en dernier.
    // =========================================================
    let currentPositions = {
        "Bluebear": "ext_03",    // Spawn principal
        "Redbear":  "ext_03",    // Attend que Bluebear soit parti avant de bouger
        "Burncap":  "ext_01_0"   // Spawn propre à Burncap (couloir de la fenêtre)
    };

    // =========================================================
    // --- VARIABLES D'ÉTAT : BRUITAGES DE PORTE ---
    // Flags pour éviter de rejouer le son de présence en boucle.
    // =========================================================
    let bbDoorSoundPlayed = false; // Bluebear est à la porte droite
    let rbDoorSoundPlayed = false; // Redbear est à la porte gauche
    let oeDoorSoundPlayed = false; // Oneeyed est à la porte droite

    // =========================================================
    // --- VARIABLES D'ÉTAT : INTERVALLES & TIMERS ---
    // =========================================================
    let gameInterval;         // Intervalle principal de poll (1 tick/seconde)
    let serverDoorInterval;   // Intervalle de fermeture aléatoire de la porte serveur
    let tempInterval;         // Intervalle de calcul de température (1 tick/seconde)
    let blackoutTimeout;      // Timer de mort pendant le blackout
    let flickerInterval;      // Timer du clignotement (visage Oneeyed pendant le blackout)
    let introTimeout;         // Timer de l'écran d'introduction (nuit 1)

    // =========================================================
    // --- AUDIO : AMBIANCE SALLE DES SERVEURS ---
    // =========================================================
    const serverAudio             = new Audio('sound_effect/ambiance_server_room.mp3');
    serverAudio.volume            = 0.15; // Volume faible pour une ambiance de fond discrète
    serverAudio.loop              = true;
    let serverAmbianceTimeout     = null;
    let isServerAmbiancePlaying   = false;

    // =========================================================
    // --- AUDIO : MUSIQUE ONEEYED ---
    // Joue uniquement quand Oneeyed est sur int_04 ET que le joueur regarde int_04.
    // En cas de blackout, la musique passe en volume maximal.
    // =========================================================
    let oneeyedMusic = new Audio('sound_effect/music_oneeyed.mp3');

    // =========================================================
    // --- AUDIO : PHONE GUY ---
    // Le téléphone sonne au début des nuits 1, 2 et 3.
    // Le joueur peut décrocher (écouter) ou raccrocher (couper).
    // =========================================================
    const btnPhone        = document.getElementById('btn-phone');
    let phoneRingAudio    = new Audio('sound_effect/sfx_phone_ring_loop.mp3');
    phoneRingAudio.loop   = true;
    let phoneGuyAudio     = null;       // Audio de la voix du Phone Guy (chargé dynamiquement par nuit)
    let isPhoneRinging    = false;      // true si la sonnerie est active et en attente de décroché
    let phoneRingTimeout  = null;       // Timer d'abandon si le joueur ne décroche pas (~17s)

    // =========================================================
    // --- SYSTÈME PHONE GUY ---
    // =========================================================

    /**
     * Coupe et réinitialise tous les sons liés au téléphone (sonnerie + voix).
     * Masque le bouton téléphone et nettoie les timers associés.
     */
    function stopAllPhoneAudio() {
        if (phoneRingAudio) {
            phoneRingAudio.pause();
            phoneRingAudio.currentTime = 0;
        }
        if (phoneGuyAudio) {
            phoneGuyAudio.pause();
            phoneGuyAudio.currentTime = 0;
        }
        if (phoneRingTimeout) clearTimeout(phoneRingTimeout);
        
        isPhoneRinging = false;
        if (btnPhone) {
            btnPhone.classList.add('hidden');
            btnPhone.classList.remove('ringing', 'active-call');
        }
    }

    if (btnPhone) {
        btnPhone.addEventListener('click', () => {
            if (isPhoneRinging) {
                // --- LE JOUEUR DÉCROCHE ---
                isPhoneRinging = false;
                phoneRingAudio.pause();
                phoneRingAudio.currentTime = 0;
                clearTimeout(phoneRingTimeout);

                // Charge l'audio Phone Guy correspondant à la nuit actuelle
                phoneGuyAudio = new Audio(`sound_effect/phone_guy_${activeNightLevel}.mp3`);
                phoneGuyAudio.volume = 0.8;
                phoneGuyAudio.play().catch(err => console.error("Erreur Phone Guy:", err));
                
                btnPhone.innerHTML = "📵 Mute Call";
                btnPhone.classList.remove('ringing');
                btnPhone.classList.add('active-call');

                // Quand le message est terminé, jouer le son de raccrochage et masquer le bouton
                phoneGuyAudio.onended = () => {
                    playSFX('sfx_phone_hangup.mp3');
                    stopAllPhoneAudio();
                };
            } else if (phoneGuyAudio && !phoneGuyAudio.paused) {
                // --- LE JOUEUR RACCROCHE AU NEZ ---
                playSFX('sfx_phone_hangup.mp3');
                stopAllPhoneAudio();
            }
        });
    }

    // =========================================================
    // --- UTILITAIRE AUDIO : EFFETS SONORES (SFX) ---
    // =========================================================

    /**
     * Joue un fichier son depuis le dossier `sound_effect/`.
     * @param {string} filename  - Nom du fichier (ex: 'sfx_door_slam.mp3')
     * @param {number|null} durationMs - Si fourni, commence un fondu et coupe le son après X ms.
     */
    function playSFX(filename, durationMs = null) {
        const audio = new Audio(`sound_effect/${filename}`);
        audio.volume = 0.8;
        audio.play().catch(err => console.error("Erreur SFX :", err));
        if (durationMs) {
            setTimeout(() => {
                let fadeAudio = setInterval(() => {
                    if (audio.volume > 0.1) audio.volume -= 0.1;
                    else { clearInterval(fadeAudio); audio.pause(); audio.currentTime = 0; }
                }, 50); // Fondu progressif toutes les 50ms
            }, durationMs);
        }
    }

    // Vérification de l'état de connexion au chargement de la page
    checkAuthStatus();

    // =========================================================
    // --- SYSTÈME DE PORTES & FENÊTRE ---
    // =========================================================

    /**
     * Met à jour l'image principale du bureau en fonction :
     * - de la vue active (bureau ou fenêtre),
     * - des portes ouvertes/fermées,
     * - des animatroniques présents aux portes.
     * Joue aussi les bruitages de présence à la porte si le joueur est au bureau.
     */
    function updateOfficeView() {
        if (isBlackout) return; // Pendant le blackout, l'affichage est géré séparément

        // --- DÉTECTION DE PRÉSENCE AUX PORTES ---
        let bbAtDoor = (currentPositions["Bluebear"] === 'porte_droite');
        let rbAtDoor = (currentPositions["Redbear"]  === 'porte_gauche');
        let oeAtDoor = (currentPositions["Oneeyed"]  === 'porte_droite');

        // Réinitialise les flags de bruitage si l'animatronique est parti
        if (!bbAtDoor) bbDoorSoundPlayed = false;
        if (!rbAtDoor) rbDoorSoundPlayed = false;
        if (!oeAtDoor) oeDoorSoundPlayed = false;

        // Le joueur est au bureau uniquement s'il ne regarde ni la fenêtre ni les caméras
        let isLookingAtDesk = !inWindowView && cameraSystem.classList.contains('hidden');

        // --- BRUITAGES DE PRÉSENCE À LA PORTE ---
        // Joue une seule fois par arrivée (flag bbDoorSoundPlayed / rbDoorSoundPlayed / oeDoorSoundPlayed)
        if (isLookingAtDesk) {
            if (bbAtDoor && !isRightDoorClosed && !bbDoorSoundPlayed) {
                playSFX('sfx_animatronic_at_door.mp3');
                bbDoorSoundPlayed = true;
            }
            if (rbAtDoor && !isLeftDoorClosed && !rbDoorSoundPlayed) {
                playSFX('sfx_animatronic_at_door.mp3');
                rbDoorSoundPlayed = true;
            }
            if (oeAtDoor && !isRightDoorClosed && !oeDoorSoundPlayed) {
                playSFX('sfx_animatronic_at_door.mp3');
                oeDoorSoundPlayed = true;
            }
        }

        // --- MISE À JOUR VISUELLE ---
        if (inWindowView) {
            // Vue fenêtre : affiche l'état ouvert ou fermé de la fenêtre
            mainViewImg.src = isWindowClosed
                ? 'img/office/window/window_closed.webp'
                : 'img/office/window/window_open.webp';
        } else {
            // Vue bureau : combine l'état des portes et la présence des animatroniques
            if (isLeftDoorClosed && isRightDoorClosed) {
                mainViewImg.src = 'img/office/desk/desk_closed.webp';
            } else if (isLeftDoorClosed) {
                if (bbAtDoor)      mainViewImg.src = 'img/office/desk/desk_left_closed_bluebear_right.webp';
                else if (oeAtDoor) mainViewImg.src = 'img/office/desk/desk_left_closed_oneeyed_right.webp';
                else               mainViewImg.src = 'img/office/desk/desk_left_closed.webp';
            } else if (isRightDoorClosed) {
                if (rbAtDoor) mainViewImg.src = 'img/office/desk/desk_right_closed_redbear_left.webp';
                else          mainViewImg.src = 'img/office/desk/desk_right_closed.webp';
            } else {
                // Aucune porte fermée : toutes les combinaisons de présence simultanée
                if      (bbAtDoor && rbAtDoor) mainViewImg.src = 'img/office/desk/desk_open_redbear_left_bluebear_right.webp';
                else if (oeAtDoor && rbAtDoor) mainViewImg.src = 'img/office/desk/desk_open_redbear_left_oneeyed_right.webp';
                else if (bbAtDoor)             mainViewImg.src = 'img/office/desk/desk_open_bluebear_right.webp';
                else if (oeAtDoor)             mainViewImg.src = 'img/office/desk/desk_open_oneeyed_right.webp';
                else if (rbAtDoor)             mainViewImg.src = 'img/office/desk/desk_open_redbear_left.webp';
                else                           mainViewImg.src = 'img/office/desk/desk_open.png';
            }
        }
    }

    // Clic sur la zone de porte gauche (Redbear) : toggle ouvert/fermé
    doorLeftZone.addEventListener('click', () => {
        if (!isBlackout) {
            isLeftDoorClosed = !isLeftDoorClosed;
            playSFX(isLeftDoorClosed ? 'sfx_door_slam.mp3' : 'sfx_door_open.mp3');
            updateOfficeView();
        }
    });

    // Clic sur la zone de porte droite (Bluebear / Oneeyed) : toggle ouvert/fermé
    doorRightZone.addEventListener('click', () => {
        if (!isBlackout) {
            isRightDoorClosed = !isRightDoorClosed;
            playSFX(isRightDoorClosed ? 'sfx_door_slam.mp3' : 'sfx_door_open.mp3');
            updateOfficeView();
        }
    });

    // Clic sur la zone de fenêtre (Burncap) : toggle ouvert/fermé
    // La fenêtre doit être fermée 3s pour bloquer Burncap s'il est en phase 3
    windowZone.addEventListener('click', () => {
        if (!isBlackout) {
            isWindowClosed = !isWindowClosed;
            playSFX(isWindowClosed ? 'sfx_window_close.mp3' : 'sfx_window_open.mp3');
            updateOfficeView();
        }
    });

    // Bouton "Fenêtre" : bascule entre la vue bureau et la vue fenêtre
    btnWindow.addEventListener('click', () => {
        if (isBlackout) return;
        inWindowView = !inWindowView;
        if (inWindowView) {
            btnWindow.textContent = "Bureau";
            btnCamera.classList.add('hidden');      // On ne peut pas ouvrir les caméras depuis la vue fenêtre
            doorLeftZone.classList.add('hidden');
            doorRightZone.classList.add('hidden');
            windowZone.classList.remove('hidden');
        } else {
            btnWindow.textContent = "Fenêtre";
            btnCamera.classList.remove('hidden');
            doorLeftZone.classList.remove('hidden');
            doorRightZone.classList.remove('hidden');
            windowZone.classList.add('hidden');
        }
        updateOfficeView();
    });

    // =========================================================
    // --- SYSTÈME DE CAMÉRAS ---
    // =========================================================

    /**
     * Retourne le chemin de l'image à afficher pour une caméra donnée,
     * en tenant compte des positions actuelles de tous les animatroniques.
     * Priorité : ext_03 (spawn) > Oneeyed > Burncap (ext_01) > Redbear > Bluebear > image vide.
     * @param {string} camId - Identifiant de la caméra (ex: 'ext_03', 'int_04')
     * @returns {string} Chemin vers l'image correspondante
     */
    function getCameraImageSrc(camId) {
        let bbLoc = currentPositions["Bluebear"];
        let rbLoc = currentPositions["Redbear"];
        let bcLoc = currentPositions["Burncap"];
        let oeLoc = currentPositions["Oneeyed"];

        // --- CAMÉRA SPAWN (ext_03) ---
        // Affiche un état progressif selon combien d'animatroniques sont encore là
        if (camId === 'ext_03') {
            if (oeLoc === 'ext_03' && rbLoc === 'ext_03' && bbLoc === 'ext_03')
                return 'img/cameras/ext_03/cam_ext_03_full.webp';         // Tous présents
            else if (oeLoc === 'ext_03' && rbLoc === 'ext_03')
                return 'img/cameras/ext_03/cam_ext_03_bluebear_out.webp'; // Bluebear est parti
            else if (oeLoc === 'ext_03')
                return 'img/cameras/ext_03/cam_ext_03_redbear_out.webp';  // Bluebear et Redbear partis
            else
                return 'img/cameras/ext_03/cam_ext_03_empty.webp';        // Spawn vide
        }

        // --- ONEEYED sur cette caméra (hors int_04 qui a sa propre logique de musique) ---
        if (oeLoc === camId && camId !== 'int_04')
            return `img/cameras/${camId}/cam_${camId}_oneeyed.webp`;

        // --- CAMÉRA COULOIR FENÊTRE (ext_01) : 3 phases d'approche de Burncap ---
        // Regarder Burncap sur cette caméra le fige temporairement
        if (camId === 'ext_01') {
            if (bcLoc === 'ext_01_1') return 'img/cameras/ext_01/cam_ext_01_burncap_01.webp'; // Phase 1 : loin
            if (bcLoc === 'ext_01_2') return 'img/cameras/ext_01/cam_ext_01_burncap_02.webp'; // Phase 2 : milieu
            if (bcLoc === 'ext_01_3') return 'img/cameras/ext_01/cam_ext_01_burncap_03.webp'; // Phase 3 : fenêtre
            return 'img/cameras/ext_01/cam_ext_01_empty.webp';
        }

        // --- REDBEAR ou BLUEBEAR sur une caméra quelconque ---
        if (rbLoc === camId) return `img/cameras/${camId}/cam_${camId}_redbear.webp`;
        if (bbLoc === camId) return `img/cameras/${camId}/cam_${camId}_bluebear.webp`;

        // Aucun animatronique : image par défaut
        return cameraFeeds[camId] || '';
    }

    /**
     * Change la caméra active et met à jour l'image du flux.
     * Gère le cas spécial de int_01 (salle serveurs + Golden Fabron).
     * @param {string} camId - Identifiant de la caméra à afficher
     */
    function updateCameraFeed(camId) {
        currentCameraId = camId;

        // Effet de transition rapide entre les caméras
        camTransition.classList.remove('hidden');
        camBtns.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.cam-btn[data-cam="${camId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        if (camId === 'int_01') {
            // --- CAMÉRA SALLE DES SERVEURS ---
            // Affiche un bouton pour ré-ouvrir la porte si elle est fermée
            btnOpenServer.classList.remove('hidden');
            if (isGoldenFabronActive) {
                camFeedImg.src = 'img/cameras/int_01/cam_int_01_golden_fabron.webp';
                btnOpenServer.classList.add('disabled'); // Impossible d'agir pendant l'easter egg
            } else if (isServerDoorOpen) {
                camFeedImg.src = 'img/cameras/int_01/cam_int_01_open.webp';
                btnOpenServer.classList.add('disabled'); // Porte déjà ouverte, bouton inutile
            } else {
                camFeedImg.src = 'img/cameras/int_01/cam_int_01_empty.webp';
                btnOpenServer.classList.remove('disabled'); // Joueur peut ré-ouvrir
            }
        } else {
            btnOpenServer.classList.add('hidden');
            camFeedImg.src = getCameraImageSrc(camId);
        }

        // Masquer l'effet de transition après 150ms
        setTimeout(() => camTransition.classList.add('hidden'), 150);
    }

    // Ouvrir le système caméra
    btnCamera.addEventListener('click', () => {
        if (isBlackout) return;
        officeControls.classList.add('hidden');
        doorLeftZone.classList.add('hidden');
        doorRightZone.classList.add('hidden');
        cameraSystem.classList.remove('hidden');
        cameraEffects.classList.remove('hidden');
        updateCameraFeed(currentCameraId);
    });

    // Fermer le système caméra
    btnCloseCamera.addEventListener('click', () => {
        cameraSystem.classList.add('hidden');
        cameraEffects.classList.add('hidden');
        officeControls.classList.remove('hidden');
        doorLeftZone.classList.remove('hidden');
        doorRightZone.classList.remove('hidden');

        // Si Golden Fabron était actif, 1 chance sur 50 de déclencher le crash en fermant la caméra
        if (isGoldenFabronActive) {
            if (Math.random() < (1 / 50)) triggerGoldenFabronCrash(); // 2% de chance
            isGoldenFabronActive = false;
        }
    });

    // Sélection d'une caméra via les boutons de la carte
    camBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isBlackout) return;
            const selectedCam = e.currentTarget.getAttribute('data-cam');
            if (selectedCam !== currentCameraId) updateCameraFeed(selectedCam);
        });
    });

    // Bouton "Ouvrir la porte serveur" sur la caméra int_01
    btnOpenServer.addEventListener('click', () => {
        if (!isServerDoorOpen && !isBlackout) {
            isServerDoorOpen = true;
            btnOpenServer.classList.add('disabled');
            playSFX('sfx_door_open.mp3');
            loopServerAmbiance();

            // À partir de la nuit 4, 1 chance sur 25 de faire apparaître Golden Fabron en ouvrant la porte
            if (activeNightLevel >= 4 && Math.random() < (1 / 25)) isGoldenFabronActive = true; // 4% de chance

            if (currentCameraId === 'int_01') {
                camFeedImg.src = isGoldenFabronActive
                    ? 'img/cameras/int_01/cam_int_01_golden_fabron.webp'
                    : 'img/cameras/int_01/cam_int_01_open.webp';
            }
        }
    });

    // =========================================================
    // --- PANNEAU DEV : GESTION DES BOUTONS ---
    // =========================================================

    /**
     * Active ou désactive les boutons "avancer / reculer" du panneau dev
     * selon la position actuelle de l'animatronique sélectionné.
     * Empêche de reculer depuis le spawn ou d'avancer depuis la porte finale.
     */
    function updateDevButtonsState() {
        const animatronicName = devAnimatronicSelect.value;

        // Cas spécial : Golden Fabron est un toggle binaire (actif / inactif)
        if (animatronicName === 'GoldenFabron') {
            btnDevBackward.disabled               = !isGoldenFabronActive;
            btnDevBackward.style.opacity          = !isGoldenFabronActive ? '0.3' : '1';
            btnDevBackward.style.cursor           = !isGoldenFabronActive ? 'not-allowed' : 'pointer';
            btnDevForward.disabled                = isGoldenFabronActive;
            btnDevForward.style.opacity           = isGoldenFabronActive  ? '0.3' : '1';
            btnDevForward.style.cursor            = isGoldenFabronActive  ? 'not-allowed' : 'pointer';
            return;
        }

        const pos      = currentPositions[animatronicName];
        const isAtSpawn= (pos === 'ext_03' || pos === 'ext_01_0');
        const isAtDoor = (pos === 'porte_droite' || pos === 'porte_gauche' || pos === 'ext_01_3');

        btnDevBackward.disabled      = isAtSpawn;
        btnDevBackward.style.opacity = isAtSpawn ? '0.3' : '1';
        btnDevBackward.style.cursor  = isAtSpawn ? 'not-allowed' : 'pointer';
        btnDevForward.disabled       = isAtDoor;
        btnDevForward.style.opacity  = isAtDoor  ? '0.3' : '1';
        btnDevForward.style.cursor   = isAtDoor  ? 'not-allowed' : 'pointer';
    }

    if (devAnimatronicSelect) devAnimatronicSelect.addEventListener('change', updateDevButtonsState);

    // =========================================================
    // --- SYSTÈME DE TEMPÉRATURE & BLACKOUT ---
    // =========================================================

    /**
     * Déclenche le blackout (coupure de courant) lorsque la température atteint 100%.
     *
     * Séquence :
     * 1. Coupe tous les sons, ferme toutes les interfaces.
     * 2. Après 2s de noir absolu, lance la musique de Oneeyed à fond et démarre
     *    un clignotement aléatoire du visage de Oneeyed.
     * 3. Après un délai aléatoire (5s à 20s), déclenche le jumpscare de Oneeyed
     *    via le backend. Si le joueur atteint 6h AM entre-temps, il gagne.
     */
    function triggerBlackout() {
        if (isBlackout) return;
        isBlackout = true;

        // 1. COUPER TOUS LES SONS
        stopServerAmbiance();
        stopAllPhoneAudio();

        // 2. SON DE COUPURE DE COURANT
        playSFX('sfx_electric_zap.mp3');

        // 3. MASQUER TOUTES LES INTERFACES
        inWindowView = false;
        cameraSystem.classList.add('hidden');
        cameraEffects.classList.add('hidden');
        temperatureUI.classList.add('hidden');
        officeControls.classList.add('hidden');
        doorLeftZone.classList.add('hidden');
        doorRightZone.classList.add('hidden');
        windowZone.classList.add('hidden');

        mainViewImg.src = 'img/office/desk/desk_blackout.webp'; // Plonge la pièce dans le noir

        // --- SÉQUENCE ONEEYED (démarrage après 2s de silence total) ---
        setTimeout(() => {
            if (gameScreen.classList.contains('hidden')) return; // Sécurité : partie déjà terminée

            // Musique Oneeyed à volume maximal pendant tout le blackout
            oneeyedMusic.currentTime = 0;
            oneeyedMusic.volume = 1.0;
            oneeyedMusic.play().catch(e => console.error(e));

            // Clignotement aléatoire du visage de Oneeyed
            function flicker() {
                if (!isBlackout || gameScreen.classList.contains('hidden')) return;
                mainViewImg.src = mainViewImg.src.includes('desk_blackout_oneeyed')
                    ? 'img/office/desk/desk_blackout.webp'
                    : 'img/office/desk/desk_blackout_oneeyed.webp';

                let nextFlicker = Math.floor(Math.random() * 700) + 100; // Entre 100ms et 800ms
                flickerInterval = setTimeout(flicker, nextFlicker);
            }
            flicker();

            // Durée de survie aléatoire entre 5s et 20s avant le jumpscare fatal
            let timeBeforeDeath = Math.floor(Math.random() * 15000) + 5000;

            blackoutTimeout = setTimeout(async () => {
                clearTimeout(flickerInterval);
                if (!oneeyedMusic.paused) oneeyedMusic.pause();

                // Demande au backend de déclencher le jumpscare de Oneeyed
                const token = localStorage.getItem('fnaf_jwt');
                try {
                    await fetch('http://localhost:8080/api/game/dev/jumpscare', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ animatronic: "Oneeyed" })
                    });
                } catch (error) { console.error("Erreur fatal jumpscare", error); }

            }, timeBeforeDeath);

        }, 2000); // 2 secondes dans le noir absolu avant que Oneeyed prenne le contrôle
    }

    /**
 * Calcule et applique la variation de température à chaque tick (1/seconde).
 * NOUVELLE LOGIQUE :
 * - Refroidissement passif : -1.0 / tick
 * - Caméras actives seules : La température STAGNE (heatDelta = 0).
 * - Portes/Fenêtres fermées : La température augmente normalement.
 * - Gradation : La difficulté augmente doucement de 8% par nuit, uniquement à partir de la nuit 4.
 */
function calculateTemperature() {
    if (isBlackout) return;

    let heatDelta = -1.0; // Refroidissement passif de base
    let activeHeating = 0; // Chaleur générée par les actions du joueur

    // On calcule la chaleur générée par les éléments fermés
    if (isWindowClosed)      activeHeating += 2.0;
    if (!isServerDoorOpen)   activeHeating += 1.5;
    if (isLeftDoorClosed)    activeHeating += 0.75;
    if (isRightDoorClosed)   activeHeating += 0.75;

    let cappedNight = Math.min(activeNightLevel, 10);

    // Gestion de la caméra
    if (!cameraSystem.classList.contains('hidden')) {
        if (activeHeating === 0) {
            // Si on regarde les caméras ET que tout est ouvert -> STAGNATION
            heatDelta = 0;
        } else {
            // Si on regarde les caméras mais que des portes sont fermées -> Chauffe + Pénalité mineure
            heatDelta += activeHeating + 0.5; 
        }
    } else {
        // Bureau classique
        heatDelta += activeHeating;
    }

    // Si la pièce se réchauffe (heatDelta > 0), on applique le multiplicateur de difficulté
    if (heatDelta > 0) {
        // La gradation est nulle pour les nuits 1 à 3. 
        // À partir de la nuit 4, on augmente de 8% par nuit supplémentaire (au lieu de 15% dès la nuit 1).
        let extraNights = Math.max(0, cappedNight - 3);
        let difficultyMultiplier = 1 + (extraNights * 0.08);
        heatDelta *= difficultyMultiplier;
    }

    currentTemperature += heatDelta;

    // Clamping entre 0 et 100
    if (currentTemperature < 0)    currentTemperature = 0;
    if (currentTemperature >= 100) { currentTemperature = 100; triggerBlackout(); }

    // Mise à jour de l'UI
    tempBarFill.style.width       = currentTemperature + '%';
    tempPercentage.textContent    = Math.floor(currentTemperature) + '%';
}

    // =========================================================
    // --- LOGIQUE MENUS & AUTHENTIFICATION ---
    // =========================================================

    btnShowLogin.addEventListener('click',        () => { authModal.classList.remove('hidden'); authMessage.textContent = ''; });
    btnCloseAuth.addEventListener('click',        () => authModal.classList.add('hidden'));
    btnLogout.addEventListener('click',           () => { localStorage.removeItem('fnaf_jwt'); localStorage.removeItem('fnaf_user'); checkAuthStatus(); });
    btnLeaderboard.addEventListener('click',      () => { leaderboardModal.classList.remove('hidden'); fetchLeaderboard(); });
    btnCloseLeaderboard.addEventListener('click', () => leaderboardModal.classList.add('hidden'));

    btnNewGame.addEventListener('click', async () => {
        const token = localStorage.getItem('fnaf_jwt');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8080/api/game/start', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                inGameNight.textContent = data.night;
                inGameHour.textContent  = "12";
                activeNightLevel        = data.night;

                titleScreen.classList.add('hidden');

                // L'écran d'intro ne s'affiche qu'à la première nuit
                if (activeNightLevel === 1) {
                    const introScreen  = document.getElementById('intro-screen');
                    const introImage   = document.getElementById('intro-image');
                    const btnSkipIntro = document.getElementById('btn-skip-intro');

                    introScreen.classList.remove('hidden');
                    // Force le restart de l'animation CSS
                    introImage.style.animation = 'none';
                    introImage.offsetHeight; // Reflow
                    introImage.style.animation = null;

                    const skipIntro = () => {
                        clearTimeout(introTimeout);
                        introScreen.classList.add('hidden');
                        btnSkipIntro.removeEventListener('click', skipIntro);
                        launchGameCore();
                    };

                    btnSkipIntro.addEventListener('click', skipIntro);
                    introTimeout = setTimeout(skipIntro, 20000); // Skip automatique après 20s
                } else {
                    launchGameCore();
                }
            }
        } catch (error) { console.error("Impossible de lancer la partie", error); }
    });

    // =========================================================
    // --- AMBIANCE SALLE DES SERVEURS ---
    // =========================================================

    /**
     * Joue l'ambiance sonore de la salle des serveurs en boucle avec des pauses aléatoires.
     * - Durée de lecture : entre 10s et 25s
     * - Durée de silence : entre 8s et 15s
     * S'arrête automatiquement si un blackout est déclenché.
     */
    function loopServerAmbiance() {
        if (isBlackout) { stopServerAmbiance(); return; }

        if (isServerAmbiancePlaying) {
            serverAudio.pause();
            isServerAmbiancePlaying = false;
            let silenceTime = Math.floor(Math.random() * 7000) + 8000; // Pause entre 8s et 15s
            serverAmbianceTimeout = setTimeout(loopServerAmbiance, silenceTime);
        } else {
            serverAudio.play().catch(err => console.error("Erreur ambiance serveur :", err));
            isServerAmbiancePlaying = true;
            let playTime = Math.floor(Math.random() * 15000) + 10000; // Joue entre 10s et 25s
            serverAmbianceTimeout = setTimeout(loopServerAmbiance, playTime);
        }
    }

    /** Coupe immédiatement l'ambiance serveur et annule tous ses timers. */
    function stopServerAmbiance() {
        clearTimeout(serverAmbianceTimeout);
        serverAudio.pause();
        serverAudio.currentTime = 0;
        isServerAmbiancePlaying = false;
    }

    // =========================================================
    // --- LANCEMENT DU JEU ---
    // =========================================================

    /**
     * Initialise et démarre une session de jeu :
     * - Réinitialise tous les états (portes, température, positions)
     * - Lance le Phone Guy si nuit <= 3
     * - Démarre les intervalles de poll, de température, et de fermeture serveur
     */
    function launchGameCore() {
        stopServerAmbiance();
        loopServerAmbiance();
        gameScreen.classList.remove('hidden');

        // --- RESET DES ÉTATS ---
        isLeftDoorClosed    = false;
        isRightDoorClosed   = false;
        isWindowClosed      = false;
        inWindowView        = false;
        isServerDoorOpen    = true;
        isBlackout          = false;
        isGoldenFabronActive= false;

        // --- PHONE GUY (uniquement nuits 1, 2, 3) ---
        stopAllPhoneAudio();
        if (activeNightLevel <= 3) {
            setTimeout(() => {
                isPhoneRinging = true;
                btnPhone.innerHTML = "📞 Décrocher";
                btnPhone.classList.remove('hidden', 'active-call');
                btnPhone.classList.add('ringing');
                phoneRingAudio.currentTime = 0;
                phoneRingAudio.play();

                // Si le joueur ne décroche pas dans les 17s, la sonnerie s'arrête
                phoneRingTimeout = setTimeout(() => {
                    if (isPhoneRinging) stopAllPhoneAudio();
                }, 17000);
            }, 2000); // Sonnerie commence 2s après le lancement
        }

        // --- RESET TEMPÉRATURE ---
        currentTemperature          = 0;
        tempBarFill.style.width     = '0%';
        tempPercentage.textContent  = '0%';
        temperatureUI.classList.remove('hidden');

        // --- RESET UI ---
        btnWindow.textContent = "Fenêtre";
        cameraSystem.classList.add('hidden');
        cameraEffects.classList.add('hidden');
        officeControls.classList.remove('hidden');
        doorLeftZone.classList.remove('hidden');
        doorRightZone.classList.remove('hidden');
        windowZone.classList.add('hidden');

        // Affiche le panneau dev uniquement pour les comptes autorisés
        const devPanel = document.getElementById('dev-panel');
        if (devPanel) {
            const userDataStr = localStorage.getItem('fnaf_user');
            if (userDataStr) {
                const user  = JSON.parse(userDataStr);
                const isDev = (user.username === "Hamza" || user.username === "Nathan" || user.username === "Damien");
                devPanel.classList.toggle('hidden', !isDev);
            } else {
                devPanel.classList.add('hidden');
            }
        }

        // --- RESET POSITIONS ---
        currentCameraId  = 'int_01';
        currentPositions = { "Bluebear": "ext_03", "Redbear": "ext_03", "Burncap": "ext_01_0" };
        updateOfficeView();
        updateDevButtonsState();

        // --- DÉMARRAGE DES INTERVALLES ---
        if (gameInterval)      clearInterval(gameInterval);
        gameInterval = setInterval(pollGameState, 1000); // Sync avec le backend toutes les secondes

        if (tempInterval)      clearInterval(tempInterval);
        tempInterval = setInterval(calculateTemperature, 1000); // Calcul de température toutes les secondes

        if (serverDoorInterval) clearInterval(serverDoorInterval);
        serverDoorInterval = setInterval(() => {
            let cappedNight = Math.min(activeNightLevel, 10);

            // Chance de fermeture adoucie : 10% de base, +3% par nuit SEULEMENT après la nuit 3. Plafond à 45%.
let extraNights = Math.max(0, cappedNight - 3);
let closeChance = Math.min(0.10 + (extraNights * 0.03), 0.45);

            if (isServerDoorOpen && !isBlackout && Math.random() < closeChance) {
                isServerDoorOpen = false;
                stopServerAmbiance();
                playSFX('sfx_door_slam.mp3');

                // Met à jour le flux caméra si le joueur regarde int_01
                if (currentCameraId === 'int_01' && !cameraSystem.classList.contains('hidden')) {
                    camFeedImg.src = 'img/cameras/int_01/cam_int_01_empty.webp';
                    btnOpenServer.classList.remove('disabled');
                }
            }
        }, 8000); // Vérification toutes les 8s (moins agressif qu'une vérification toutes les 6s)
    }

    // =========================================================
    // --- BOUCLE PRINCIPALE : SYNCHRONISATION AVEC LE BACKEND ---
    // =========================================================

    /**
     * Envoie l'état actuel du bureau au backend et traite la réponse.
     * Appelée toutes les secondes via gameInterval.
     *
     * Données envoyées : état des portes, fenêtre, caméra active.
     * Données reçues   : heure, positions, événements sonores, statut (PLAYING / JUMPSCARE / WON).
     *
     * Gère :
     * - La mise à jour des positions et de l'affichage
     * - La musique de Oneeyed (play/pause selon caméra int_04)
     * - Les sons de pas quand un animatronique repart d'une porte
     * - Les événements ponctuels (frappe fenêtre, bruit de chaise)
     * - La séquence de JUMPSCARE (son + animation + transition vers game over)
     * - La séquence de VICTOIRE (animation 6 AM + mise à jour du score)
     */
    async function pollGameState() {
        const token        = localStorage.getItem('fnaf_jwt');
        const isCamActive  = !cameraSystem.classList.contains('hidden');
        const activeCamToSync = isCamActive ? currentCameraId : ""; // "" = pas de caméra active

        try {
            const response = await fetch('http://localhost:8080/api/game/state', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rightDoorClosed: isRightDoorClosed,
                    leftDoorClosed:  isLeftDoorClosed,
                    windowClosed:    isWindowClosed,
                    currentCamera:   activeCamToSync
                })
            });

            if (response.ok) {
                const state = await response.json();
                inGameHour.textContent = state.currentHour;

                // --- ÉVÉNEMENTS SONORES PONCTUELS ---
                if (state.events && state.events.length > 0) {
                    state.events.forEach(eventName => {
                        if (eventName === "sfx_window_knock") playSFX('sfx_window_knock.mp3'); // Burncap frappe à la vitre
                        if (eventName === "sfx_chair_scoot")  playSFX('sfx_chair_scoot.mp3');  // Son de chaise
                    });
                }

                // --- MISE À JOUR DES POSITIONS ---
                if (state.positions) {
                    let oldBBPos = currentPositions["Bluebear"];
                    let oldRBPos = currentPositions["Redbear"];
                    let oldOEPos = currentPositions["Oneeyed"];

                    currentPositions = state.positions;

                    // --- GESTION MUSIQUE ONEEYED ---
                    // La musique joue uniquement si Oneeyed est sur int_04 ET que le joueur regarde int_04
                    let isOeAtCam4       = currentPositions["Oneeyed"] === "int_04";
                    let isWatchingCam4   = !cameraSystem.classList.contains('hidden') && currentCameraId === 'int_04';

                    if (!isBlackout) {
                        if (isOeAtCam4 && isWatchingCam4) {
                            if (oneeyedMusic.paused) oneeyedMusic.play().catch(e => console.error(e));
                        } else {
                            if (!oneeyedMusic.paused) oneeyedMusic.pause();
                        }
                        if (!isOeAtCam4) oneeyedMusic.currentTime = 0; // Remet la musique à 0 si Oneeyed quitte int_04
                    }

                    // --- SONS DE PAS (animatronique quitte une porte sans tuer le joueur) ---
                    // Fade out de 2.5s pour que le son disparaisse progressivement
                    if (oldBBPos === 'porte_droite' && currentPositions["Bluebear"] !== 'porte_droite' && currentPositions["Bluebear"] !== 'office') playSFX('sfx_footsteps.mp3', 2500);
                    if (oldRBPos === 'porte_gauche' && currentPositions["Redbear"]  !== 'porte_gauche' && currentPositions["Redbear"]  !== 'office') playSFX('sfx_footsteps.mp3', 2500);
                    if (oldOEPos === 'porte_droite' && currentPositions["Oneeyed"]  !== 'porte_droite' && currentPositions["Oneeyed"]  !== 'office') playSFX('sfx_footsteps.mp3', 2500);

                    updateDevButtonsState();

                    // Rafraîchit l'image caméra ou le bureau selon la vue active
                    if (!cameraSystem.classList.contains('hidden') && currentCameraId !== 'int_01') {
                        camFeedImg.src = getCameraImageSrc(currentCameraId);
                    } else if (cameraSystem.classList.contains('hidden')) {
                        updateOfficeView();
                    }
                }

                // =========================================================
                // --- SÉQUENCE JUMPSCARE ---
                // =========================================================
                if (state.status === "JUMPSCARE") {
                    clearInterval(gameInterval);
                    if (serverDoorInterval) clearInterval(serverDoorInterval);
                    if (tempInterval)       clearInterval(tempInterval);
                    clearTimeout(blackoutTimeout);
                    clearTimeout(flickerInterval);

                    stopServerAmbiance();
                    stopAllPhoneAudio();
                    if (!oneeyedMusic.paused) oneeyedMusic.pause();

                    const attacker = state.jumpscareAnimatronic;
                    jumpscareImg.src = `img/jumpscares/jumpscare_${attacker.toLowerCase()}.png`;

                    // Burncap a un fichier audio en .m4a, les autres en .mp3
                    let audioExt = (attacker === "Burncap") ? "m4a" : "mp3";
                    const jumpscareSound = new Audio(`sound_effect/jumpscare_${attacker.toLowerCase()}.${audioExt}`);
                    jumpscareSound.volume = 1.0;
                    jumpscareSound.play().catch(err => console.error("Erreur lecture audio :", err));

                    // Redbear a sa propre classe d'animation CSS
                    const animClass = (attacker === "Redbear") ? 'redbear-active' : 'active';
                    jumpscareContainer.classList.add(animClass);

                    setTimeout(() => {
                        // Fondu noir instantané (sans transition CSS)
                        fadeOverlay.style.transition = "none";
                        fadeOverlay.classList.add('visible');

                        setTimeout(() => {
                            jumpscareSound.pause();
                            jumpscareSound.currentTime = 0;
                            jumpscareContainer.classList.remove('active', 'redbear-active');
                            cameraSystem.classList.add('hidden');
                            cameraEffects.classList.add('hidden');

                            btnTempDie.click(); // Appel à l'API /gameover pour sauvegarder le score

                            // Rétablir le fondu progressif après la transition
                            setTimeout(() => {
                                fadeOverlay.style.transition = "opacity 1.5s ease-in-out";
                                fadeOverlay.style.opacity    = "0";
                                setTimeout(() => {
                                    fadeOverlay.classList.remove('visible');
                                    fadeOverlay.style.opacity = "1";
                                }, 1500);
                            }, 500);

                        }, 100);
                    }, 2000); // Le jumpscare est affiché pendant 2s avant le fondu

                    return;
                }

                // =========================================================
// --- SÉQUENCE VICTOIRE (6 AM) ---
// =========================================================
if (state.status === "WON") {

                    // Arrêt de tous les systèmes de jeu
                    clearInterval(gameInterval);
                    if (serverDoorInterval) clearInterval(serverDoorInterval);
                    if (tempInterval)       clearInterval(tempInterval);
                    clearTimeout(blackoutTimeout);
                    clearTimeout(flickerInterval);

                    stopServerAmbiance();
                    stopAllPhoneAudio();
                    if (!oneeyedMusic.paused) oneeyedMusic.pause();

                    // Son de victoire joué immédiatement à l'apparition de l'écran 6 AM
                    const winSound = new Audio('sound_effect/sfx_6am.mp3');
                    winSound.volume = 1.0;
                    winSound.play().catch(e => console.error("Erreur son de victoire:", e));

                    // Basculer vers l'écran de victoire
                    gameScreen.classList.add('hidden');
                    cameraSystem.classList.add('hidden');
                    temperatureUI.classList.add('hidden');
                    victoryScreen.classList.remove('hidden');

                    // Réinitialisation instantanée du roller (sans transition) pour
                    // repartir de "5 AM" avant de lancer l'animation vers "6 AM"
                    hoursRoller.style.transition = 'none';
                    hoursRoller.style.transform  = 'translateY(0)';

                    setTimeout(() => {
                        // Animation du roller "5 → 6 AM" : démarre 1s après l'apparition
                        // de l'écran, déroule en 6s pour plus de dynamisme
                        hoursRoller.style.transition = 'transform 6s ease-in-out';
                        hoursRoller.style.transform  = 'translateY(-8rem)'; // -8rem = hauteur d'un chiffre (.hour)
                    }, 1000);

                    // Mise à jour du profil local avec le nouveau score et la nouvelle nuit
                    const userDataStr = localStorage.getItem('fnaf_user');
                    if (userDataStr) {
                        const user = JSON.parse(userDataStr);
                        user.currentNight = state.newCurrentNight;
                        user.bestScore    = state.newBestScore;
                        if (state.newCurrentNight > user.maxNight) user.maxNight = state.newCurrentNight;
                        localStorage.setItem('fnaf_user', JSON.stringify(user));
                    }

                    // Retour au menu après 8s :
                    // 1s (pause initiale) + 6s (animation roller) + 1s (moment de satisfaction)
                    setTimeout(() => {
                        victoryScreen.classList.add('hidden');
                        titleScreen.classList.remove('hidden');
                        cameraEffects.classList.remove('hidden');
                        checkAuthStatus();
                        fetchLeaderboard();
                    }, 8000);
                }
            }
        } catch (error) { console.error("Erreur de synchronisation", error); }
    }

    // =========================================================
    // --- PANNEAU DEV : DÉPLACEMENT FORCÉ D'ANIMATRONIQUES ---
    // =========================================================

    /**
     * Force le déplacement d'un animatronique vers l'avant ou l'arrière via l'API dev.
     * Pour Golden Fabron, toggle directement l'état local (pas d'appel API).
     * @param {'forward'|'backward'} direction
     */
    async function forceMoveAnimatronic(direction) {
        const token          = localStorage.getItem('fnaf_jwt');
        const animatronicName= devAnimatronicSelect.value;

        if (animatronicName === 'GoldenFabron') {
            isGoldenFabronActive = (direction === 'forward');
            if (currentCameraId === 'int_01') {
                if (isGoldenFabronActive) {
                    camFeedImg.src = 'img/cameras/int_01/cam_int_01_golden_fabron.webp';
                    btnOpenServer.classList.add('disabled');
                } else {
                    camFeedImg.src = isServerDoorOpen
                        ? 'img/cameras/int_01/cam_int_01_open.webp'
                        : 'img/cameras/int_01/cam_int_01_empty.webp';
                    if (!isServerDoorOpen) btnOpenServer.classList.remove('disabled');
                }
            }
            updateDevButtonsState();
            return;
        }

        try {
            await fetch('http://localhost:8080/api/game/dev/move', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction, animatronic: animatronicName })
            });
            pollGameState();
        } catch (error) { console.error("Impossible de forcer le mouvement", error); }
    }

    if (btnDevForward)  btnDevForward.addEventListener('click',  () => forceMoveAnimatronic('forward'));
    if (btnDevBackward) btnDevBackward.addEventListener('click', () => forceMoveAnimatronic('backward'));

    // Bouton "Jumpscare" du panneau dev
    if (btnDevJumpscare) {
        btnDevJumpscare.addEventListener('click', async () => {
            const animatronicName = devAnimatronicSelect.value;
            if (animatronicName === 'GoldenFabron') { triggerGoldenFabronCrash(); return; }

            const token = localStorage.getItem('fnaf_jwt');
            try {
                const response = await fetch('http://localhost:8080/api/game/dev/jumpscare', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ animatronic: animatronicName })
                });
                if (response.ok) pollGameState();
                else console.error("Erreur serveur jumpscare:", await response.text());
            } catch (error) { console.error("Impossible de forcer le jumpscare", error); }
        });
    }

    // =========================================================
    // --- FIN DE PARTIE (GAME OVER) ---
    // =========================================================

    // Bouton dev "mourir" ou appelé programmatiquement après un jumpscare
    btnTempDie.addEventListener('click', async () => {
        const token = localStorage.getItem('fnaf_jwt');
        try {
            const response = await fetch('http://localhost:8080/api/game/gameover', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                clearInterval(gameInterval);
                if (serverDoorInterval) clearInterval(serverDoorInterval);
                if (tempInterval)       clearInterval(tempInterval);

                stopServerAmbiance();
                stopAllPhoneAudio();
                if (!oneeyedMusic.paused) oneeyedMusic.pause();

                // Mise à jour du profil local
                const userDataStr = localStorage.getItem('fnaf_user');
                if (userDataStr) {
                    const user    = JSON.parse(userDataStr);
                    user.currentNight = data.currentNight;
                    user.bestScore    = data.bestScore;
                    localStorage.setItem('fnaf_user', JSON.stringify(user));
                }

                gameScreen.classList.add('hidden');
                cameraSystem.classList.add('hidden');
                temperatureUI.classList.add('hidden');
                gameOverScreen.classList.remove('hidden');
            }
        } catch (error) { console.error("Impossible de mourir", error); }
    });

    // Bouton "Retour au menu" depuis l'écran game over
    btnReturnMenuGo.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        cameraEffects.classList.remove('hidden');
        checkAuthStatus();
        fetchLeaderboard();
    });

    // =========================================================
    // --- AUTHENTIFICATION ---
    // =========================================================

    btnSubmitRegister.addEventListener('click', () => handleAuth('http://localhost:8080/api/auth/register'));
    btnSubmitLogin.addEventListener('click',    () => handleAuth('http://localhost:8080/api/auth/login'));

    // Bouton dev "Changer de nuit"
    if (btnDevSetNight) {
        btnDevSetNight.addEventListener('click', async () => {
            const token = localStorage.getItem('fnaf_jwt');
            if (!token) return;
            const targetNight = parseInt(devNightInput.value, 10);

            try {
                const response = await fetch('http://localhost:8080/api/game/dev/set-night', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ night: targetNight })
                });

                if (response.ok) {
                    const userDataStr = localStorage.getItem('fnaf_user');
                    if (userDataStr) {
                        const user = JSON.parse(userDataStr);
                        user.currentNight = targetNight;
                        if (targetNight > user.maxNight) user.maxNight = targetNight;
                        localStorage.setItem('fnaf_user', JSON.stringify(user));
                    }
                    checkAuthStatus();
                    btnNewGame.click();
                }
            } catch (error) { console.error("Erreur changement de nuit", error); }
        });
    }

    /**
     * Gère la soumission du formulaire de connexion ou d'inscription.
     * Stocke le JWT et les données utilisateur dans le localStorage en cas de succès.
     * @param {string} url - URL de l'endpoint API (/login ou /register)
     */
    async function handleAuth(url) {
        const username = inputUsername.value.trim();
        const password = inputPassword.value.trim();
        if (!username || !password) { authMessage.textContent = "Veuillez remplir tous les champs."; return; }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) throw new Error(await response.text());

            const data = await response.json();
            localStorage.setItem('fnaf_jwt', data.token);
            localStorage.setItem('fnaf_user', JSON.stringify({
                id:           data.id,
                username:     data.username,
                maxNight:     data.maxNight,
                bestScore:    data.bestScore,
                currentNight: data.currentNight
            }));

            authModal.classList.add('hidden');
            inputPassword.value = '';
            checkAuthStatus();
        } catch (error) { authMessage.textContent = error.message; }
    }

    /**
     * Vérifie si un utilisateur est connecté (JWT + données en localStorage).
     * Met à jour l'affichage du menu principal en conséquence :
     * - Connecté  : affiche les stats, le bouton "Jouer" / "Continue", masque "Se connecter"
     * - Déconnecté: masque les stats, affiche "Se connecter"
     */
    function checkAuthStatus() {
        const token       = localStorage.getItem('fnaf_jwt');
        const userDataStr = localStorage.getItem('fnaf_user');

        if (token && userDataStr) {
            const user = JSON.parse(userDataStr);
            document.getElementById('player-name-display').textContent = user.username;
            document.getElementById('max-night-display').textContent   = user.maxNight;
            document.getElementById('best-score-display').textContent  = user.bestScore;

            // Affiche "Continue - Night X" si le joueur a déjà progressé
            if (user.currentNight > 1) {
                btnNewGameText.textContent = "Continue";
                btnNewGameSub.textContent  = `Night ${user.currentNight}`;
            } else {
                btnNewGameText.textContent = "New Game";
                btnNewGameSub.textContent  = "";
            }

            btnShowLogin.classList.add('hidden');
            btnNewGame.classList.remove('hidden');
            playerStatsContainer.classList.remove('hidden');

            // Affiche le lien vers le panneau dev dans le menu pour les comptes autorisés
            if (devPanelTitle) {
                const isDev = (user.username === "Hamza" || user.username === "Nathan" || user.username === "Damien");
                devPanelTitle.classList.toggle('hidden', !isDev);
            }
        } else {
            btnShowLogin.classList.remove('hidden');
            btnNewGame.classList.add('hidden');
            playerStatsContainer.classList.add('hidden');
            if (devPanelTitle) devPanelTitle.classList.add('hidden');
        }
    }

    // =========================================================
    // --- CLASSEMENT (LEADERBOARD) ---
    // =========================================================

    /** Charge et affiche le classement depuis le backend. */
    async function fetchLeaderboard() {
        try {
            scoreBody.innerHTML = '<tr><td colspan="3">Connexion au réseau du Crous...</td></tr>';
            const response = await fetch('http://localhost:8080/api/leaderboard');
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

            const data = await response.json();
            scoreBody.innerHTML = '';

            if (data.length === 0) {
                scoreBody.innerHTML = '<tr><td colspan="3">Aucun score enregistré. Soyez le premier !</td></tr>';
                return;
            }

            data.forEach((player, index) => {
                const row = document.createElement('tr');
                if (index === 0) row.style.color = "gold"; // Le 1er est en or
                row.innerHTML = `<td>#${index + 1}</td><td>${player.playerName}</td><td>${player.scoreValue}</td>`;
                scoreBody.appendChild(row);
            });
        } catch (error) {
            scoreBody.innerHTML = '<tr><td colspan="3" style="color: red;">Erreur de connexion au serveur.</td></tr>';
        }
    }

    // =========================================================
    // --- EASTER EGG : GOLDEN FABRON ---
    // =========================================================

    /**
     * Déclenche la séquence spéciale de Golden Fabron :
     * - Coupe tous les systèmes de jeu (intervals, sons)
     * - Enregistre le game over côté serveur
     * - Affiche le jumpscare golden avec un son dédié
     * - Retourne au menu après un délai aléatoire (3s à 6s) simulant un "crash"
     */
    async function triggerGoldenFabronCrash() {
        clearInterval(gameInterval);
        if (serverDoorInterval) clearInterval(serverDoorInterval);
        if (tempInterval)       clearInterval(tempInterval);
        stopServerAmbiance();
        stopAllPhoneAudio();
        if (!oneeyedMusic.paused) oneeyedMusic.pause();

        // Sauvegarde du game over côté serveur
        const token = localStorage.getItem('fnaf_jwt');
        try {
            const response = await fetch('http://localhost:8080/api/game/gameover', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data        = await response.json();
                const userDataStr = localStorage.getItem('fnaf_user');
                if (userDataStr) {
                    const user        = JSON.parse(userDataStr);
                    user.currentNight = data.currentNight;
                    user.bestScore    = data.bestScore;
                    localStorage.setItem('fnaf_user', JSON.stringify(user));
                }
            }
        } catch (error) { console.error(error); }

        jumpscareImg.src = 'img/jumpscares/jumpscare_goldenfabron.png';
        const goldenSound = new Audio('sound_effect/jumpscare_golden_fabron.mp3');
        goldenSound.volume = 1.0;
        goldenSound.play().catch(err => console.error(err));
        jumpscareContainer.classList.add('golden-active');

        // Délai aléatoire de 3s à 6s avant le "retour au bureau" pour simuler un crash
        const crashDelay = Math.floor(Math.random() * 3000) + 3000;
        setTimeout(() => {
            goldenSound.pause();
            goldenSound.currentTime = 0;
            jumpscareContainer.classList.remove('golden-active');

            gameScreen.classList.add('hidden');
            temperatureUI.classList.add('hidden');
            titleScreen.classList.remove('hidden');
            cameraEffects.classList.remove('hidden');

            checkAuthStatus();
            fetchLeaderboard();
        }, crashDelay);
    }
});