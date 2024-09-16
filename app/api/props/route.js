// utils/fetchPropData.js

import supabase from "@/lib/supabaseClient";

export async function fetchPropData() {
  const { data: propData, error: propError } = await supabase
    .from("draftkings_2024_playerprops")
    .select(
      "player_id, player_name, position, team, passing_yards, passing_tds, receiving_yards, receiving_tds, rushing_yards, rushing_tds"
    );

  const { data: statsData, error: statsError } = await supabase
    .from("player_seasonal_stats")
    .select(
      `
      player_id,
      passing_yards, 
      passing_tds, 
      receiving_yards, 
      receiving_tds, 
      rushing_yards, 
      rushing_tds,
      nfl_players (player_name, position, team, headshot_url)
      `
    );

  if (propError || statsError) {
    throw new Error(propError?.message || statsError?.message);
  }

  // Combine and calculate progress, and filter out N/A values
  const combinedData = propData
    .map((prop) => {
      const playerStats = statsData.find(
        (stats) => stats.player_id === prop.player_id
      );

      if (playerStats) {
        return {
          player_name: playerStats.nfl_players.player_name || prop.player_name,
          position: playerStats.nfl_players.position || prop.position,
          team: playerStats.nfl_players.team || prop.team,
          passing_yards: playerStats.passing_yards,
          passing_yards_over_under:
            prop.passing_yards !== "N/A" ? prop.passing_yards : null,
          passing_yards_progress:
            prop.passing_yards !== "N/A"
              ? playerStats.passing_yards / prop.passing_yards
              : null,
          passing_tds: playerStats.passing_tds,
          passing_tds_over_under:
            prop.passing_tds !== "N/A" ? prop.passing_tds : null,
          passing_tds_progress:
            prop.passing_tds !== "N/A"
              ? playerStats.passing_tds / prop.passing_tds
              : null,
          receiving_yards: playerStats.receiving_yards,
          receiving_yards_over_under:
            prop.receiving_yards !== "N/A" ? prop.receiving_yards : null,
          receiving_yards_progress:
            prop.receiving_yards !== "N/A"
              ? playerStats.receiving_yards / prop.receiving_yards
              : null,
          receiving_tds: playerStats.receiving_tds,
          receiving_tds_over_under:
            prop.receiving_tds !== "N/A" ? prop.receiving_tds : null,
          receiving_tds_progress:
            prop.receiving_tds !== "N/A"
              ? playerStats.receiving_tds / prop.receiving_tds
              : null,
          rushing_yards: playerStats.rushing_yards,
          rushing_yards_over_under:
            prop.rushing_yards !== "N/A" ? prop.rushing_yards : null,
          rushing_yards_progress:
            prop.rushing_yards !== "N/A"
              ? playerStats.rushing_yards / prop.rushing_yards
              : null,
          rushing_tds: playerStats.rushing_tds,
          rushing_tds_over_under:
            prop.rushing_tds !== "N/A" ? prop.rushing_tds : null,
          rushing_tds_progress:
            prop.rushing_tds !== "N/A"
              ? playerStats.rushing_tds / prop.rushing_tds
              : null,
        };
      }

      return null; // In case the player has no stats
    })
    .filter(Boolean); // Remove nulls

  return combinedData;
}
