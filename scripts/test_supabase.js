require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Supabase Anon Key:", process.env.SUPABASE_ANON_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testSupabase() {
  const { data, error } = await supabase
    .from("sleeper_seasonal_stats")
    .select("*")
    .limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data:", data);
  }
}

testSupabase();
