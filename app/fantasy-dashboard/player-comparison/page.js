"use client";

import { useState, useEffect } from "react";
import { fetchPlayerDetails } from "@/libs/sleeper";
import PlayerComparison from "@/components/fantasy-dashboard/PlayerComparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlayerComparisonPage = () => {
  const [players, setPlayers] = useState([]);
  const [leagueSettings, setLeagueSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch player details
        const playerIds = ["1", "2", "3", "4", "5"]; // Replace with actual player IDs in a real application
        const playerDetails = await fetchPlayerDetails(playerIds);
        setPlayers(
          Object.entries(playerDetails).map(([id, details]) => ({
            id,
            name: details.name,
            position: details.position,
            team: details.team,
          }))
        );

        // Fetch league settings
        // In a real application, you'd fetch this data from your API or database
        setLeagueSettings({
          rec: 1,
          pass_td: 4,
          pass_yd: 0.04,
          rush_yd: 0.1,
          rush_td: 6,
          // Add other relevant settings as needed
        });
      } catch (err) {
        setError(
          "An error occurred while fetching data. Please try again later."
        );
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-xl">Loading player data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-xl text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center sm:text-left">
            Player Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Compare fantasy football players based on their stats and your
            league settings. Select two players to see a detailed comparison of
            their performance.
          </p>
        </CardContent>
      </Card>
      <PlayerComparison players={players} leagueSettings={leagueSettings} />
    </div>
  );
};

export default PlayerComparisonPage;
