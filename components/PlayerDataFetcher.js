// components/PlayerDataFetcher.tsx

"use client";

import { useEffect } from "react";
import { fetchPlayerData, getPlayerData } from "../utils/playerData";

const PlayerDataFetcher = () => {
  useEffect(() => {
    const fetchData = async () => {
      const storedData = getPlayerData();
      if (!storedData) {
        await fetchPlayerData();
      }
    };
    fetchData();
  }, []);

  return null;
};

export default PlayerDataFetcher;
