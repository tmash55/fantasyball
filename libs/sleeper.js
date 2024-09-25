import { fetchWeekData } from "@/app/api/props/weeklyprops2";
import supabase from "@/lib/supabaseClient";

import axios from "axios";

const BASE_URL = "https://api.sleeper.app/v1";

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
export const fetchWaiverWirePlayers = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}/players`);
    const allPlayers = response.data;

    // Filter out owned players (this would require additional API calls to get rosters)
    // For now, we'll return all players as an example
    return Object.values(allPlayers);
  } catch (error) {
    console.error("Error fetching waiver wire players:", error);
    throw error;
  }
};

export async function fetchMatchups(leagueId, week) {
  try {
    const response = await fetch(
      `https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching matchups:", error);
    throw error;
  }
}

export async function fetchPlayerSeasonalStats(playerIds, leagueSettings) {
  try {
    const { data: seasonalStats, error } = await supabase
      .from("player_seasonal_stats")
      .select(
        `
        player_id,
        passing_yards,
        passing_tds,
        rushing_yards,
        rushing_tds,
        receptions,
        receiving_yards,
        receiving_tds,
        games,
        interceptions,
        targets,
        receiving_air_yards,
        receiving_yards_after_catch,
        receiving_first_downs,
        receiving_epa,
        racr,
        tgt_sh,
        ay_sh,
        yac_sh,
        ry_sh,
        wopr_y,
        rushing_first_downs,
        rushing_epa,
        carries,
        passing_epa,
        passing_first_downs,
        passing_yards_after_catch,
        passing_air_yards,
        sacks,
        sack_yards,
        attempts,
        completions,
        yptmpa,
        nfl_players (
          sleeper_id,
          player_name,
          position,
          team
        )
      `
      )
      .in("nfl_players.sleeper_id", playerIds);

    if (error) throw error;

    const playerStats = {};

    seasonalStats.forEach((stats) => {
      if (stats.nfl_players && stats.nfl_players.sleeper_id) {
        const sleeperId = stats.nfl_players.sleeper_id;
        const calculatedStats = calculateFantasyPoints(stats, leagueSettings);
        playerStats[sleeperId] = {
          id: sleeperId,
          playerDetails: {
            name: stats.nfl_players.player_name,
            position: stats.nfl_players.position,
            team: stats.nfl_players.team,
          },
          totalPoints: calculatedStats.totalPoints,
          averagePoints: calculatedStats.totalPoints / (stats.games || 1),
          gamesPlayed: stats.games || 0,
          rawStats: {
            // Existing fields
            passingYards: stats.passing_yards || 0,
            passingTds: stats.passing_tds || 0,
            rushingYards: stats.rushing_yards || 0,
            rushingTds: stats.rushing_tds || 0,
            receptions: stats.receptions || 0,
            receivingYards: stats.receiving_yards || 0,
            receivingTds: stats.receiving_tds || 0,
            interceptions: stats.interceptions || 0,
            fumblesLost: stats.fumbles_lost || 0,
            twoPointConversions: stats.two_point_conversions || 0,

            // New fields
            targets: stats.targets || 0,
            receivingAirYards: stats.receiving_air_yards || 0,
            receivingYardsAfterCatch: stats.receiving_yards_after_catch || 0,
            receivingFirstDowns: stats.receiving_first_downs || 0,
            receivingEpa: stats.receiving_epa || 0,
            racr: stats.racr || 0,
            tgtSh: stats.tgt_sh || 0,
            aySh: stats.ay_sh || 0,
            yacSh: stats.yac_sh || 0,
            rySh: stats.ry_sh || 0,
            woprY: stats.wopr_y || 0,
            rushingFirstDowns: stats.rushing_first_downs || 0,
            rushingEpa: stats.rushing_epa || 0,
            carries: stats.carries || 0,
            passingEpa: stats.passing_epa || 0,
            passingFirstDowns: stats.passing_first_downs || 0,
            passingYardsAfterCatch: stats.passing_yards_after_catch || 0,
            passingAirYards: stats.passing_air_yards || 0,
            sacks: stats.sacks || 0,
            sackYards: stats.sack_yards || 0,
            attempts: stats.attempts || 0,
            completions: stats.completions || 0,
            yptmpa: stats.yptmpa || 0,
          },
        };
      }
    });

    return playerStats;
  } catch (error) {
    console.error("Error fetching player seasonal stats:", error);
    return {};
  }
}
// Helper function to normalize player names
function normalizePlayerName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export async function searchPlayers(searchTerm) {
  try {
    const { data, error } = await supabase
      .from("nfl_players")
      .select(
        `
        sleeper_id,
        player_name,
        position,
        team,
        player_seasonal_stats (
          player_id
        )
      `
      )
      .or(`player_name.ilike.%${searchTerm}%, player_name.ilike.${searchTerm}%`)
      .order("player_name", { ascending: true })
      .limit(10);

    if (error) throw error;

    // Format the data to match the expected structure
    const formattedData = data.map((player) => ({
      player_id: player.sleeper_id,
      player_name: player.player_name,
      position: player.position,
      team: player.team,
    }));

    return formattedData;
  } catch (error) {
    console.error("Error searching players:", error);
    return [];
  }
}

