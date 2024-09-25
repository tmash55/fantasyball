import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, DollarSign, Percent, Star, Zap } from "lucide-react";

export default function LeagueOverview({ leaguesData }) {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const router = useRouter();

  if (!leaguesData || leaguesData.length === 0) {
    return <div>No leagues found for user: {username}</div>;
  }

  const totalLeagues = leaguesData.length;
  const activeLeagues = leaguesData.filter(
    (league) => league.status === "in_season"
  );
  const activeLeaguesCount = activeLeagues.length;
  const totalRosters = leaguesData.reduce(
    (sum, league) => sum + league.total_rosters,
    0
  );
  const averageLeagueSize = (totalRosters / totalLeagues).toFixed(1);

  let totalWins = 0;
  let totalGames = 0;
  let totalPoints = 0;
  let bestLeague = null;
  let bestLeagueWinRate = 0;

  activeLeagues.forEach((league) => {
    const userRoster = league.rosters.find(
      (roster) => roster.owner_id === league.userRoster.owner_id
    );
    if (userRoster && userRoster.settings) {
      const wins = userRoster.settings.wins || 0;
      const losses = userRoster.settings.losses || 0;
      const ties = userRoster.settings.ties || 0;
      const games = wins + losses + ties;
      const winRate = games > 0 ? wins / games : 0;

      totalWins += wins;
      totalGames += games;
      totalPoints += userRoster.settings.fpts || 0;

      if (winRate > bestLeagueWinRate) {
        bestLeagueWinRate = winRate;
        bestLeague = league;
      }
    }
  });

  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

  const handleTotalLeaguesClick = () => {
    router.push(`/fantasy-dashboard/leagues?username=${username}`);
  };

  const handleTotalPlayersClick = () => {
    router.push(`/fantasy-dashboard/exposure?username=${username}`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 cursor-pointer"
        onClick={handleTotalLeaguesClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeagues}</div>
          <p className="text-xs text-muted-foreground">
            {activeLeaguesCount} active
          </p>
        </CardContent>
      </Card>
      <Card
        className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 cursor-pointer"
        onClick={handleTotalPlayersClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Players</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRosters}</div>
          <p className="text-xs text-muted-foreground">
            Avg {averageLeagueSize} per league
          </p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {totalWins} wins / {totalGames} games
          </p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Buy-In</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$0</div>
          <p className="text-xs text-muted-foreground">Feature coming soon</p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best League</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {bestLeague ? bestLeague.name : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {bestLeagueWinRate > 0
              ? `${(bestLeagueWinRate * 100).toFixed(1)}% win rate`
              : "No active leagues"}
          </p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPoints.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Across all active leagues
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
