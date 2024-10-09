"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchAllLeagueRosters,
  getPlayerInfo,
  getCurrentNFLWeek,
  fetchLeagueDetails,
} from "@/libs/sleeper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const fetchTrendingPlayers = async () => {
  const response = await fetch(
    "https://api.sleeper.app/v1/players/nfl/trending/add?limit=40"
  );
  const data = await response.json();
  return data;
};

const getPositionColor = (position) => {
  switch (position) {
    case "QB":
      return "bg-red-500";
    case "RB":
      return "bg-blue-500";
    case "WR":
      return "bg-green-500";
    case "TE":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const WaiverWire = ({ leagueId }) => {
  const [currentWeek, setCurrentWeek] = useState(null);
  const [rosteredPlayers, setRosteredPlayers] = useState(new Set());
  const [trendingPlayers, setTrendingPlayers] = useState([]);
  const [playerInfo, setPlayerInfo] = useState({});
  const [leagueDetails, setLeagueDetails] = useState(null);
  const [loading, setLoading] = useState({
    week: true,
    rostered: true,
    trending: true,
    playerInfo: true,
    leagueDetails: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const week = await getCurrentNFLWeek();
      setCurrentWeek(week);
      setLoading((prev) => ({ ...prev, week: false }));

      const rostered = await fetchAllLeagueRosters(leagueId);
      setRosteredPlayers(new Set(rostered));
      setLoading((prev) => ({ ...prev, rostered: false }));

      const trending = await fetchTrendingPlayers();
      setTrendingPlayers(trending);
      setLoading((prev) => ({ ...prev, trending: false }));

      const details = await fetchLeagueDetails(leagueId);
      setLeagueDetails(details);
      setLoading((prev) => ({ ...prev, leagueDetails: false }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (trendingPlayers.length > 0) {
        const infoPromises = trendingPlayers.map((player) =>
          getPlayerInfo(player.player_id)
        );
        const infoArray = await Promise.all(infoPromises);
        const info = infoArray.reduce((acc, playerInfo, index) => {
          acc[trendingPlayers[index].player_id] = playerInfo;
          return acc;
        }, {});
        setPlayerInfo(info);
        setLoading((prev) => ({ ...prev, playerInfo: false }));
      }
    };

    fetchPlayerData();
  }, [trendingPlayers]);

  const availableTrending = useMemo(() => {
    if (!leagueDetails || !trendingPlayers.length) return [];

    const includesDEF = leagueDetails.roster_positions.includes("DEF");
    const includesK = leagueDetails.roster_positions.includes("K");

    return trendingPlayers.filter((player) => {
      if (!rosteredPlayers.has(player.player_id)) {
        const playerPosition = playerInfo[player.player_id]?.position;
        if (!includesDEF && playerPosition === "DEF") return false;
        if (!includesK && playerPosition === "K") return false;
        return true;
      }
      return false;
    });
  }, [trendingPlayers, rosteredPlayers, leagueDetails, playerInfo]);

  const isLoading = Object.values(loading).some(Boolean);

  const renderPlayerRow = useCallback(
    (player) => (
      <TableRow key={player.player_id}>
        <TableCell>
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`}
                alt={playerInfo[player.player_id]?.player_name || "Player"}
              />
              <AvatarFallback>
                {(playerInfo[player.player_id]?.player_name || "?").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-semibold">
                {playerInfo[player.player_id]?.player_name || "Unknown Player"}
              </div>
              <div className="flex items-center mt-1">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${getPositionColor(
                    playerInfo[player.player_id]?.position
                  )}`}
                ></div>
                <span className="text-sm text-muted-foreground">
                  {playerInfo[player.player_id]?.team || "N/A"} -{" "}
                  {playerInfo[player.player_id]?.position || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">{player.count}</TableCell>
      </TableRow>
    ),
    [playerInfo]
  );

  return (
    <div className="space-y-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Trending Waiver Wire Adds - Week {currentWeek}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading trending players...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Add Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{availableTrending.map(renderPlayerRow)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaiverWire;
