// utils/fantasyRank.js

import axios from "axios";
import { refreshPlayerDataIfNeeded } from "./playerData";

export const getUserLeagues = async (username) => {
  try {
    const userResponse = await axios.get(
      `https://api.sleeper.app/v1/user/${username}`
    );
    const userId = userResponse.data.user_id;

    const sport = "nfl";
    const season = "2024";
    const leaguesResponse = await axios.get(
      `https://api.sleeper.app/v1/user/${userId}/leagues/${sport}/${season}`
    );
    return leaguesResponse.data;
  } catch (error) {
    console.error("Error fetching user leagues:", error);
    return [];
  }
};

export const getLeagueRosters = async (leagueId) => {
  try {
    const rostersResponse = await axios.get(
      `https://api.sleeper.app/v1/league/${leagueId}/rosters`
    );
    return rostersResponse.data;
  } catch (error) {
    console.error("Error fetching league rosters:", error);
    return [];
  }
};

export const calculateUserRank = async (username, playerValues) => {
  const playerData = await refreshPlayerDataIfNeeded();
  const leagues = await getUserLeagues(username);
  let userScore = 0;
  let userRank = 0;

  for (const league of leagues) {
    const rosters = await getLeagueRosters(league.league_id);
    let scores = [];

    for (const roster of rosters) {
      let score = 0;
      const playerNames = [];

      if (roster.players) {
        for (const playerId of roster.players) {
          // Ensure playerId exists and playerValues[playerId] is valid
          if (playerId && playerValues && playerValues[playerId]) {
            score += playerValues[playerId];
          }
          // Ensure playerData and playerData[playerId] are valid
          if (playerData && playerData[playerId]) {
            playerNames.push(playerData[playerId].full_name);
          } else {
            playerNames.push(playerId); // Fallback to playerId if name not found
          }
        }
      }
      console.log(`Team ${roster.owner_id} players:`, playerNames);

      scores.push({ userId: roster.owner_id, score });
    }

    scores.sort((a, b) => b.score - a.score);
    const userRoster = scores.find((s) => s.userId === username);
    if (userRoster) {
      userScore += userRoster.score;
      userRank += scores.findIndex((s) => s.userId === username) + 1;
    }
  }

  return { userScore, userRank };
};
