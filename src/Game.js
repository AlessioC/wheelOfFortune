import phrasesData from './data/phrases.json';

export class Game {
    constructor(wheel, board, menu) {
        this.wheel = wheel;
        this.board = board;
        this.menu = menu;

        // Constants
        this.VOWELS = ['A', 'E', 'I', 'O', 'U'];
        this.CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
        this.VOWEL_COST = 500;

        // UI Elements
        this.scoreElement = document.getElementById('score');
        this.categoryElement = document.getElementById('category-display');
        this.messageElement = document.getElementById('message-area');
        this.consonantsContainer = document.getElementById('consonants');
        this.vowelsContainer = document.getElementById('vowels');
        this.solveBtn = document.getElementById('solve-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.backToMenuBtn = document.getElementById('btn-back-to-menu');
        this.playersBar = document.getElementById('players-bar');
        this.currentPlayerNameEl = document.getElementById('current-player-name');

        // Game State
        this.mode = 'single'; // 'single' or 'multi'
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentPhrase = "";
        this.currentCategory = "";
        this.guessedLetters = new Set();
        this.canGuessConsonant = false;
        this.currentSegmentValue = 0;
        this.gameOver = false;

        // Bindings
        this.handleWheelSpinEnd = this.handleWheelSpinEnd.bind(this);
        this.handleSolve = this.handleSolve.bind(this);
    }

    init() {
        // Build keyboard once
        this.buildKeyboard();

        // Listeners
        window.addEventListener('wheel-spin-end', this.handleWheelSpinEnd);
        this.solveBtn.addEventListener('click', this.handleSolve);
        this.newGameBtn.addEventListener('click', () => this.startNewRound());
        this.backToMenuBtn.addEventListener('click', () => this.menu.showMenu());
    }

    /**
     * Start a new game with the given mode and players
     * @param {string} mode - 'single' or 'multi'
     * @param {Array} players - Array of { name, score } objects
     */
    startGame(mode, players) {
        this.mode = mode;
        this.players = players.map(p => ({ ...p, score: 0 }));
        this.currentPlayerIndex = 0;

        // Set wheel configuration based on mode
        this.wheel.setMode(mode);

        this.renderPlayersBar();
        this.startNewRound();
    }

    buildKeyboard() {
        // Consonants
        this.consonantsContainer.innerHTML = '';
        this.CONSONANTS.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn consonant';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            btn.disabled = true;
            btn.addEventListener('click', () => this.handleConsonantClick(letter, btn));
            this.consonantsContainer.appendChild(btn);
        });

