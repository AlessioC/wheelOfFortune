export class Board {
    constructor(element) {
        this.element = element;
        this.tiles = new Map(); // letterIndex -> HTMLElement
    }

    init() {
        // Clear board
        this.element.innerHTML = '';
    }

    /**
     * Sets the puzzle on the board.
     * @param {string} phrase - The puzzle phrase.
     */
    setPuzzle(phrase) {
        this.phrase = phrase.toUpperCase();
        this.element.innerHTML = '';
        this.tiles.clear();

        const words = this.phrase.split(' ');

        // Simple logic: create a row for each word (or wrap if too long, but we'll stick to flex wrapping)
        // Actually, to look like Wheel of Fortune, we want rows.
        // But CSS flex-wrap works well for responsive design without hardcoding grid dimensions.
        // We will group by words to ensure words don't break in the middle if possible.

        words.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'word-row'; // Actually, this makes each word a row? No, we want words to flow.
            // Let's change approach: Just tiles, allowing flex-wrap to handle lines.
            // To keep words together, we wrap each word in a container.
        });

        // Cleanest CSS approach:
        // A flex container allowing wrap.
        // Each WORD is a flex container of tiles.
        // This ensures a word moves to the next line together if it doesn't fit.

        words.forEach((word, wordIndex) => {
            const wordContainer = document.createElement('div');
            wordContainer.style.display = 'flex';
            wordContainer.style.gap = '5px';
            wordContainer.style.marginRight = '20px'; // Space between words
            wordContainer.style.marginBottom = '10px'; // Space between lines if wrapped

            // Add letters
            for (let i = 0; i < word.length; i++) {
                const letter = word[i];
                const tile = this.createTile(letter);
                wordContainer.appendChild(tile);

                // Calculate global index for this letter to map it back to specific instances?
                // Or just store by letter char? 
                // We need to be able to "Reveal all 'A's".

                if (!this.tiles.has(letter)) {
                    this.tiles.set(letter, []);
                }
                this.tiles.get(letter).push(tile);
            }

            this.element.appendChild(wordContainer);
        });
    }

    createTile(letter) {
        const tile = document.createElement('div');
        tile.className = 'tile letter'; // Default to hidden letter
        // If it's a special char (apostrophe), strictly it should be shown or handled.
        // For simplicity, we treat non-A-Z as revealed or handled differently.
        const isLetter = /[A-Z]/.test(letter);

        if (!isLetter) {
            tile.className = 'tile symbol'; // Show immediately
            tile.textContent = letter;
            tile.style.backgroundColor = 'transparent';
            tile.style.border = 'none';
            tile.style.color = '#fff';
        } else {
            // Prepare for reveal
            tile.dataset.letter = letter;
            tile.textContent = letter; // Text content is there but color is transparent via CSS
            // tile.classList.add('revealed'); // For debug
        }

        return tile;
    }

    /**
     * Reveals a specific letter.
     * @param {string} letter - The letter to reveal.
     * @returns {number} - Count of letters revealed.
     */
    revealLetter(letter) {
        const target = letter.toUpperCase();
        if (!this.tiles.has(target)) return 0;

        const tileList = this.tiles.get(target);
        let count = 0;

        tileList.forEach(tile => {
            if (!tile.classList.contains('revealed')) {
                tile.classList.add('revealed');
                count++;
            }
        });

        return count;
    }

    revealAll() {
        this.tiles.forEach(list => {
            list.forEach(tile => tile.classList.add('revealed'));
        });
    }
}
