document.addEventListener('DOMContentLoaded', () => {

    const btnShowLogin = document.getElementById('btn-show-login');
    const btnNewGame = document.getElementById('btn-new-game');
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

    checkAuthStatus();

    btnShowLogin.addEventListener('click', () => {
        authModal.classList.remove('hidden');
        authMessage.textContent = '';
    });

    btnCloseAuth.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('fnaf_jwt');
        localStorage.removeItem('fnaf_user');
        checkAuthStatus(); 
    });

    btnNewGame.addEventListener('click', () => {
        alert("Initialisation de la nuit... (Le jeu s'arrête ici pour le moment)");
    });

    btnLeaderboard.addEventListener('click', () => {
        leaderboardModal.classList.remove('hidden');
        fetchLeaderboard();
    });

    btnCloseLeaderboard.addEventListener('click', () => {
        leaderboardModal.classList.add('hidden');
    });

    btnSubmitRegister.addEventListener('click', () => handleAuth('http://localhost:8080/api/auth/register'));
    btnSubmitLogin.addEventListener('click', () => handleAuth('http://localhost:8080/api/auth/login'));

    async function handleAuth(url) {
        const username = inputUsername.value.trim();
        const password = inputPassword.value.trim();

        if (!username || !password) {
            authMessage.textContent = "Veuillez remplir tous les champs.";
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Erreur lors de l'authentification");
            }

            const data = await response.json();
            
            localStorage.setItem('fnaf_jwt', data.token);
            localStorage.setItem('fnaf_user', JSON.stringify({
                username: data.username,
                maxNight: data.maxNight,
                bestScore: data.bestScore
            }));

            authModal.classList.add('hidden');
            inputPassword.value = '';
            checkAuthStatus();

        } catch (error) {
            authMessage.textContent = error.message;
        }
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('fnaf_jwt');
        const userDataStr = localStorage.getItem('fnaf_user');

        if (token && userDataStr) {
            const user = JSON.parse(userDataStr);
            document.getElementById('player-name-display').textContent = user.username;
            document.getElementById('max-night-display').textContent = user.maxNight;
            document.getElementById('best-score-display').textContent = user.bestScore;

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

            if (data.length === 0) {
                scoreBody.innerHTML = '<tr><td colspan="3">Aucun score enregistré. Soyez le premier !</td></tr>';
                return;
            }

            data.forEach((player, index) => {
                const row = document.createElement('tr');
                if (index === 0) row.style.color = "gold";
                row.innerHTML = `<td>#${index + 1}</td><td>${player.playerName}</td><td>${player.scoreValue}</td>`;
                scoreBody.appendChild(row);
            });
        } catch (error) {
            scoreBody.innerHTML = '<tr><td colspan="3" style="color: red;">Erreur de connexion au serveur.</td></tr>';
        }
    }
});