export async function getCurrentNFLWeek() {
  try {
    const response = await axios.get(`${BASE_URL}/state/nfl`);
    return response.data.week;
  } catch (error) {
    console.error("Error fetching current NFL week:", error);
    return 1; // Default to week 1 if there's an error
  }
}

export async function fetchUser(username) {
  const url = `${BASE_URL}/user/${username}`;
  return fetchWithRetry(url);
}

export async function fetchUserLeagues(userId, season) {
  const url = `${BASE_URL}/user/${userId}/leagues/nfl/${season}`;
  return fetchWithRetry(url);
}

export async function fetchLeagueDetails(leagueId) {
  const url = `${BASE_URL}/league/${leagueId}`;
  return fetchWithRetry(url);
}

export async function fetchLeagueName(leagueId) {
  const url = `${BASE_URL}/league/${leagueId}`;
  const data = await fetchWithRetry(url);
  return data.name;
}

export async function fetchLeagueRosters(leagueId) {
  const url = `${BASE_URL}/league/${leagueId}/rosters`;
  return fetchWithRetry(url);
}

export async function fetchLeagueUsers(leagueId) {
  const url = `${BASE_URL}/league/${leagueId}/users`;
  return fetchWithRetry(url);
}

export async function fetchUserRoster(leagueId, userId) {
  const rosters = await fetchLeagueRosters(leagueId);
  return rosters.find((roster) => roster.owner_id === userId);
}

