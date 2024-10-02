import supabase from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Call the get_snap_count_trends function
    const { data, error } = await supabase.rpc("get_snap_count_trends");

    if (error) {
      throw error;
    }

    // Return the data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching snap count trends:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching snap count trends" },
      { status: 500 }
    );
  }
}
