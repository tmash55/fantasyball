import supabase from "@/lib/supabaseClient";

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const userUID = searchParams.get("userUID");

  try {
    const { data, error } = await supabase
      .from("leagues")
      .select("*")
      .eq("user_uid", userUID);

    if (error) throw error;

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
