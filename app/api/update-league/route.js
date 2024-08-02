import supabase from "@/lib/supabaseClient";

export async function POST(req, res) {
  const { leagueId, userUID, buyIn, totalPot } = await req.json();

  // TODO: Add validation for input data

  try {
    const { data, error } = await supabase
      .from("leagues")
      .insert(
        [
          {
            id: leagueId,
            user_uid: userUID,
            buy_in: buyIn,
            total_pot: totalPot,
          },
        ],
        { upsert: true }
      )
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "League updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating league:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
