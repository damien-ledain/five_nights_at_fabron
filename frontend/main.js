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

    let gameInterval;
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

        if (inWindowView) {
            mainViewImg.src = isWindowClosed ? 'img/office/window/window_closed.webp' : 'img/office/window/window_open.webp';
        } else {
            if (isLeftDoorClosed && isRightDoorClosed) {
                mainViewImg.src = 'img/office/desk/desk_closed.webp';
            } else if (isLeftDoorClosed) {
                mainViewImg.src = 'img/office/desk/desk_left_closed.webp';
            } else if (isRightDoorClosed) {
                mainViewImg.src = 'img/office/desk/desk_right_closed.webp';
            } else {
                mainViewImg.src = 'img/office/desk/desk_open.png';
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
    // --- LOGIQUE CAMÉRAS ---
    // =========================================================

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

    function updateCameraFeed(camId) {
        currentCameraId = camId; 
        
        // 1. Affiche l'effet VHS
        camTransition.classList.remove('hidden');
        camBtns.forEach(b => b.classList.remove('active'));
        document.querySelector(`.cam-btn[data-cam="${camId}"]`).classList.add('active');

        // 2. Met à jour l'image IMMÉDIATEMENT (plus de flash temporel d'ancienne porte)
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
            if (cameraFeeds[camId]) camFeedImg.src = cameraFeeds[camId];
        }

        // 3. Cache l'effet VHS après 150ms
        setTimeout(() => {
            camTransition.classList.add('hidden');
        }, 150); 
    }

    btnOpenServer.addEventListener('click', () => {
        if (!isServerDoorOpen && !isBlackout) {
            isServerDoorOpen = true;
            btnOpenServer.classList.add('disabled');
            if (currentCameraId === 'int_01') camFeedImg.src = 'img/cameras/int_01/cam_int_01_open.webp';
        }
    });

    // =========================================================
    // --- LOGIQUE DE TEMPÉRATURE ET BLACKOUT ---
    // =========================================================

    function triggerBlackout() {
        if (isBlackout) return;
        isBlackout = true;
        
        inWindowView = false;
        cameraSystem.classList.add('hidden');      
        cameraEffects.classList.add('hidden');
        
        // Cache la jauge
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

        // MAJ de la barre et du pourcentage texte
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

   let introTimeout; // Permet d'annuler le timer si on clique sur "Passer"

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

                // --- LOGIQUE D'INTRODUCTION ---
                if (activeNightLevel === 1) {
                    const introScreen = document.getElementById('intro-screen');
                    const introImage = document.getElementById('intro-image');
                    const btnSkipIntro = document.getElementById('btn-skip-intro');
                    
                    introScreen.classList.remove('hidden');

                    // Petite astuce pour relancer l'animation CSS si on meurt Nuit 1 et qu'on recommence
                    introImage.style.animation = 'none';
                    introImage.offsetHeight; 
                    introImage.style.animation = null;

                    const skipIntro = () => {
                        clearTimeout(introTimeout); // Stoppe le chrono de 10s
                        introScreen.classList.add('hidden');
                        btnSkipIntro.removeEventListener('click', skipIntro);
                        launchGameCore(); // Lance vraiment le jeu
                    };

                    btnSkipIntro.addEventListener('click', skipIntro);
                    introTimeout = setTimeout(skipIntro, 20000); // Passe au jeu après 20s
                } else {
                    // Si on est Nuit 2 ou +, on lance le jeu directement sans l'article
                    launchGameCore();
                }
            }
        } catch (error) { console.error("Impossible de lancer la partie", error); }
    });

    // Fonction qui s'occupe de réinitialiser le bureau et lancer les chronos
    function launchGameCore() {
        gameScreen.classList.remove('hidden');
        
        // --- RÉINITIALISATION ---
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
        updateOfficeView();

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
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const state = await response.json();
                inGameHour.textContent = state.currentHour;

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