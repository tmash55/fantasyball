import supabase from "@/lib/supabaseClient";

export async function fetchWeekData(week) {
  // Fetch weekly props data with player names using a join
  const { data: propsData, error } = await supabase
    .from("weekly_props")
    .select(
      `player_id, 
     week, 
     game, 
     date, 
     passyardsou, 
     passtdsnumber, 
     passtdsoverodds, 
     passtdsunderodds, 
     passattempts, 
     passcompletions, 
     interceptions, 
     interceptionsoverodds, 
     interceptionsunderodds, 
     rushyardsou,
     rushattempts,
     receptionsou, 
     receivingyardsou,
     nfl_players (player_name, first_name, last_name, team, position, headshot_url),
     nfl_schedule (game_id, is_completed, result, game_date, game_time, home_team, away_team)` // Added home_team and away_team to get opponent
    )
    .eq("week", week); // Filter by the selected week

  if (error) {
    throw new Error(error.message);
  }

  // Fetch weekly stats data for the selected week
  const { data: statsData, error: statsError } = await supabase
    .from("player_weekly_stats")
    .select(
      "playerID, passing_yards, passing_touchdowns, interceptions, rushing_yards, rushing_touchdowns, receiving_yards, receiving_touchdowns, receptions"
    )
    .eq("week", week);

  if (statsError) {
    throw new Error(statsError.message);
  }

  // Combine the weekly props, stats, and schedule data into a single array
  const combinedData = propsData.map((prop) => {
    const stat = statsData.find((s) => s.playerID === prop.playerID);
    const playerTeam = prop.nfl_players?.team || "";
    let opponent = "N/A"; // Default value

    if (prop.nfl_schedule) {
      if (prop.nfl_schedule.home_team && prop.nfl_schedule.away_team) {
        // Determine the opponent
        opponent =
          prop.nfl_schedule.home_team === playerTeam
            ? prop.nfl_schedule.away_team
            : prop.nfl_schedule.home_team;
      } else {
        console.warn(
          `Missing home_team or away_team for game ID: ${prop.nfl_schedule.game_id}`
        );
      }
    } else {
      console.warn(
        `No schedule data found for player ID: ${prop.player_id}, game: ${prop.game}`
      );
    }

    return {
      ...prop,
      team: playerTeam,
      position: prop.nfl_players?.position || "",
      game_completed: prop.nfl_schedule?.is_completed || false,
      game_result: prop.nfl_schedule?.result || "",
      game_date: prop.nfl_schedule?.game_date || "",
      game_time: prop.nfl_schedule?.game_time || "",
      opponent: opponent, // Set opponent value
      passing_yards: stat?.passing_yards || 0,
      passing_tds: stat?.passing_tds || 0,
      interceptions: stat?.interceptions || 0,
      rushing_yards: stat?.rushing_yards || 0,
      rushing_tds: stat?.rushing_tds || 0,
      receiving_yards: stat?.receiving_yards || 0,
      receiving_tds: stat?.receiving_tds || 0,
      receptions: stat?.receptions || 0,
      // Correctly match the props to the weekly stats
      hitPassingYards: prop.nfl_schedule?.is_completed
        ? stat?.passing_yards >= prop.passyardsou
        : null,
      hitRushingYards: prop.nfl_schedule?.is_completed
        ? stat?.rushing_yards >= prop.rushyardsou
        : null,
      hitRushAttempts: prop.nfl_schedule?.is_completed
        ? stat?.rushing_yards >= prop.rushattempts
        : null,
      hitReceivingYards: prop.nfl_schedule?.is_completed
        ? stat?.receiving_yards >= prop.receivingyardsou
        : null,
    };
  });

  return combinedData;
}
