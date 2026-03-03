// --- DICTIONNAIRE DES CAMÉRAS ---
const cameraFeeds = {
    'ext_01': 'img/cameras/ext_01/cam_ext_01_empty.webp',
    'ext_02': 'img/cameras/ext_02/cam_ext_02_empty.webp',
    'ext_03': 'img/cameras/ext_03/cam_ext_03_full.webp', // Image par défaut pour EXT_03
    'int_01': 'img/cameras/int_01/cam_int_01_open.webp', // Image par défaut pour INT_01
    'int_02': 'img/cameras/int_02/cam_int_02_empty.webp',
    'int_03': 'img/cameras/int_03/cam_int_03_empty.webp',
    'int_04': 'img/cameras/int_04/cam_int_04.webp',      // Image unique pour INT_04
    'int_05': 'img/cameras/int_05/cam_int_05_empty.webp',
    'esc_01': 'img/cameras/esc_01/cam_esc_01_empty.webp',
    'esc_02': 'img/cameras/esc_02/cam_esc_02_empty.webp',
    'esc_03': 'img/cameras/esc_03/cam_esc_03_empty.webp'
};

document.addEventListener('DOMContentLoaded', () => {

    const cameraEffects = document.getElementById('camera-effects');

    // Éléments du Menu
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

    // Écrans
    const titleScreen = document.getElementById('title-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const victoryScreen = document.getElementById('victory-screen');
    const hoursRoller = document.getElementById('hours-roller');

    const btnTempDie = document.getElementById('btn-temp-die');
    const btnReturnMenuGo = document.getElementById('btn-return-menu-go');

    const inGameHour = document.getElementById('in-game-hour');
    const inGameNight = document.getElementById('in-game-night');
    
    // --- ÉLÉMENTS DU SYSTÈME DE CAMÉRAS ---
    const cameraSystem = document.getElementById('camera-system');
    const btnCamera = document.getElementById('btn-camera'); 
    const btnCloseCamera = document.getElementById('btn-close-camera'); 
    const officeControls = document.getElementById('office-controls');
    const camFeedImg = document.getElementById('cam-feed-img');
    const camBtns = document.querySelectorAll('.cam-btn');

    let gameInterval;
    let currentCameraId = 'int_01'; // La caméra sélectionnée par défaut

    checkAuthStatus();

    // --- LOGIQUE D'OUVERTURE / FERMETURE INSTANTANÉE DES CAMÉRAS ---

    // 1. Clic sur le bouton rouge "Caméras" (SANS ANIMATION)
    btnCamera.addEventListener('click', () => {
        officeControls.classList.add('hidden');   // Cache les boutons du bureau
        cameraSystem.classList.remove('hidden');  // Montre l'écran caméras INSTANTANÉMENT
        cameraEffects.classList.remove('hidden'); // Active le bruit blanc
        
        // Met l'image de la dernière caméra regardée (ou int_01 par défaut)
        updateCameraFeed(currentCameraId);
    });

    // 2. Clic sur le bouton "Fermer Caméras" (SANS ANIMATION)
    btnCloseCamera.addEventListener('click', () => {
        cameraSystem.classList.add('hidden');      // Cache le plan et l'image de cam
        cameraEffects.classList.add('hidden');     // Enlève le bruit blanc
        officeControls.classList.remove('hidden'); // Réaffiche les boutons du bureau INSTANTANÉMENT
    });

    // 3. Clic sur une caméra dans le plan
    camBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedCam = e.currentTarget.getAttribute('data-cam');
            updateCameraFeed(selectedCam);
        });
    });

    // Fonction de mise à jour de l'image
    function updateCameraFeed(camId) {
        currentCameraId = camId; // Mémorise la caméra
        
        if (cameraFeeds[camId]) {
            camFeedImg.src = cameraFeeds[camId];
        } else {
            console.error("L'image n'existe pas dans le dictionnaire pour :", camId);
        }
        
        // Change la couleur des boutons sur le plan
        camBtns.forEach(b => b.classList.remove('active'));
        document.querySelector(`.cam-btn[data-cam="${camId}"]`).classList.add('active');
    }

    // --- FIN LOGIQUE CAMÉRAS ---


    // --- LOGIQUE MENUS ET AUTHENTIFICATION ---

    btnShowLogin.addEventListener('click', () => { authModal.classList.remove('hidden'); authMessage.textContent = ''; });
    btnCloseAuth.addEventListener('click', () => authModal.classList.add('hidden'));
    btnLogout.addEventListener('click', () => { localStorage.removeItem('fnaf_jwt'); localStorage.removeItem('fnaf_user'); checkAuthStatus(); });
    btnLeaderboard.addEventListener('click', () => { leaderboardModal.classList.remove('hidden'); fetchLeaderboard(); });
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
                inGameHour.textContent = "12";
                
                titleScreen.classList.add('hidden');
                gameScreen.classList.remove('hidden');
                
                // Bureau propre
                cameraSystem.classList.add('hidden'); // Sécurité
                cameraEffects.classList.add('hidden'); 
                officeControls.classList.remove('hidden');
                currentCameraId = 'int_01'; // Réinitialise la caméra à chaque nouvelle partie !

                if (gameInterval) clearInterval(gameInterval);
                gameInterval = setInterval(pollGameState, 1000);
            }
        } catch (error) { console.error("Impossible de lancer la partie", error); }
    });

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
                    gameScreen.classList.add('hidden');
                    cameraSystem.classList.add('hidden'); 
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
                        cameraEffects.classList.remove('hidden'); // Le bruit revient sur le menu
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
                
                const userDataStr = localStorage.getItem('fnaf_user');
                if (userDataStr) {
                    const user = JSON.parse(userDataStr);
                    user.currentNight = data.currentNight;
                    user.bestScore = data.bestScore; 
                    localStorage.setItem('fnaf_user', JSON.stringify(user));
                }

                gameScreen.classList.add('hidden');
                cameraSystem.classList.add('hidden');
                gameOverScreen.classList.remove('hidden');
            }
        } catch (error) { console.error("Impossible de mourir", error); }
    });

    btnReturnMenuGo.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        cameraEffects.classList.remove('hidden'); // Le bruit revient sur le menu
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