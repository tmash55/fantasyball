"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const BASE_URL = "https://api.sleeper.app/v1";

export default function PlayerUtilizationReport() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);

  useEffect(() => {
    fetchPlayers();
    fetchCurrentWeek();
  }, []);

  useEffect(() => {
    if (currentWeek > 0) {
      fetchWeeklyStats();
    }
  }, [currentWeek]);

  useEffect(() => {
    if (selectedPlayer) {
      fetchPlayerData(selectedPlayer.id);
    }
  }, [selectedPlayer]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/players/nfl`);
      const playerList = Object.values(response.data)
        .filter(
          (player) =>
            player.active && ["QB", "RB", "WR", "TE"].includes(player.position)
        )
        .map((player) => ({
          id: player.player_id,
          name: `${player.first_name} ${player.last_name}`,
          team: player.team || "FA",
          position: player.position,
        }));
      setPlayers(playerList);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const fetchCurrentWeek = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/state/nfl`);
      setCurrentWeek(response.data.week);
    } catch (error) {
      console.error("Error fetching current week:", error);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const [currentWeekStats, previousWeekStats] = await Promise.all([
        axios.get(
          `${BASE_URL}/stats/nfl/regular/2024/${currentWeek}?season_type=regular&position=all`
        ),
        axios.get(
          `${BASE_URL}/stats/nfl/regular/2024/${
            currentWeek - 1
          }?season_type=regular&position=all`
        ),
      ]);
      setWeeklyStats([previousWeekStats.data, currentWeekStats.data]);
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
    }
  };

  const fetchPlayerData = async (playerId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/stats/nfl/player/${playerId}`,
        {
          params: {
            season_type: "regular",
            season: new Date().getFullYear(),
          },
        }
      );
      const processedData = processPlayerData(response.data);
      setPlayerData(processedData);
    } catch (error) {
      console.error("Error fetching player data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processPlayerData = (rawData) => {
    if (!rawData || typeof rawData !== "object") {
      console.error("Invalid rawData:", rawData);
      return {
        offensiveSnaps: [],
        routesRun: [],
        targets: [],
        carries: [],
        teamRushingAttempts: [],
      };
    }

    const weeks = Object.keys(rawData).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    return {
      offensiveSnaps: weeks.map((week) => rawData[week]?.stats?.off_snp || 0),
      routesRun: weeks.map((week) => rawData[week]?.stats?.routes_run || 0),
      targets: weeks.map((week) => rawData[week]?.stats?.targets || 0),
      carries: weeks.map((week) => rawData[week]?.stats?.rush_att || 0),
      teamRushingAttempts: weeks.map(
        (week) => rawData[week]?.stats?.tm_rush_att || 0
      ),
    };
  };

  const calculateSnapPercentageChange = (previousWeek, currentWeek) => {
    const calculatePercentage = (week) =>
      (week.stats?.off_snp / week.stats?.tm_off_snp) * 100 || 0;
    const previousPercentage = calculatePercentage(previousWeek);
    const currentPercentage = calculatePercentage(currentWeek);
    return currentPercentage - previousPercentage;
  };

  const topMovers = useMemo(() => {
    if (weeklyStats.length !== 2) return [];

    const [previousWeek, currentWeek] = weeklyStats;
    const changes = Object.keys(currentWeek)
      .map((playerId) => {
        const player = players.find((p) => p.id === playerId);
        if (!player) return null;

        const change = calculateSnapPercentageChange(
          previousWeek[playerId] || {},
          currentWeek[playerId] || {}
        );
        return { ...player, change };
      })
      .filter(Boolean);

    return changes
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 10);
  }, [weeklyStats, players]);

  const prepareChartData = (dataKey) => {
    if (!playerData) return [];
    return playerData[dataKey].map((value, index) => ({
      week: index + 1,
      value: value,
    }));
  };

  const calculateCarryPercentage = () => {
    if (!playerData) return [];
    return playerData.carries.map((carries, index) => ({
      week: index + 1,
      value: (carries / playerData.teamRushingAttempts[index]) * 100,
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-semibold">Week {label}</p>
          <p>{`Value: ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.team &&
        player.team.toLowerCase().includes(searchTerm.toLowerCase())) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Player Utilization Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <Input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {filteredPlayers.map((player) => (
                    <Button
                      key={player.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      {player.name} ({player.team} - {player.position})
                    </Button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Movers (Snap %)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {topMovers.map((player) => (
                    <Button
                      key={player.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      {player.name} ({player.team} - {player.position}){" "}
                      {player.change > 0 ? "+" : ""}
                      {player.change.toFixed(2)}%
                    </Button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            Loading...
          </div>
        ) : playerData ? (
          <Tabs defaultValue="snaps">
            <TabsList>
              <TabsTrigger value="snaps">Offensive Snaps</TabsTrigger>
              <TabsTrigger value="routes">Routes Run</TabsTrigger>
              <TabsTrigger value="targets">Targets</TabsTrigger>
              <TabsTrigger value="carries">Carries</TabsTrigger>
            </TabsList>
            <TabsContent value="snaps">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData("offensiveSnaps")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="routes">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData("routesRun")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="targets">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData("targets")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="carries">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calculateCarryPercentage()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex justify-center items-center h-[300px]">
            Select a player to view utilization data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
