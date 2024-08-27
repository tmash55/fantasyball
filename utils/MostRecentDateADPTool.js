import { createClient } from "@supabase/supabase-js";
// utils/supabaseUtils.js

export const MostRecentDateADPTool = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from("adp_comparison_11")
      .select("date_added")
      .order("date_added", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching most recent date:", error);
      return null;
    }

    if (data.length) {
      const dateAdded = new Date(data[0].date_added);
      const formattedDate = `${String(dateAdded.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}/${String(dateAdded.getUTCDate()).padStart(
        2,
        "0"
      )}/${dateAdded.getUTCFullYear()}`;
      return formattedDate;
    }

    return null;
  } catch (error) {
    console.error("Error fetching most recent date:", error);
    return null;
  }
};
