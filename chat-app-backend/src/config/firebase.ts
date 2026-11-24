import { readFileSync } from "node:fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadServiceAccount(): ServiceAccount {
    // Production: whole JSON stored in an environment variable
    const json = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (json) {
        return JSON.parse(json) as ServiceAccount;
    }

    // Local: path to the JSON file
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (path) {
        return JSON.parse(readFileSync(path, "utf-8")) as ServiceAccount;
    }

    throw new Error(
        "Set FIREBASE_SERVICE_ACCOUNT (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (file path)"
    );
}

if (getApps().length === 0) {
    initializeApp({ credential: cert(loadServiceAccount()) });
}

export const db = getFirestore();