import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchLeagueName } from "@/libs/sleeper";

export default function LeagueOverview({ leagues, ranks }) {
  const [leaguesWithNames, setLeaguesWithNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeagueNames = async () => {
      try {
        const updatedLeagues = await Promise.all(
          leagues.map(async (league) => ({
            ...league,
            name: await fetchLeagueName(league.league_id),
          }))
        );
        setLeaguesWithNames(updatedLeagues);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching league names:", err);
        setError("Failed to fetch league names. Please try again.");
        setLoading(false);
      }
    };

    fetchLeagueNames();
  }, [leagues]);

  const totalLeagues = leaguesWithNames.length;
  const averageRank =
    Object.values(ranks).reduce((sum, rank) => sum + rank.adpRank, 0) /
    totalLeagues;

  const bestPerformingLeague = Object.entries(ranks).reduce(
    (best, [leagueId, rank]) =>
      rank.adpRank < best.rank ? { id: leagueId, rank: rank.adpRank } : best,
    { id: null, rank: Infinity }
  );

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="text-center">Loading league overview...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>League Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Total Leagues</h3>
            <p className="text-3xl font-bold">{totalLeagues}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Average Rank</h3>
            <p className="text-3xl font-bold">{averageRank.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Best Performing League</h3>
            <p className="text-3xl font-bold">
              {bestPerformingLeague.id
                ? leaguesWithNames.find(
                    (league) => league.league_id === bestPerformingLeague.id
                  )?.name || "N/A"
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
