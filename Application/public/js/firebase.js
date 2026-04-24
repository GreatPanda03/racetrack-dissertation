// firebase set update

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { 
    getAuth, 
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider, 
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

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
const googleAuth = new GoogleAuthProvider();

var authInitialised = false;
var authPromiseResolver;

const authPromise = new Promise((resolve) => {
    authPromiseResolver = resolve;
});

async function initAuth() {
    if (!authInitialised) {
        await setPersistence(auth, browserLocalPersistence);
        authInitialised = true;
    }

    onAuthStateChanged(auth, async (user) => {
        console.log("User State:", user);

        if (user) {
            authPromiseResolver(user);

        } else if (!auth.currentUser) {
            const anon = await signInAnonymously(auth);
            authPromiseResolver(anon.user);
        }
    });

    return authPromise;
}

async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleAuth);
        return result.user;
    
    } catch(error) {
        console.log(error);
        return null;
    }
}

export { db, auth, initAuth, signInWithGoogle };