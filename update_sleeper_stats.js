const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase credentials are missing. Please check your .env.local file."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SLEEPER_API_URL =
  "https://api.sleeper.app/v1/stats/nfl/regular/2024?season_type=regular&position=all";

// ... (keep all the existing imports and configurations)

async function fetchAndUpdateSleeperStats() {
  try {
    console.log("Fetching data from Sleeper API...");
    const response = await axios.get(SLEEPER_API_URL);
    const players = Object.entries(response.data).map(([id, data]) => ({
      id,
      data,
      last_updated: new Date().toISOString(),
    }));

    console.log(`Fetched ${players.length} player stats. Updating database...`);

    // Update database in batches to avoid potential payload size limits
    const batchSize = 100;
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from("sleeper_seasonal_stats")
        .upsert(batch, { onConflict: "id" });

      if (error) {
        console.error(`Error updating batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Successfully updated batch ${i / batchSize + 1}`);
      }
    }

    console.log("Database update completed.");
  } catch (error) {
    console.error("Error fetching or updating data:", error);
  }
}

// Export the function
module.exports = { fetchAndUpdateSleeperStats };

// If you want to be able to run this script directly as well, keep this:
if (require.main === module) {
  fetchAndUpdateSleeperStats();
}

fetchAndUpdateSleeperStats();