export async function fetchPlayerNames(playerIds) {
  try {
    // First, try to fetch names from nfl_players table
    let { data: nflPlayers, error } = await supabase
      .from("nfl_players")
      .select("sleeper_id, player_name, team, position")
      .in("sleeper_id", playerIds);

    if (error) throw error;

    let playerNames = nflPlayers.reduce((acc, player) => {
      acc[player.sleeper_id] = player.player_name;
      return acc;
    }, {});

    // Check for any missing players
    const missingPlayerIds = playerIds.filter((id) => !playerNames[id]);

    if (missingPlayerIds.length > 0) {
      // Fetch missing players from sleeper_players table
      let { data: sleeperPlayers, error: sleeperError } = await supabase
        .from("sleeper_players")
        .select("player_id, first_name, last_name")
        .in("player_id", missingPlayerIds);

      if (sleeperError) throw sleeperError;

      // Add missing player names to the result
      sleeperPlayers.forEach((player) => {
        playerNames[player.player_id] =
          `${player.first_name} ${player.last_name}`.trim();
      });
    }

    return playerNames;
  } catch (error) {
    console.error("Error fetching player names:", error);
    return {};
  }
}
export async function fetchPlayerDetails(playerIds) {
  try {
    // Fetch all players from nfl_players table
    let { data: nflPlayers, error } = await supabase
      .from("nfl_players")
      .select("sleeper_id, player_name, team, position");

    if (error) throw error;

    let playerDetails = {};
    let unmatchedPlayerIds = [];

    // First pass: exact sleeper_id match
    playerIds.forEach((id) => {
      const exactMatch = nflPlayers.find((player) => player.sleeper_id === id);
      if (exactMatch) {
        playerDetails[id] = {
          name: exactMatch.player_name,
          team: exactMatch.team,
          position: exactMatch.position,
        };
      } else {
        unmatchedPlayerIds.push(id);
      }
    });

    // Second pass: name matching for unmatched players
    if (unmatchedPlayerIds.length > 0) {
      // Fetch unmatched players from sleeper_players table
      let { data: sleeperPlayers, error: sleeperError } = await supabase
        .from("sleeper_players")
        .select("player_id, first_name, last_name, team, position")
        .in("player_id", unmatchedPlayerIds);

      if (sleeperError) throw sleeperError;

      sleeperPlayers.forEach((sleeperPlayer) => {
        const sleeperName =
          `${sleeperPlayer.first_name} ${sleeperPlayer.last_name}`.trim();
        const normalizedSleeperName = normalizePlayerName(sleeperName);

        // Find best match in nflPlayers
        const bestMatch = nflPlayers.reduce((best, nflPlayer) => {
          const normalizedNflName = normalizePlayerName(nflPlayer.player_name);
          if (
            normalizedSleeperName === normalizedNflName ||
            normalizedSleeperName.includes(normalizedNflName) ||
            normalizedNflName.includes(normalizedSleeperName)
          ) {
            return nflPlayer;
          }
          return best;
        }, null);

        if (bestMatch) {
          playerDetails[sleeperPlayer.player_id] = {
            name: bestMatch.player_name,
            team: bestMatch.team,
            position: bestMatch.position,
          };
        } else {
          // If no match found, use Sleeper data
          playerDetails[sleeperPlayer.player_id] = {
            name: sleeperName,
            team: sleeperPlayer.team,
            position: sleeperPlayer.position,
          };
        }
      });
    }

    return playerDetails;
  } catch (error) {
    console.error("Error fetching player details:", error);
    return {};
  }
}

