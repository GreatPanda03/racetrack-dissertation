// firebase set update


// [[ Imports ]] //
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { 
    getAuth, 
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider, 
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";



// [[ Variables ]] //

// config
const firebaseConfig = {
    apiKey: "AIzaSyDOZ023y1iG-9CMbZ3Zp-uUpHS4FqIWFaI",
    authDomain: "tracer-racers.firebaseapp.com",
    databaseURL: "https://tracer-racers-default-rtdb.firebaseio.com",
    projectId: "tracer-racers",
    storageBucket: "tracer-racers.firebasestorage.app",
    messagingSenderId: "960544190095",
    appId: "1:960544190095:web:10d2fabef64579a4128afa",
};

// app & data
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// authentication
const auth = getAuth(app);
const googleAuth = new GoogleAuthProvider();

var authInitialised = false;
let authResolved = false;
var authPromiseResolver;

const authPromise = new Promise((resolve) => {
    authPromiseResolver = resolve;
});



// [[ Functions ]] //

function generateAnonymousName() {
    let max = 999_999;
    let number = Math.floor(Math.random() * max);
    let padding = Math.ceil(Math.log10(max));
    let padded = String(number).padStart(padding, "0");
    let name = `Anonymous ${padded}`;

    return name;
}

function updateFooterAccount(user) {
    let span = document.getElementById("sign-in-account");
    span.innerHTML = `Logged in as: ${user.displayName}`;
}

async function initAuth() {
    if (!authInitialised) {
        await setPersistence(auth, browserLocalPersistence);
        authInitialised = true;
    }

    onAuthStateChanged(auth, async (user) => {
        if (authResolved) return;

        console.log("User:", user);

        if (user) {
            authResolved = true;

            authPromiseResolver(user);
            updateFooterAccount(user);

        } else if (!auth.currentUser) {
            const anon = await signInAnonymously(auth);
            authResolved = true;

            let user = anon.user;
            authPromiseResolver(user);

            let name = generateAnonymousName();
            await updateProfile(user, { displayName: name });

            updateFooterAccount(user);
        }
    });

    return authPromise;
}

async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleAuth);
        updateFooterAccount(result.user);
        return result.user;
    
    } catch(error) {
        console.log(error);
        return null;
    }
}

export { db, auth, initAuth, signInWithGoogle };