// app/fantasy-dashboard/leagues/page.tsx
import { fetchUserLeaguesAndDetails } from "@/libs/sleeper";
import LeaguesDisplay from "./LeaguesDisplay";

export default async function LeaguesPage({ searchParams }) {
  const username = searchParams.username;

  if (!username) {
    return <div>Please provide a username to view leagues.</div>;
  }

  try {
    const leagues = await fetchUserLeaguesAndDetails(username, 2024);
    return <LeaguesDisplay initialLeagues={leagues} username={username} />;
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return <div>Error: Failed to fetch leagues. Please try again.</div>;
  }
}
