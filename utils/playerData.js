import axios from "axios";
import {
  savePlayerData,
  getPlayerData as getIndexedDBPlayerData,
} from "./indexedDB";

const playersUrl = "https://api.sleeper.app/v1/players/nfl";
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const fetchPlayerData = async () => {
  try {
    const response = await axios.get(playersUrl);
    const playerData = response.data;

    console.log("Fetched player data:", playerData);

    await savePlayerData(playerData);

    return playerData;
  } catch (error) {
    console.error("Error fetching player data:", error);
    return null;
  }
};

export const getPlayerData = async () => {
  const playerData = await getIndexedDBPlayerData();
  console.log("Retrieved player data from IndexedDB:", playerData);
  return playerData;
};

// Refresh data if older than one day
export const refreshPlayerDataIfNeeded = async () => {
  const lastUpdated = localStorage.getItem("playerDataTimestamp");
  const now = Date.now();

  if (!lastUpdated || now - parseInt(lastUpdated, 10) > ONE_DAY_IN_MS) {
    const data = await fetchPlayerData();
    if (data) {
      localStorage.setItem("playerDataTimestamp", now.toString());
    }
    return data;
  }

  return getPlayerData();
};