        // Vowels
        this.vowelsContainer.innerHTML = '';
        this.VOWELS.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn vowel';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            btn.disabled = true;
            btn.addEventListener('click', () => this.handleVowelClick(letter, btn));
            this.vowelsContainer.appendChild(btn);
        });
    }

    startNewRound() {
        // Pick random category
        const categories = Object.keys(phrasesData);
        const randomCatIndex = Math.floor(Math.random() * categories.length);
        this.currentCategory = categories[randomCatIndex];

        // Pick random phrase (now an object with phrase and hint)
        const phrases = phrasesData[this.currentCategory];
        const randomPhraseIndex = Math.floor(Math.random() * phrases.length);
        const selectedItem = phrases[randomPhraseIndex];
        this.currentPhrase = selectedItem.phrase.toUpperCase();
        this.currentHint = selectedItem.hint || this.currentCategory; // Fallback to category

        // Reset round state (but keep player scores in multi)
        this.guessedLetters.clear();
        this.canGuessConsonant = false;
        this.gameOver = false;

        // Reset keyboard
        this.resetKeyboard();

        // Hide end-game buttons
        this.newGameBtn.style.display = 'none';
        this.backToMenuBtn.style.display = 'none';

        // UI Updates
        this.categoryElement.textContent = this.currentHint; // Now shows hint instead of category
        this.board.setPuzzle(this.currentPhrase);
        this.updatePlayerDisplay();
        this.setMessage("Gira la ruota per iniziare!");
    }

    // ========== MULTIPLAYER ==========

    get currentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    renderPlayersBar() {
        if (this.mode === 'single') {
            this.playersBar.style.display = 'none';
            this.currentPlayerNameEl.style.display = 'none';
            return;
        }

        this.playersBar.style.display = 'flex';
        this.currentPlayerNameEl.style.display = 'inline';

        this.playersBar.innerHTML = '';
        this.players.forEach((player, i) => {
            const div = document.createElement('div');
            div.className = 'player-tag' + (i === this.currentPlayerIndex ? ' active' : '');
            div.innerHTML = `<span class="player-name">${player.name}</span><span class="player-score">${player.score}</span>`;
            this.playersBar.appendChild(div);
        });
    }

    updatePlayerDisplay() {
        if (this.mode === 'single') {
            this.scoreElement.textContent = this.currentPlayer.score;
        } else {
            this.currentPlayerNameEl.textContent = `${this.currentPlayer.name}: `;
            this.scoreElement.textContent = this.currentPlayer.score;
            this.renderPlayersBar();
        }
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updatePlayerDisplay();
        this.setMessage(`Tocca a ${this.currentPlayer.name}! Gira la ruota.`);
    }

    // ========== KEYBOARD ==========

    resetKeyboard() {
        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('used', 'miss');
        });
    }

    updateKeyboardState() {
        const currentScore = this.currentPlayer.score;

        // Consonants: enabled only if canGuessConsonant
        document.querySelectorAll('.letter-btn.consonant').forEach(btn => {
            const letter = btn.dataset.letter;
            if (this.guessedLetters.has(letter)) {
                btn.disabled = true;
            } else {
                btn.disabled = !this.canGuessConsonant;
            }
        });

        // Vowels: enabled if current player has enough score
        document.querySelectorAll('.letter-btn.vowel').forEach(btn => {
            const letter = btn.dataset.letter;
            if (this.guessedLetters.has(letter)) {
                btn.disabled = true;
            } else {
                btn.disabled = currentScore < this.VOWEL_COST || this.gameOver;
            }
        });
    }

    // ========== WHEEL EVENTS ==========

    handleWheelSpinEnd(e) {
        if (this.gameOver) return;

        const segment = e.detail;
        console.log("Segment landed:", segment);

        if (segment.text === 'PERDE') {
            this.setMessage(`${this.mode === 'multi' ? this.currentPlayer.name + ': ' : ''}BANCAROTTA!`);
            this.currentPlayer.score = 0;
            this.updatePlayerDisplay();
            this.canGuessConsonant = false;
            this.updateKeyboardState();

            if (this.mode === 'multi') {
                setTimeout(() => this.nextPlayer(), 1500);
            }
            return;
        } else if (segment.text === 'PASSA') {
            this.setMessage(`${this.mode === 'multi' ? this.currentPlayer.name + ': ' : ''}Turno perso!`);
            this.canGuessConsonant = false;
            this.updateKeyboardState();

            if (this.mode === 'multi') {
                setTimeout(() => this.nextPlayer(), 1500);
            }
            return;
        }

        // It's a value
        this.currentSegmentValue = segment.value;
        this.canGuessConsonant = true;
        this.updateKeyboardState();
        this.setMessage(`Valore: ${segment.value}. Scegli una consonante!`);
    }

    // ========== LETTER GUESSING ==========

    handleConsonantClick(letter, btn) {
        if (!this.canGuessConsonant || this.guessedLetters.has(letter)) return;

        this.guessedLetters.add(letter);
        btn.classList.add('used');

        const foundCount = this.board.revealLetter(letter);

        if (foundCount > 0) {
            const points = this.currentSegmentValue * foundCount;
            this.currentPlayer.score += points;
            this.updatePlayerDisplay();
            this.setMessage(`${foundCount} ${letter}! +${points} punti.`);
            // Player keeps turn, but must spin again
        } else {
            btn.classList.add('miss');
            this.setMessage(`Nessuna ${letter}.`);

            if (this.mode === 'multi') {
                setTimeout(() => this.nextPlayer(), 1500);
            }
        }

        this.canGuessConsonant = false;
        this.updateKeyboardState();
        this.checkWinConditions();
    }

    handleVowelClick(letter, btn) {
        const currentScore = this.currentPlayer.score;
        if (currentScore < this.VOWEL_COST || this.guessedLetters.has(letter)) return;

        // Deduct cost
        this.currentPlayer.score -= this.VOWEL_COST;
        this.updatePlayerDisplay();

        this.guessedLetters.add(letter);
        btn.classList.add('used');

        const foundCount = this.board.revealLetter(letter);

        if (foundCount > 0) {
            this.setMessage(`${foundCount} ${letter}! (-${this.VOWEL_COST} punti)`);
        } else {
            btn.classList.add('miss');
            this.setMessage(`Nessuna ${letter}. (-${this.VOWEL_COST} punti)`);
        }

        this.updateKeyboardState();
        this.checkWinConditions();
    }

    // ========== SOLVE ==========

    handleSolve() {
        if (this.gameOver) return;

        const solution = prompt("Qual è la soluzione?");
        if (solution && solution.toUpperCase().replace(/[^A-Z]/g, '') === this.currentPhrase.replace(/[^A-Z]/g, '')) {
            this.board.revealAll();
            this.endGame(true);
        } else if (solution) {
            this.setMessage("Sbagliato!");
            this.canGuessConsonant = false;
            this.updateKeyboardState();

            if (this.mode === 'multi') {
                setTimeout(() => this.nextPlayer(), 1500);
            }
        }
    }

    // ========== WIN CONDITIONS ==========

    checkWinConditions() {
        const phraseLetters = new Set(this.currentPhrase.replace(/[^A-Z]/g, '').split(''));
        const allFound = [...phraseLetters].every(l => this.guessedLetters.has(l));

        if (allFound) {
            this.endGame(true);
        }
    }

    endGame(won) {
        this.gameOver = true;
        this.canGuessConsonant = false;

        // Disable all buttons
        document.querySelectorAll('.letter-btn').forEach(btn => btn.disabled = true);

        // Find winner
        let winner = this.currentPlayer;
        let highScore = winner.score;

        if (this.mode === 'multi') {
            this.players.forEach(p => {
                if (p.score > highScore) {
                    highScore = p.score;
                    winner = p;
                }
            });
        }

        // Show game over modal
        const message = this.mode === 'single'
            ? `Hai totalizzato ${winner.score} punti!`
            : `${winner.name} vince con ${winner.score} punti!`;

        this.menu.showGameOver(message, winner.score, this.mode);

        // Show buttons
        this.newGameBtn.style.display = 'block';
        this.backToMenuBtn.style.display = 'block';
    }

    // ========== UTILS ==========

    setMessage(msg) {
        this.messageElement.textContent = msg;
    }
}