export async function fetchUserLeaguesAndDetails(username, season) {
  const user = await fetchUser(username);
  if (!user) {
    throw new Error("User not found");
  }

  const leagues = await fetchUserLeagues(user.user_id, season);
  const leaguesWithDetails = await Promise.all(
    leagues.map(async (league) => {
      const [leagueDetails, rosters, users] = await Promise.all([
        fetchLeagueDetails(league.league_id),
        fetchLeagueRosters(league.league_id),
        fetchLeagueUsers(league.league_id),
      ]);

      const allPlayerIds = rosters.flatMap((roster) => [
        ...(roster.starters || []),
        ...(roster.players || []),
      ]);
      const playerNames = await fetchPlayerNames(allPlayerIds);

      const rostersWithUserDetails = rosters.map((roster) => {
        const user = users.find((u) => u.user_id === roster.owner_id);
        return {
          ...roster,
          username: user ? user.display_name : `Team ${roster.roster_id}`,
          avatar: user ? user.avatar : null,
          starters: (roster.starters || []).map((playerId) => ({
            id: playerId,
            name: playerNames[playerId] || playerId,
          })),
          players: (roster.players || []).map((playerId) => ({
            id: playerId,
            name: playerNames[playerId] || playerId,
          })),
        };
      });

      const userRoster = rostersWithUserDetails.find(
        (roster) => roster.owner_id === user.user_id
      );

      return {
        ...leagueDetails,
        rosters: rostersWithUserDetails,
        userRoster,
      };
    })
  );

  return leaguesWithDetails;
}
export async function fetchPlayerStats(
  playerIds,
  leagueSettings,
  scoringSystem = "standard"
) {
  try {
    // Fetch player details for all players
    const playerDetails = await fetchPlayerDetails(playerIds);

    // Fetch the seasonal stats
    let { data: seasonalStats, error } = await supabase
      .from("player_seasonal_stats")
      .select(
        `
        player_id,
        fantasy_points,
        fantasy_points_ppr,
        games,
        passing_yards,
        passing_tds,
        passing_2pt_conversions,
        rushing_yards,
        rushing_tds,
        rushing_2pt_conversions,
        receptions,
        receiving_yards,
        receiving_tds,
        receiving_2pt_conversions,
        interceptions,
        sack_fumbles_lost,
        rushing_fumbles_lost,
        receiving_fumbles_lost,
        nfl_players (
          sleeper_id,
          player_name,
          position,
          team,
          headshot_url
        )
      `
      )
      .in("nfl_players.sleeper_id", playerIds);

    if (error) throw error;

    const playerStats = {};

    // Process seasonal stats
    seasonalStats.forEach((stats) => {
      if (stats.nfl_players && stats.nfl_players.sleeper_id) {
        const sleeperId = stats.nfl_players.sleeper_id;
        const calculatedStats = calculateFantasyPoints(
          stats,
          leagueSettings,
          scoringSystem
        );
        playerStats[sleeperId] = {
          ...calculatedStats,
          playerDetails: {
            name: stats.nfl_players.player_name,
            position: stats.nfl_players.position,
            team: stats.nfl_players.team,
            headshot_url: stats.nfl_players.headshot_url,
          },
          rawStats: {
            passingYards: stats.passing_yards || 0,
            passingTds: stats.passing_tds || 0,
            passing2PtConversions: stats.passing_2pt_conversions || 0,
            rushingYards: stats.rushing_yards || 0,
            rushingTds: stats.rushing_tds || 0,
            rushing2PtConversions: stats.rushing_2pt_conversions || 0,
            receptions: stats.receptions || 0,
            receivingYards: stats.receiving_yards || 0,
            receivingTds: stats.receiving_tds || 0,
            receiving2PtConversions: stats.receiving_2pt_conversions || 0,
            interceptions: stats.interceptions || 0,
            sackFumblesLost: stats.sack_fumbles_lost || 0,
            rushingFumblesLost: stats.rushing_fumbles_lost || 0,
            receivingFumblesLost: stats.receiving_fumbles_lost || 0,
          },
        };
      }
    });

    // Add entries for all players, including those with no stats
    playerIds.forEach((id) => {
      if (!playerStats[id]) {
        playerStats[id] = {
          totalPoints: 0,
          averagePoints: 0,
          gamesPlayed: 0,
          playerDetails: playerDetails[id] || {
            name: "Unknown Player",
            position: "N/A",
            team: "N/A",
            headshot_url: null,
          },
          rawStats: {
            passingYards: 0,
            passingTds: 0,
            passing2PtConversions: 0,
            rushingYards: 0,
            rushingTds: 0,
            rushing2PtConversions: 0,
            receptions: 0,
            receivingYards: 0,
            receivingTds: 0,
            receiving2PtConversions: 0,
            interceptions: 0,
            sackFumblesLost: 0,
            rushingFumblesLost: 0,
            receivingFumblesLost: 0,
          },
        };
      }
    });

    return playerStats;
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return {};
  }
}

