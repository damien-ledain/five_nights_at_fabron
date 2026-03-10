// --- DICTIONNAIRE DES CAMÉRAS ---
const cameraFeeds = {
    'ext_01': 'img/cameras/ext_01/cam_ext_01_empty.webp',
    'ext_02': 'img/cameras/ext_02/cam_ext_02_empty.webp',
    'ext_03': 'img/cameras/ext_03/cam_ext_03_full.webp',
    'int_01': 'img/cameras/int_01/cam_int_01_open.webp',
    'int_02': 'img/cameras/int_02/cam_int_02_empty.webp',
    'int_03': 'img/cameras/int_03/cam_int_03_empty.webp',
    'int_04': 'img/cameras/int_04/cam_int_04.webp',      
    'int_05': 'img/cameras/int_05/cam_int_05_empty.webp',
    'esc_01': 'img/cameras/esc_01/cam_esc_01_empty.webp',
    'esc_02': 'img/cameras/esc_02/cam_esc_02_empty.webp',
    'esc_03': 'img/cameras/esc_03/cam_esc_03_empty.webp'
};

document.addEventListener('DOMContentLoaded', () => {

    const cameraEffects = document.getElementById('camera-effects');
    
    // Éléments du système de Jumpscare
    const jumpscareContainer = document.getElementById('jumpscare-container');
    const jumpscareImg = document.getElementById('jumpscare-img');

    const btnShowLogin = document.getElementById('btn-show-login');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnNewGameText = document.getElementById('btn-new-game-text');
    const btnNewGameSub = document.getElementById('btn-new-game-sub');
    const btnLeaderboard = document.getElementById('btn-leaderboard');
    const playerStatsContainer = document.getElementById('player-stats-container');
    const btnLogout = document.getElementById('btn-logout');

    const authModal = document.getElementById('auth-modal');
    const btnCloseAuth = document.getElementById('btn-close-auth');
    const inputUsername = document.getElementById('auth-username');
    const inputPassword = document.getElementById('auth-password');
    const btnSubmitLogin = document.getElementById('btn-submit-login');
    const btnSubmitRegister = document.getElementById('btn-submit-register');
    const authMessage = document.getElementById('auth-message');

    const leaderboardModal = document.getElementById('leaderboard-modal');
    const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
    const scoreBody = document.getElementById('score-body');

    const titleScreen = document.getElementById('title-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const victoryScreen = document.getElementById('victory-screen');
    const hoursRoller = document.getElementById('hours-roller');

    const btnTempDie = document.getElementById('btn-temp-die');
    const btnDevForward = document.getElementById('btn-dev-forward');
    const btnDevBackward = document.getElementById('btn-dev-backward');
    const devAnimatronicSelect = document.getElementById('dev-animatronic-select');
    const btnReturnMenuGo = document.getElementById('btn-return-menu-go');

    const inGameHour = document.getElementById('in-game-hour');
    const inGameNight = document.getElementById('in-game-night');
    
    // --- ÉLÉMENTS DU SYSTÈME DE JEU ---
    const mainViewImg = document.getElementById('main-view-img');
    const cameraSystem = document.getElementById('camera-system');
    const btnCamera = document.getElementById('btn-camera'); 
    const btnWindow = document.getElementById('btn-window'); 
    const btnCloseCamera = document.getElementById('btn-close-camera'); 
    const btnOpenServer = document.getElementById('btn-open-server');
    const officeControls = document.getElementById('office-controls');
    const camFeedImg = document.getElementById('cam-feed-img');
    const camBtns = document.querySelectorAll('.cam-btn');
    const camTransition = document.getElementById('cam-transition');

    const doorLeftZone = document.getElementById('door-left-zone');
    const doorRightZone = document.getElementById('door-right-zone');
    const windowZone = document.getElementById('window-zone');
    
    // UI TEMPÉRATURE
    const temperatureUI = document.getElementById('temperature-ui');
    const tempBarFill = document.getElementById('temp-bar-fill');
    const tempPercentage = document.getElementById('temp-percentage');
const fadeOverlay = document.getElementById('fade-overlay');
    let gameInterval;
    // On initialise les positions au spawn
    let currentPositions = { "Bluebear": "ext_03", "Redbear": "ext_03" };
    let serverDoorInterval;
    let tempInterval;
    let currentCameraId = 'int_01';
    let activeNightLevel = 1;

    // --- VARIABLES D'ÉTAT ---
    let isLeftDoorClosed = false;
    let isRightDoorClosed = false;
    let isWindowClosed = false;
    let inWindowView = false;
    let isServerDoorOpen = true; 
    let isBlackout = false;
    let currentTemperature = 0;

    checkAuthStatus();

    // =========================================================
    // --- LOGIQUE DES PORTES ET FENÊTRES ---
    // =========================================================

    function updateOfficeView() {
        if (isBlackout) return;

        // Bluebear est à DROITE, Redbear est à GAUCHE
        let bbAtDoor = (currentPositions["Bluebear"] === 'porte_droite');
        let rbAtDoor = (currentPositions["Redbear"] === 'porte_gauche');

        if (inWindowView) {
            mainViewImg.src = isWindowClosed ? 'img/office/window/window_closed.webp' : 'img/office/window/window_open.webp';
        } else {
            // 1. LES DEUX PORTES FERMÉES
            if (isLeftDoorClosed && isRightDoorClosed) {
                mainViewImg.src = 'img/office/desk/desk_closed.webp';
            } 
            
            // 2. SEULEMENT PORTE GAUCHE FERMÉE
            else if (isLeftDoorClosed) {
                if (bbAtDoor) {
                    mainViewImg.src = 'img/office/desk/desk_left_closed_bluebear_right.webp'; // NOUVEAU
                } else {
                    mainViewImg.src = 'img/office/desk/desk_left_closed.webp';
                }
            } 
            
            // 3. SEULEMENT PORTE DROITE FERMÉE
            else if (isRightDoorClosed) {
                if (rbAtDoor) {
                    mainViewImg.src = 'img/office/desk/desk_right_closed_redbear_left.webp'; // NOUVEAU
                } else {
                    mainViewImg.src = 'img/office/desk/desk_right_closed.webp';
                }
            } 
            
            // 4. LES DEUX PORTES OUVERTES
            else {
                if (bbAtDoor && rbAtDoor) {
                    mainViewImg.src = 'img/office/desk/desk_open_redbear_left_bluebear_right.webp';
                } else if (bbAtDoor) {
                    mainViewImg.src = 'img/office/desk/desk_open_bluebear_right.webp';
                } else if (rbAtDoor) {
                    mainViewImg.src = 'img/office/desk/desk_open_redbear_left.webp';
                } else {
                    mainViewImg.src = 'img/office/desk/desk_open.png';
                }
            }
        }
    }

    doorLeftZone.addEventListener('click', () => { if(!isBlackout) { isLeftDoorClosed = !isLeftDoorClosed; updateOfficeView(); } });
    doorRightZone.addEventListener('click', () => { if(!isBlackout) { isRightDoorClosed = !isRightDoorClosed; updateOfficeView(); } });
    windowZone.addEventListener('click', () => { if(!isBlackout) { isWindowClosed = !isWindowClosed; updateOfficeView(); } });

    btnWindow.addEventListener('click', () => {
        if (isBlackout) return;
        inWindowView = !inWindowView;
        if (inWindowView) {
            btnWindow.textContent = "Bureau";
            btnCamera.classList.add('hidden'); 
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
    // --- LOGIQUE CAMÉRAS DYNAMIQUE INSTANTANÉE ---
    // =========================================================

    function getCameraImageSrc(camId) {
        let bbLoc = currentPositions["Bluebear"];
        let rbLoc = currentPositions["Redbear"];

        // Logique spécifique pour le Spawn (EXT 03)
        if (camId === 'ext_03') {
            if (bbLoc === 'ext_03' && rbLoc === 'ext_03') {
                return 'img/cameras/ext_03/cam_ext_03_full.webp'; 
            } else if (rbLoc === 'ext_03') {
                return 'img/cameras/ext_03/cam_ext_03_bluebear_out.webp'; // BB est sorti
            } else if (bbLoc === 'ext_03') {
                return 'img/cameras/ext_03/cam_ext_03_redbear_out.webp'; // RB est sorti (théoriquement impossible au début)
            } else {
                return 'img/cameras/ext_03/cam_ext_03_empty.webp'; // Les deux sont partis
            }
        } 
        
        // Logique quand ils peuvent se croiser ou se pousser
        // On affiche celui qui est sur la cam. Si les deux y sont (poussée), on affiche le dernier arrivé (ici Redbear)
        if (rbLoc === camId) return `img/cameras/${camId}/cam_${camId}_redbear.webp`;
        if (bbLoc === camId) return `img/cameras/${camId}/cam_${camId}_bluebear.webp`;
        
        return cameraFeeds[camId] || '';
    }

    function updateCameraFeed(camId) {
        currentCameraId = camId; 
        
        camTransition.classList.remove('hidden');
        camBtns.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.cam-btn[data-cam="${camId}"]`);
        if(activeBtn) activeBtn.classList.add('active');

        if (camId === 'int_01') {
            btnOpenServer.classList.remove('hidden');
            if (isServerDoorOpen) {
                camFeedImg.src = 'img/cameras/int_01/cam_int_01_open.webp';
                btnOpenServer.classList.add('disabled'); 
            } else {
                camFeedImg.src = 'img/cameras/int_01/cam_int_01_empty.webp'; 
                btnOpenServer.classList.remove('disabled'); 
            }
        } else {
            btnOpenServer.classList.add('hidden');
            camFeedImg.src = getCameraImageSrc(camId);
        }

        setTimeout(() => {
            camTransition.classList.add('hidden');
        }, 150); 
    }

    btnCamera.addEventListener('click', () => {
        if (isBlackout) return;
        officeControls.classList.add('hidden');
        doorLeftZone.classList.add('hidden');
        doorRightZone.classList.add('hidden');
        cameraSystem.classList.remove('hidden');
        cameraEffects.classList.remove('hidden');
        updateCameraFeed(currentCameraId);
    });

    btnCloseCamera.addEventListener('click', () => {
        cameraSystem.classList.add('hidden');      
        cameraEffects.classList.add('hidden');     
        officeControls.classList.remove('hidden'); 
        doorLeftZone.classList.remove('hidden');
        doorRightZone.classList.remove('hidden');
    });

    camBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isBlackout) return;
            const selectedCam = e.currentTarget.getAttribute('data-cam');
            if(selectedCam !== currentCameraId) {
                updateCameraFeed(selectedCam);
            }
        });
    });

    btnOpenServer.addEventListener('click', () => {
        if (!isServerDoorOpen && !isBlackout) {
            isServerDoorOpen = true;
            btnOpenServer.classList.add('disabled');
            if (currentCameraId === 'int_01') camFeedImg.src = 'img/cameras/int_01/cam_int_01_open.webp';
        }
    });

    // =========================================================
    // --- GESTION DES LIMITES DES BOUTONS DEV ---
    // =========================================================

    function updateDevButtonsState() {
        const animatronicName = devAnimatronicSelect.value;
        const pos = currentPositions[animatronicName];

        const isAtSpawn = (pos === 'ext_03');
        const isAtDoor = (pos === 'porte_droite' || pos === 'porte_gauche');

        btnDevBackward.disabled = isAtSpawn;
        btnDevBackward.style.opacity = isAtSpawn ? '0.3' : '1';
        btnDevBackward.style.cursor = isAtSpawn ? 'not-allowed' : 'pointer';

        btnDevForward.disabled = isAtDoor;
        btnDevForward.style.opacity = isAtDoor ? '0.3' : '1';
        btnDevForward.style.cursor = isAtDoor ? 'not-allowed' : 'pointer';
    }

    if(devAnimatronicSelect) devAnimatronicSelect.addEventListener('change', updateDevButtonsState);

    // =========================================================
    // --- LOGIQUE DE TEMPÉRATURE ET BLACKOUT ---
    // =========================================================

    function triggerBlackout() {
        if (isBlackout) return;
        isBlackout = true;
        
        inWindowView = false;
        cameraSystem.classList.add('hidden');      
        cameraEffects.classList.add('hidden');
        
        temperatureUI.classList.add('hidden');
        mainViewImg.src = 'img/office/desk/desk_blackout.webp';
        
        officeControls.classList.add('hidden');
        doorLeftZone.classList.add('hidden');
        doorRightZone.classList.add('hidden');
        windowZone.classList.add('hidden');
    }

    function calculateTemperature() {
        if (isBlackout) return; 

        let heatDelta = -2.0; 
        
        if (isWindowClosed) heatDelta += 3.5;
        if (!isServerDoorOpen) heatDelta += 2.5;
        if (isLeftDoorClosed) heatDelta += 1.25;
        if (isRightDoorClosed) heatDelta += 1.25;
        if (!cameraSystem.classList.contains('hidden')) heatDelta += 1.0;

        if (heatDelta > 0) {
            let difficultyMultiplier = 1 + ((Math.min(activeNightLevel, 10) - 1) * 0.15);
            heatDelta *= difficultyMultiplier;
        }

        currentTemperature += heatDelta;

        if (currentTemperature < 0) currentTemperature = 0;
        if (currentTemperature >= 100) {
            currentTemperature = 100;
            triggerBlackout();
        }

        tempBarFill.style.width = currentTemperature + '%';
        tempPercentage.textContent = Math.floor(currentTemperature) + '%';
    }

    // =========================================================
    // --- LOGIQUE MENUS ET AUTHENTIFICATION ---
    // =========================================================

    btnShowLogin.addEventListener('click', () => { authModal.classList.remove('hidden'); authMessage.textContent = ''; });
    btnCloseAuth.addEventListener('click', () => authModal.classList.add('hidden'));
    btnLogout.addEventListener('click', () => { localStorage.removeItem('fnaf_jwt'); localStorage.removeItem('fnaf_user'); checkAuthStatus(); });
    btnLeaderboard.addEventListener('click', () => { leaderboardModal.classList.remove('hidden'); fetchLeaderboard(); });
    btnCloseLeaderboard.addEventListener('click', () => leaderboardModal.classList.add('hidden'));

    let introTimeout; 

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
                inGameHour.textContent = "12";
                activeNightLevel = data.night; 
                
                titleScreen.classList.add('hidden');

                if (activeNightLevel === 1) {
                    const introScreen = document.getElementById('intro-screen');
                    const introImage = document.getElementById('intro-image');
                    const btnSkipIntro = document.getElementById('btn-skip-intro');
                    
                    introScreen.classList.remove('hidden');
                    introImage.style.animation = 'none';
                    introImage.offsetHeight; 
                    introImage.style.animation = null;

                    const skipIntro = () => {
                        clearTimeout(introTimeout);
                        introScreen.classList.add('hidden');
                        btnSkipIntro.removeEventListener('click', skipIntro);
                        launchGameCore();
                    };

                    btnSkipIntro.addEventListener('click', skipIntro);
                    introTimeout = setTimeout(skipIntro, 20000);
                } else {
                    launchGameCore();
                }
            }
        } catch (error) { console.error("Impossible de lancer la partie", error); }
    });

    function launchGameCore() {
        gameScreen.classList.remove('hidden');
        
        isLeftDoorClosed = false;
        isRightDoorClosed = false;
        isWindowClosed = false;
        inWindowView = false;
        isServerDoorOpen = true; 
        isBlackout = false;
        
        currentTemperature = 0;
        tempBarFill.style.width = '0%';
        tempPercentage.textContent = '0%';
        temperatureUI.classList.remove('hidden');
        
        btnWindow.textContent = "Fenêtre";
        
        cameraSystem.classList.add('hidden'); 
        cameraEffects.classList.add('hidden'); 
        officeControls.classList.remove('hidden');
        doorLeftZone.classList.remove('hidden');
        doorRightZone.classList.remove('hidden');
        windowZone.classList.add('hidden');
        
        currentCameraId = 'int_01'; 
        currentPositions = { "Bluebear": "ext_03", "Redbear": "ext_03" };
        updateOfficeView();
        updateDevButtonsState();

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(pollGameState, 1000);

        if (tempInterval) clearInterval(tempInterval);
        tempInterval = setInterval(calculateTemperature, 1000); 

        if (serverDoorInterval) clearInterval(serverDoorInterval);
        serverDoorInterval = setInterval(() => {
            if (isServerDoorOpen && !isBlackout && Math.random() < 0.4) {
                isServerDoorOpen = false;
                if (currentCameraId === 'int_01' && !cameraSystem.classList.contains('hidden')) {
                    camFeedImg.src = 'img/cameras/int_01/cam_int_01_empty.webp';
                    btnOpenServer.classList.remove('disabled');
                }
            }
        }, 3000);
    }

    async function pollGameState() {
        const token = localStorage.getItem('fnaf_jwt');
        try {
            const response = await fetch('http://localhost:8080/api/game/state', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    rightDoorClosed: isRightDoorClosed,
                    leftDoorClosed: isLeftDoorClosed
                })
            });

            if (response.ok) {
                const state = await response.json();
                inGameHour.textContent = state.currentHour;

                if (state.positions) {
                    let oldBBPos = currentPositions["Bluebear"];
                    let oldRBPos = currentPositions["Redbear"];
                    
                    currentPositions = state.positions;
                    
                    updateDevButtonsState();
                    
                    if (!cameraSystem.classList.contains('hidden') && currentCameraId !== 'int_01') {
                        camFeedImg.src = getCameraImageSrc(currentCameraId);
                    }
                    else if (cameraSystem.classList.contains('hidden')) {
                        // Si l'un des deux a bougé, on rafraîchit le bureau
                        if (oldBBPos !== currentPositions["Bluebear"] || oldRBPos !== currentPositions["Redbear"]) {
                            updateOfficeView();
                        }
                    }
                }

                const staticTransition = document.getElementById('static-transition');

if (state.status === "JUMPSCARE") {
    clearInterval(gameInterval);
    if (serverDoorInterval) clearInterval(serverDoorInterval);
    if (tempInterval) clearInterval(tempInterval);

    const attacker = state.jumpscareAnimatronic;
    jumpscareImg.src = `img/jumpscares/jumpscare_${attacker.toLowerCase()}.png`;
    
    // 1. Lancement du Screamer
    const animClass = (attacker === "Redbear") ? 'redbear-active' : 'active';
    jumpscareContainer.classList.add(animClass);
    
    // 2. Transition : On coupe le screamer avec un écran noir brutal
    setTimeout(() => {
        // Affichage instantané du noir
        fadeOverlay.style.transition = "none";
        fadeOverlay.classList.add('visible');

        setTimeout(() => {
            // 3. PENDANT que c'est noir, on change l'écran en dessous
            jumpscareContainer.classList.remove('active', 'redbear-active');
            cameraSystem.classList.add('hidden');
            cameraEffects.classList.add('hidden');

            // On switch sur le Game Over (le changement est invisible car c'est noir)
            btnTempDie.click(); 

            // 4. On attend un petit instant que le Game Over soit chargé
            setTimeout(() => {
                // 5. On fait réapparaître l'écran (Fade In du Game Over)
                fadeOverlay.style.transition = "opacity 1.5s ease-in-out";
                fadeOverlay.style.opacity = "0";

                setTimeout(() => {
                    fadeOverlay.classList.remove('visible');
                    fadeOverlay.style.opacity = "1"; // Reset pour la prochaine fois
                }, 1500);
            }, 500); // Temps de pause dans le noir total

        }, 100); 
    }, 2000); // On laisse le screamer 2 secondes entières
    
    return;
}

                if (state.status === "WON") {
                    clearInterval(gameInterval);
                    if (serverDoorInterval) clearInterval(serverDoorInterval); 
                    if (tempInterval) clearInterval(tempInterval); 
                    
                    gameScreen.classList.add('hidden');
                    cameraSystem.classList.add('hidden'); 
                    temperatureUI.classList.add('hidden');
                    victoryScreen.classList.remove('hidden');
                    
                    hoursRoller.style.transition = 'none';
                    hoursRoller.style.transform = 'translateY(0)';
                    
                    setTimeout(() => {
                        hoursRoller.style.transition = 'transform 2s ease-in-out';
                        hoursRoller.style.transform = 'translateY(-8rem)';
                    }, 1000);
                    
                    const userDataStr = localStorage.getItem('fnaf_user');
                    if (userDataStr) {
                        const user = JSON.parse(userDataStr);
                        user.currentNight = state.newCurrentNight;
                        user.bestScore = state.newBestScore; 
                        if (state.newCurrentNight > user.maxNight) user.maxNight = state.newCurrentNight;
                        localStorage.setItem('fnaf_user', JSON.stringify(user));
                    }

                    setTimeout(() => {
                        victoryScreen.classList.add('hidden');
                        titleScreen.classList.remove('hidden');
                        cameraEffects.classList.remove('hidden'); 
                        checkAuthStatus();
                        fetchLeaderboard();
                    }, 6000);
                }
            }
        } catch (error) { console.error("Erreur de synchronisation", error); }
    }

    // --- LOGIQUE BOUTONS DEV ---
    async function forceMoveAnimatronic(direction) {
        const token = localStorage.getItem('fnaf_jwt');
        const animatronicName = devAnimatronicSelect.value;
        try {
            await fetch('http://localhost:8080/api/game/dev/move', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    direction: direction,
                    animatronic: animatronicName
                })
            });
            pollGameState();
        } catch (error) { console.error("Impossible de forcer le mouvement", error); }
    }

    if(btnDevForward) btnDevForward.addEventListener('click', () => forceMoveAnimatronic('forward'));
    if(btnDevBackward) btnDevBackward.addEventListener('click', () => forceMoveAnimatronic('backward'));

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
                if (tempInterval) clearInterval(tempInterval); 
                
                const userDataStr = localStorage.getItem('fnaf_user');
                if (userDataStr) {
                    const user = JSON.parse(userDataStr);
                    user.currentNight = data.currentNight;
                    user.bestScore = data.bestScore; 
                    localStorage.setItem('fnaf_user', JSON.stringify(user));
                }

                gameScreen.classList.add('hidden');
                cameraSystem.classList.add('hidden');
                temperatureUI.classList.add('hidden');
                gameOverScreen.classList.remove('hidden');
            }
        } catch (error) { console.error("Impossible de mourir", error); }
    });

    btnReturnMenuGo.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        cameraEffects.classList.remove('hidden'); 
        checkAuthStatus();
        fetchLeaderboard(); 
    });

    btnSubmitRegister.addEventListener('click', () => handleAuth('http://localhost:8080/api/auth/register'));
    btnSubmitLogin.addEventListener('click', () => handleAuth('http://localhost:8080/api/auth/login'));

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
                username: data.username, maxNight: data.maxNight, bestScore: data.bestScore, currentNight: data.currentNight
            }));

            authModal.classList.add('hidden');
            inputPassword.value = '';
            checkAuthStatus();
        } catch (error) { authMessage.textContent = error.message; }
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('fnaf_jwt');
        const userDataStr = localStorage.getItem('fnaf_user');

        if (token && userDataStr) {
            const user = JSON.parse(userDataStr);
            document.getElementById('player-name-display').textContent = user.username;
            document.getElementById('max-night-display').textContent = user.maxNight;
            document.getElementById('best-score-display').textContent = user.bestScore;

            if (user.currentNight > 1) {
                btnNewGameText.textContent = "Continue";
                btnNewGameSub.textContent = `Night ${user.currentNight}`;
            } else {
                btnNewGameText.textContent = "New Game";
                btnNewGameSub.textContent = "";
            }

            btnShowLogin.classList.add('hidden');
            btnNewGame.classList.remove('hidden');
            playerStatsContainer.classList.remove('hidden');
        } else {
            btnShowLogin.classList.remove('hidden');
            btnNewGame.classList.add('hidden');
            playerStatsContainer.classList.add('hidden');
        }
    }

    async function fetchLeaderboard() {
        try {
            scoreBody.innerHTML = '<tr><td colspan="3">Connexion au réseau du Crous...</td></tr>';
            const response = await fetch('http://localhost:8080/api/leaderboard');
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            const data = await response.json();
            scoreBody.innerHTML = '';
            if (data.length === 0) return scoreBody.innerHTML = '<tr><td colspan="3">Aucun score enregistré. Soyez le premier !</td></tr>';
            data.forEach((player, index) => {
                const row = document.createElement('tr');
                if (index === 0) row.style.color = "gold";
                row.innerHTML = `<td>#${index + 1}</td><td>${player.playerName}</td><td>${player.scoreValue}</td>`;
                scoreBody.appendChild(row);
            });
        } catch (error) { scoreBody.innerHTML = '<tr><td colspan="3" style="color: red;">Erreur de connexion au serveur.</td></tr>'; }
    }
});