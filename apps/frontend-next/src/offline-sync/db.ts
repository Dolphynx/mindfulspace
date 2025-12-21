// db.ts
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "mindfulspace-offline";
const DB_VERSION = 7;

export type OfflineSleepSession = {
    id?: number;
    hours: number;
    quality?: number;
    dateSession: string;
    createdAt: string;
};

export type OfflineQueueItem = {
    id?: number;
    type: "sleep" | "exercise" | "meditation";
    payload: unknown;
    createdAt: number;
};

export type OfflineSleepHistoryItem = {
    date: string;          // YYYY-MM-DD (unique per day)
    hours: number;
    quality?: number;
};



export async function getDB(): Promise<IDBPDatabase> {
    if (typeof window === "undefined") {
        throw new Error("IndexedDB not available on server");
    }

    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("offlineQueue")) {
                db.createObjectStore("offlineQueue", {
                    keyPath: "id",
                    autoIncrement: true,
                });
            }

            if (!db.objectStoreNames.contains("sleepHistory")) {
                db.createObjectStore("sleepHistory", {
                    keyPath: "date",
                });
            }
        },
    });
}
