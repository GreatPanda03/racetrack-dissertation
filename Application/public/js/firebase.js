// firebase set update

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOZ023y1iG-9CMbZ3Zp-uUpHS4FqIWFaI",
    authDomain: "tracer-racers.firebaseapp.com",
    databaseURL: "https://tracer-racers-default-rtdb.firebaseio.com",
    projectId: "tracer-racers",
    storageBucket: "tracer-racers.firebasestorage.app",
    messagingSenderId: "960544190095",
    appId: "1:960544190095:web:10d2fabef64579a4128afa",
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const auth = getAuth(app);

function initAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                signInAnonymously(auth)
                    .catch(console.error);
            }
        });
    });
}

export { db, auth, initAuth };