export class Leaderboard {
    constructor() {
        this.STORAGE_KEY = 'wheel_of_fortune_leaderboard';
    }

    /**
     * Get all scores from localStorage
     * @returns {Object} { single: [], multi: [] }
     */
    getAllScores() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            return { single: [], multi: [] };
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Error parsing leaderboard data:', e);
            return { single: [], multi: [] };
        }
    }

    /**
     * Get scores for a specific mode
     * @param {string} mode - 'single' or 'multi'
     * @returns {Array} Sorted scores (highest first)
     */
    getScores(mode) {
        const allScores = this.getAllScores();
        const scores = allScores[mode] || [];
        return scores.sort((a, b) => b.score - a.score);
    }

    /**
     * Save a new score
     * @param {string} name - Player name
     * @param {number} score - Score value
     * @param {string} mode - 'single' or 'multi'
     */
    saveScore(name, score, mode) {
        const allScores = this.getAllScores();

        const entry = {
            name: name.substring(0, 15), // Max 15 chars
            score: score,
            date: new Date().toLocaleDateString('it-IT')
        };

        if (!allScores[mode]) {
            allScores[mode] = [];
        }

        allScores[mode].push(entry);

        // Keep only top 50 scores per mode
        allScores[mode] = allScores[mode]
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allScores));
    }

    /**
     * Clear all scores (for debugging)
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
