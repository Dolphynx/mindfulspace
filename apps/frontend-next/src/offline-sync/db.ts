// db.ts
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "mindfulspace-offline";
const DB_VERSION = 4;

export type OfflineSleepSession = {
    id?: number;
    hours: number;
    quality?: number;
    dateSession: string;
    createdAt: string;
};

export async function getDB(): Promise<IDBPDatabase> {
    if (typeof window === "undefined") {
        throw new Error("IndexedDB not available on server");
    }

    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("sleepSessions")) {
                db.createObjectStore("sleepSessions", {
                    keyPath: "id",
                    autoIncrement: true,
                });
            }
        },
    });
}
