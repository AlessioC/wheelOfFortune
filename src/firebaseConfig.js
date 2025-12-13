import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCeHSJTxWErGbOWW8v866mnaAaeNDiQhG0",
    authDomain: "ruota-fad8a.firebaseapp.com",
    projectId: "ruota-fad8a",
    storageBucket: "ruota-fad8a.firebasestorage.app",
    messagingSenderId: "277930860802",
    appId: "1:277930860802:web:3be698784664dd6255e21b",
    measurementId: "G-313ZX5F03T"
};

// Initialize Firebase with polling to avoid CORS/Socket issues on some networks
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});
