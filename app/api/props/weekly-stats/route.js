import supabase from "@/lib/supabaseClient";

export async function fetchWeeklyStats(week) {
  // Fetch weekly stats data for the selected week
  const { data: statsData, error: statsError } = await supabase
    .from("player_weekly_stats")
    .select(
      "player_id, passing_yards, passing_tds, interceptions, rushing_yards, rushing_tds, receiving_yards, receiving_tds, receptions"
    )
    .eq("week", week);

  if (statsError) {
    throw new Error(statsError.message);
  }

  return statsData;
}
