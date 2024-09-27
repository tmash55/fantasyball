"use client";

import { useState, useEffect } from "react";
import { fetchPlayerDetails } from "@/libs/sleeper";
import PlayerComparison from "@/components/fantasy-dashboard/PlayerComparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeeklyFantasyProjections from "@/components/playerProjections/WeeklyFantasyProjections";
import { Info } from "lucide-react";

const PlayerComparisonPage = () => {
  const [players, setPlayers] = useState([]);
  const [leagueSettings, setLeagueSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
            Weekly Fantasy Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            Explore comprehensive NFL player projections for each week. Use the
            filters and sorting options to customize your view and gain valuable
            insights for your fantasy team.
          </p>
          <div className="flex items-center text-sm text-gray-400">
            <Info className="mr-2 h-4 w-4" />
            <span>Pro Tip: Click on a player to see detailed projections.</span>
          </div>
        </CardContent>
      </Card>
      <WeeklyFantasyProjections />
    </div>
  );
};

export default PlayerComparisonPage;
