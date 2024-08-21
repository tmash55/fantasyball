import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function fetchTop200Adp() {
  const { data, error } = await supabase
    .from("adp_comparison_7")
    .select(
      "sleeper_playerrank, sleeper_positionrank, espn_playerrank, espn_positionrank, nfc_playerrank, nfc_positionrank, full_name, avg_playerrank, nfc_adp"
    )
    .order("nfc_playerrank", { ascending: true })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
