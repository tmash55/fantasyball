import { createClient } from "@supabase/supabase-js";
// utils/supabaseUtils.js

export const getMostRecentDate = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const { data, error } = await supabase
      .from("ktc_test")
      .select("date")
      .order("date", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching most recent date:", error);
      return null;
    }

    return data.length ? data[0].date : null;
  } catch (error) {
    console.error("Error fetching most recent date:", error);
    return null;
  }
};
