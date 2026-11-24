import "dotenv/config";
import { db } from "../config/firebase.js";

async function test(): Promise<void> {
    const ref = await db.collection("test").add({ hello: "world", at: new Date() });
    console.log("Written doc id:", ref.id);
}

test().catch((err: unknown) => {
    console.error("Firebase test failed:", err);
    process.exitCode = 1;
});