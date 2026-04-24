// firebase administration

import admin from "firebase-admin";
import serviceAccount from "../firebase-service-account.json" with { type: "json" };

if (!admin.apps.length) {  
    let isLocal = process.env.NODE_ENV !== "production";
    let dbUrl = isLocal
      ? "https://tracer-racers-default-rtdb.firebaseio.com"
      : undefined;

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: dbUrl
    });
}

const db = admin.database();

export { admin, db };