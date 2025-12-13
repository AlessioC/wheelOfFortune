import { db } from './firebaseConfig.js';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export class Leaderboard {
    constructor() {
        this.collectionName = 'scores';
    }

    /**
     * Get scores for a specific mode from Firestore
     * @param {string} mode - 'single' or 'multi'
     * @returns {Promise<Array>} Sorted scores (highest first)
     */
    async getScores(mode) {
        try {
            // Simplified query to avoid need for composite index
            const q = query(
                collection(db, this.collectionName),
                where("mode", "==", mode)
            );

            const querySnapshot = await getDocs(q);
            const scores = [];
            querySnapshot.forEach((doc) => {
                scores.push(doc.data());
            });

            // Client-side sorting and limiting
            return scores
                .sort((a, b) => b.score - a.score)
                .slice(0, 20);
        } catch (e) {
            console.error("Error fetching scores: ", e);
            throw e; // Propagate error to UI
        }
    }

    /**
     * Save a new score to Firestore
     * @param {string} name - Player name
     * @param {number} score - Score value
     * @param {string} mode - 'single' or 'multi'
     */
    async saveScore(name, score, mode, difficulty) {
        try {
            await addDoc(collection(db, this.collectionName), {
                name: name.substring(0, 15),
                score: score,
                mode: mode,
                difficulty: difficulty || 'easy', // Default for robustness
                date: new Date().toLocaleDateString('it-IT'),
                timestamp: new Date()
            });
            console.log("Score saved to Firestore");
            return true;
        } catch (e) {
            console.error("Error adding score: ", e);
            throw e;
        }
    }

    /**
     * Clear all scores (Not supported via client for security reasons usually, but kept stub)
     */
    clearAll() {
        console.warn("Clear all not supported in online mode from client.");
    }
}
