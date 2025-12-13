import { Leaderboard } from './Leaderboard.js';

export class Menu {
    constructor() {
        // Screens
        this.menuScreen = document.getElementById('menu-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.leaderboardScreen = document.getElementById('leaderboard-screen');
        this.gameOverModal = document.getElementById('game-over-modal');

        // Menu buttons
        this.btnSingle = document.getElementById('btn-single');
        this.btnMulti = document.getElementById('btn-multi');
        this.btnLeaderboard = document.getElementById('btn-leaderboard');

        // Multi setup
        this.multiSetup = document.getElementById('multi-setup');
        this.playerNamesContainer = document.getElementById('player-names-container');
        this.btnStartMulti = document.getElementById('btn-start-multi');
        this.btnBackMenu = document.getElementById('btn-back-menu');

        // Difficulty setup
        this.difficultySetup = document.getElementById('difficulty-setup');
        this.btnBackDifficulty = document.getElementById('btn-back-difficulty');

        // Leaderboard
        this.leaderboard = new Leaderboard();
        this.btnLeaderboardBack = document.getElementById('btn-leaderboard-back');

        // Game callbacks
        this.onStartGame = null; // Set by main.js

        // State
        this.selectedPlayerCount = 0;
        this.playerNames = [];
        this.pendingMode = null; // 'single' or 'multi'
        this.selectedDifficulty = 'easy'; // default
    }

    init() {
        // Mode selection
        this.btnSingle.addEventListener('click', () => this.startSinglePlayer());
        this.btnMulti.addEventListener('click', () => this.showMultiSetup());
        this.btnLeaderboard.addEventListener('click', () => this.showLeaderboard());

        // Multi setup
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPlayerCount(parseInt(e.target.dataset.count)));
        });
        this.btnStartMulti.addEventListener('click', () => this.proceedTodifficulty());
        this.btnBackMenu.addEventListener('click', () => this.hideMultiSetup());

        // Difficulty setup
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.currentTarget.dataset.difficulty));
        });
        this.btnBackDifficulty.addEventListener('click', () => this.hideDifficultySetup());

        // Leaderboard tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLeaderboardTab(e.target.dataset.tab));
        });
        this.btnLeaderboardBack.addEventListener('click', () => this.showMenu());

        // Game over modal buttons
        document.getElementById('btn-save-score').addEventListener('click', () => this.saveScore());
        document.getElementById('btn-play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('btn-modal-menu').addEventListener('click', () => this.backToMenuFromModal());

        // In-game back button
        document.getElementById('btn-back-to-menu').addEventListener('click', () => this.showMenu());
    }

    // ========== SCREEN MANAGEMENT ==========

    showScreen(screen) {
        this.menuScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
        this.leaderboardScreen.style.display = 'none';
        this.gameOverModal.style.display = 'none';
        screen.style.display = 'block';
    }

    showMenu() {
        this.hideMultiSetup();
        this.hideDifficultySetup();
        this.showScreen(this.menuScreen);
        document.querySelector('.menu-container').style.display = 'flex';
    }

    showGame() {
        this.showScreen(this.gameScreen);
    }

    showLeaderboard(tab = 'single') {
        this.showScreen(this.leaderboardScreen);
        this.switchLeaderboardTab(tab);
    }

    // ========== SINGLE PLAYER ==========

    startSinglePlayer() {
        this.pendingMode = 'single';
        this.playerNames = [{ name: 'Giocatore', score: 0 }];
        this.showDifficultySetup();
    }

    // ========== MULTIPLAYER SETUP ==========

    showMultiSetup() {
        this.multiSetup.style.display = 'block';
        document.querySelector('.menu-container').style.display = 'none';
    }

    hideMultiSetup() {
        this.multiSetup.style.display = 'none';
        this.playerNamesContainer.innerHTML = '';
        this.btnStartMulti.style.display = 'none';
        this.selectedPlayerCount = 0;
        // Reset player count buttons
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    selectPlayerCount(count) {
        this.selectedPlayerCount = count;

        // Highlight selected button
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.count) === count);
        });

        // Generate name inputs
        this.playerNamesContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Giocatore ${i}`;
            input.className = 'player-name-input';
            input.maxLength = 15;
            this.playerNamesContainer.appendChild(input);
        }

        this.btnStartMulti.style.display = 'block';
    }

    proceedTodifficulty() {
        // Collect player names for multiplayer
        const inputs = this.playerNamesContainer.querySelectorAll('input');
        this.playerNames = [];

        inputs.forEach((input, i) => {
            const name = input.value.trim() || `Giocatore ${i + 1}`;
            this.playerNames.push({ name, score: 0 });
        });

        this.pendingMode = 'multi';
        this.hideMultiSetup();
        this.showDifficultySetup();
    }

    // ========== DIFFICULTY SETUP ==========

    showDifficultySetup() {
        this.difficultySetup.style.display = 'block';
        document.querySelector('.menu-container').style.display = 'none';
        this.multiSetup.style.display = 'none';
    }

    hideDifficultySetup() {
        this.difficultySetup.style.display = 'none';

        // Go back to appropriate screen
        if (this.pendingMode === 'multi') {
            // Restore multi setup with previous data
            this.multiSetup.style.display = 'block';
            // Re-select the player count
            if (this.selectedPlayerCount > 0) {
                this.selectPlayerCount(this.selectedPlayerCount);
                // Restore names
                const inputs = this.playerNamesContainer.querySelectorAll('input');
                this.playerNames.forEach((player, i) => {
                    if (inputs[i] && player.name !== `Giocatore ${i + 1}`) {
                        inputs[i].value = player.name;
                    }
                });
            }
        } else {
            // Single player - go back to main menu
            document.querySelector('.menu-container').style.display = 'flex';
        }

        this.pendingMode = null;
    }

    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;

        // Start the game with selected mode, players, and difficulty
        this.showGame();
        if (this.onStartGame) {
            this.onStartGame(this.pendingMode, this.playerNames, difficulty);
        }
    }

    // ========== LEADERBOARD ==========

    async switchLeaderboardTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Show loading state
        const tbody = document.getElementById('leaderboard-body');
        const noScoresMsg = document.getElementById('no-scores-msg');

        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Caricamento classifica...</td></tr>';
        noScoresMsg.style.display = 'none';

        try {
            // Timeout promise (10 seconds)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout: il server non risponde")), 10000)
            );

            const scores = await Promise.race([
                this.leaderboard.getScores(tab),
                timeoutPromise
            ]);

            this.renderLeaderboardTable(scores);
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: red;">Errore: ${e.message}<br>Controlla la console.</td></tr>`;
            console.error("Leaderboard error:", e);
            alert("Errore caricamento classifica: " + e.message);
        }
    }

    renderLeaderboardTable(scores) {
        const tbody = document.getElementById('leaderboard-body');
        const noScoresMsg = document.getElementById('no-scores-msg');

        tbody.innerHTML = '';

        if (scores.length === 0) {
            noScoresMsg.style.display = 'block';
            return;
        }

        noScoresMsg.style.display = 'none';

        const diffMap = { 'easy': 'Facile', 'medium': 'Media', 'hard': 'Difficile' };

        scores.slice(0, 10).forEach((entry, i) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
                <td>${diffMap[entry.difficulty] || entry.difficulty || '-'}</td>
                <td>${entry.date}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // ========== GAME OVER ==========

    showGameOver(message, score, mode, difficulty) {
        this.currentGameOverScore = score;
        this.currentGameOverMode = mode;
        this.currentGameOverDifficulty = difficulty;

        document.getElementById('game-over-message').textContent = message;
        document.getElementById('winner-name').value = '';
        document.getElementById('save-score-form').style.display = 'block';

        this.gameOverModal.style.display = 'flex';
    }

    async saveScore() {
        const nameInput = document.getElementById('winner-name');
        const btnSave = document.getElementById('btn-save-score');

        const name = nameInput.value.trim() || 'Anonimo';

        // Disable UI
        nameInput.disabled = true;
        btnSave.disabled = true;
        btnSave.textContent = "Salvataggio...";

        try {
            await this.leaderboard.saveScore(name, this.currentGameOverScore, this.currentGameOverMode, this.currentGameOverDifficulty);
            alert("Punteggio salvato con successo!");
        } catch (e) {
            console.error(e);
            alert("Errore salvataggio: " + e.message);
        } finally {
            // Hide form and show success feedback (optional, or just close)
            document.getElementById('save-score-form').style.display = 'none';

            // Re-enable for next time
            nameInput.disabled = false;
            btnSave.disabled = false;
            btnSave.textContent = "SALVA PUNTEGGIO";
        }
    }

    playAgain() {
        this.gameOverModal.style.display = 'none';
        // Restart with same mode and difficulty
        if (this.onStartGame) {
            if (this.currentGameOverMode === 'single') {
                this.onStartGame('single', [{ name: 'Giocatore', score: 0 }], this.selectedDifficulty);
            } else {
                // Reset scores for same players
                this.playerNames.forEach(p => p.score = 0);
                this.onStartGame('multi', this.playerNames, this.selectedDifficulty);
            }
        }
    }

    backToMenuFromModal() {
        this.gameOverModal.style.display = 'none';
        this.showMenu();
    }
}
