// utils/fetchTdPropsWeekData.js
import supabase from "@/lib/supabaseClient";

export async function fetchTdPropsWeekData(week) {
  // Fetch the TD props data for the selected week
  const { data: tdPropsData, error: tdPropsError } = await supabase
    .from(`td_props_week_${week}`)
    .select(
      "player, team, position, game, date, first_td_odds, anytime_td_odds, two_plus_td_odds, new_datetime, anytime_td, first_td, two_plus_tds, total_tds, is_completed"
    );

  if (tdPropsError) {
    throw new Error(tdPropsError.message);
  }

  return tdPropsData;
}