function calculateFantasyPoints(
  stats,
  leagueSettings,
  scoringSystem = "standard"
) {
  const {
    pass_td = 4,
    pass_yd = 0.04,
    pass_int = -1,
    rush_yd = 0.1,
    rush_td = 6,
    rec_yd = 0.1,
    rec_td = 6,
    fum_lost = -2,
    bonus_rec_te = 0,
    pass_2pt = 2,
    rush_2pt = 2,
    rec_2pt = 2,
    rec = scoringSystem === "PPR" ? 1 : scoringSystem === "halfPPR" ? 0.5 : 0,
  } = leagueSettings;

  let calculatedPoints = 0;
  let pointBreakdown = {};

  // Calculate points for all categories
  pointBreakdown.passingYards = (stats.passing_yards || 0) * pass_yd;
  pointBreakdown.passingTds = (stats.passing_tds || 0) * pass_td;
  pointBreakdown.interceptions = (stats.interceptions || 0) * pass_int;
  pointBreakdown.rushingYards = (stats.rushing_yards || 0) * rush_yd;
  pointBreakdown.rushingTds = (stats.rushing_tds || 0) * rush_td;
  pointBreakdown.receivingYards = (stats.receiving_yards || 0) * rec_yd;
  pointBreakdown.receivingTds = (stats.receiving_tds || 0) * rec_td;
  pointBreakdown.receptions = (stats.receptions || 0) * rec;
  pointBreakdown.fumblesLost =
    ((stats.sack_fumbles_lost || 0) +
      (stats.rushing_fumbles_lost || 0) +
      (stats.receiving_fumbles_lost || 0)) *
    fum_lost;
  pointBreakdown.passing2pt = (stats.passing_2pt_conversions || 0) * pass_2pt;
  pointBreakdown.rushing2pt = (stats.rushing_2pt_conversions || 0) * rush_2pt;
  pointBreakdown.receiving2pt =
    (stats.receiving_2pt_conversions || 0) * rec_2pt;

  if (
    bonus_rec_te &&
    stats.nfl_players &&
    stats.nfl_players.position === "TE"
  ) {
    pointBreakdown.tePremium = (stats.receptions || 0) * bonus_rec_te;
  }

  // Sum up all calculated points
  calculatedPoints = Object.values(pointBreakdown).reduce((a, b) => a + b, 0);

  // Compare with pre-calculated points
  let preCalculatedPoints = 0;
  if (scoringSystem === "standard" && stats.fantasy_points != null) {
    preCalculatedPoints = stats.fantasy_points;
  } else if (scoringSystem === "PPR" && stats.fantasy_points_ppr != null) {
    preCalculatedPoints = stats.fantasy_points_ppr;
  }

  // Use the higher value between calculated and pre-calculated points
  const finalPoints = Math.max(calculatedPoints, preCalculatedPoints);

  // Add preCalculated to pointBreakdown for reference
  pointBreakdown.preCalculated = preCalculatedPoints;

  return {
    totalPoints: finalPoints,
    calculatedPoints: calculatedPoints,
    preCalculatedPoints: preCalculatedPoints,
    averagePoints:
      (stats.games || 0) > 0 ? finalPoints / (stats.games || 1) : 0,
    gamesPlayed: stats.games || 0,
    pointBreakdown: pointBreakdown,
  };
}
function calculateProjectedPoints(player) {
  // Implement your fantasy scoring logic here
  // This is a simplified example and should be adjusted based on your league's scoring rules
  let points = 0;

  // Passing
  points += (player.passyardsou || 0) * 0.04; // 1 point per 25 passing yards
  points += (player.passtdsnumber || 0) * 4; // 4 points per passing TD
  points -= (player.interceptions || 0) * 2; // -2 points per interception

  // Rushing
  points += (player.rushyardsou || 0) * 0.1; // 1 point per 10 rushing yards
  points += (player.rushattempts || 0) * 6; // Assuming rushattempts represents rushing TDs, 6 points per TD

  // Receiving
  points += (player.receivingyardsou || 0) * 0.1; // 1 point per 10 receiving yards
  points += (player.receptionsou || 0) * 1; // 1 point per reception (PPR)
  // Assuming receptions over/under represents receiving TDs
  points += (player.receptionsou || 0) * 6; // 6 points per receiving TD

  return points;
}

export { calculateFantasyPoints };
