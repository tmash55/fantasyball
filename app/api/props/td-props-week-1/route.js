// utils/fetchTdPropsWeek1Data.js
import supabase from "@/lib/supabaseClient";

export async function fetchTdPropsWeek1Data() {
  // Fetch the TD props data from the `td_props_week_1` table
  const { data: tdPropsData, error: tdPropsError } = await supabase
    .from("td_props_week_1")
    .select(
      "player, team, position, game, date, first_td_odds, anytime_td_odds, two_plus_td_odds, new_datetime"
    );

  if (tdPropsError) {
    throw new Error(tdPropsError.message);
  }

  return tdPropsData;
}
