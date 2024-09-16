import supabase from "@/lib/supabaseClient";

export async function fetchTouchdownData(week) {
  const { data: touchdownData, error } = await supabase
    .from("weekly_touchdowns")
    .select(
      `player_id,
       week,
       game,
       date,
       first_td_odds,
       anytime_td_odds,
       two_plus_td_odds,
       date_added,
       name,
       nfl_players (player_name, team, position, headshot_url),
       nfl_schedule (game_id, is_completed, game_date, game_time, gameday, away_team, home_team)`
    )
    .eq("week", week); // Filter by the selected week

  if (error) {
    throw new Error(error.message);
  }

  const combinedTouchdownData = touchdownData.map((td) => ({
    ...td,
    player_name: td.nfl_players?.player_name || "", // Get player name
    team: td.nfl_players?.team || "", // Get team
    position: td.nfl_players?.position || "", // Get position
    game_completed: td.nfl_schedule?.is_completed ? "Yes" : "No",
    gameday: td.nfl_schedule?.gameday || "Unknown",
  }));

  return combinedTouchdownData;
}
