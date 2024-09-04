import supabase from "@/lib/supabaseClient";

export const MostRecentDateTD = async () => {
  try {
    const { data, error } = await supabase
      .from("td_props_week_1")
      .select("date_added")
      .order("date_added", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching most recent date:", error);
      return null;
    }

    if (data && data.length > 0 && data[0].date_added) {
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

    console.warn("No date data found.");
    return null;
  } catch (error) {
    console.error("Error fetching most recent date:", error);
    return null;
  }
};
