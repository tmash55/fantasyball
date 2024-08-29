import supabase from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

export async function fetchTop200Adp() {
  const { data, error } = await supabase
    .from("adp_comparison_11")
    .select(
      "sleeper_playerrank, sleeper_positionrank, espn_playerrank, espn_positionrank, nfc_playerrank, nfc_positionrank, full_name, nfc_adp, avg_playerrank, consensus_pick, consensus_positionrank, yahoo_playerrank, yahoo_positionrank, date_added"
    )
    .order("nfc_playerrank", { ascending: true })
    .limit(250);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
