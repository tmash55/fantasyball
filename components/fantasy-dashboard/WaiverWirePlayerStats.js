"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { getCurrentNFLWeek } from "@/libs/sleeper";

const BASE_URL = "https://api.sleeper.app/v1";

async function getPlayerStats(week) {
  try {
    const response = await axios.get(
      `${BASE_URL}/stats/nfl/regular/2024/${week}?season_type=regular&position=all`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching player stats for week ${week}:`, error);
    return {};
  }
}

function calculateHalfPPR(stats) {
  return ((stats.pts_ppr || 0) + (stats.pts_std || 0)) / 2;
}

export default function WaiverWirePlayerStats() {
  const [playerStats, setPlayerStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentWeek = await getCurrentNFLWeek();
      const lastWeek = currentWeek - 1;
      const stats = await Promise.all([
        getPlayerStats(lastWeek),
        getPlayerStats(lastWeek - 1),
        getPlayerStats(lastWeek - 2),
      ]);

      const combinedStats = {};

      stats.forEach((weekStats, index) => {
        Object.entries(weekStats).forEach(([playerId, playerData]) => {
          if (!combinedStats[playerId]) {
            combinedStats[playerId] = {
              name: playerData.player_name,
              position: playerData.position,
              team: playerData.team,
              weeklyStats: [],
            };
          }
          combinedStats[playerId].weeklyStats[index] =
            calculateHalfPPR(playerData);
        });
      });

      Object.values(combinedStats).forEach((player) => {
        player.avgLast3 =
          player.weeklyStats.filter(Boolean).reduce((a, b) => a + b, 0) /
          player.weeklyStats.filter(Boolean).length;
      });

      setPlayerStats(combinedStats);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      setError("Failed to load player stats. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const topPlayers = Object.values(playerStats)
    .sort((a, b) => b.avgLast3 - a.avgLast3)
    .slice(0, 20);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Top Players by Average Half PPR (Last 3 Games)
          <Button onClick={fetchStats} disabled={isLoading}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : isLoading ? (
          <div className="text-center p-4">Loading player stats...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Avg Last 3 Games</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPlayers.map((player) => (
                <TableRow key={player.name}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell className="text-right">
                    {player.avgLast3.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
