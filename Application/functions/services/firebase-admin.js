// firebase administration

import admin from "firebase-admin";
import serviceAccount from "../firebase-service-account.json" with { type: "json" };

if (!admin.apps.length) {  
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://tracer-racers-default-rtdb.firebaseio.com"
    });
}

const db = admin.database();

export { admin, db };