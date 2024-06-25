// utils/indexedDB.js

import { openDB } from "idb";

const DB_NAME = "sleeperData";
const STORE_NAME = "players";
const VERSION = 1;

// Initialize the IndexedDB database
const initDB = async () => {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
};

// Save player data to IndexedDB
export const savePlayerData = async (data) => {
  const db = await initDB();
  await db.put(STORE_NAME, data, "playerData");
};

// Get player data from IndexedDB
export const getPlayerData = async () => {
  const db = await initDB();
  return db.get(STORE_NAME, "playerData");
};
