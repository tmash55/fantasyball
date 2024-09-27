"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import {
  fetchPlayerSeasonalStatsOnly,
  getCurrentNFLWeek,
  fetchNFLSchedule,
} from "@/libs/sleeper";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BASE_URL = "https://api.sleeper.app/v1";

export default function SeasonLeaderboards() {
  const [players, setPlayers] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "totalPointsPPR",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [scoringType, setScoringType] = useState("PPR");
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [nflSchedule, setNFLSchedule] = useState({});

  const fetchCurrentWeekAndPlayers = useCallback(async () => {
    try {
      const week = await getCurrentNFLWeek();
      setCurrentWeek(week);
      const schedule = await fetchNFLSchedule(week);
      setNFLSchedule(schedule);
      setIsLoading(true);

      const [playerStats, sleeperRankings, weeklyData, seasonStats] =
        await Promise.all([
          fetchPlayerSeasonalStatsOnly(),
          axios.get(
            `${BASE_URL}/stats/nfl/regular/2024?season_type=regular&position=ALL`
          ),
          Promise.all(
            Array.from({ length: week }, (_, i) => i + 1).map((weekNum) =>
              axios.get(
                `${BASE_URL}/stats/nfl/regular/2024/${weekNum}?season_type=regular&position=all`
              )
            )
          ),
          axios.get(
            `${BASE_URL}/stats/nfl/regular/2024?season_type=regular&position=all`
          ),
        ]);

      const weeklyStats = weeklyData.reduce((acc, weekData, index) => {
        acc[index + 1] = weekData.data;
        return acc;
      }, {});

      const combinedPlayerData = playerStats.map((player) => {
        const sleeperRank = sleeperRankings.data[player.id];
        const seasonStat = seasonStats.data[player.id];
        const playerWeeklyStats = Array.from(
          { length: week },
          (_, i) => i + 1
        ).map((weekNum) => {
          const weekStats = weeklyStats[weekNum][player.id] || null;
          const opponent = weekStats ? getOpponent(player.team, weekNum) : null;
          return { ...weekStats, opponent };
        });
        return {
          ...player,
          rank_ppr: sleeperRank?.rank_ppr ?? Infinity,
          rank_half_ppr: sleeperRank?.rank_half_ppr ?? Infinity,
          rank_std: sleeperRank?.rank_std ?? Infinity,
          pos_rank_ppr: sleeperRank?.pos_rank_ppr ?? Infinity,
          pos_rank_half_ppr: sleeperRank?.pos_rank_half_ppr ?? Infinity,
          pos_rank_std: sleeperRank?.pos_rank_std ?? Infinity,
          weeklyStats: playerWeeklyStats,
          totalPointsHalfPPR: seasonStat?.pts_half_ppr ?? 0,
          averagePointsHalfPPR: seasonStat
            ? seasonStat.pts_half_ppr / seasonStat.gp
            : 0,
        };
      });

      setPlayers(combinedPlayerData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentWeekAndPlayers();
  }, [fetchCurrentWeekAndPlayers]);

  const handleSort = useCallback((key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  }, []);

  const sortedPlayers = useMemo(() => {
    const sortableItems = [...players];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "desc" ? 1 : -1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "desc" ? -1 : 1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [players, sortConfig]);

  const filteredPlayers = useMemo(() => {
    return sortedPlayers.filter(
      (player) =>
        (selectedPosition === "All" || player.position === selectedPosition) &&
        (player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.team.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sortedPlayers, selectedPosition, searchTerm]);

  const getTotalPoints = useCallback(
    (player) => {
      return scoringType === "PPR"
        ? player.totalPointsPPR
        : scoringType === "HALF_PPR"
        ? player.totalPointsHalfPPR
        : player.totalPointsStandard;
    },
    [scoringType]
  );

  const getAveragePoints = useCallback(
    (player) => {
      const points =
        scoringType === "PPR"
          ? player.averagePointsPPR
          : scoringType === "HALF_PPR"
          ? player.averagePointsHalfPPR
          : player.averagePointsStandard;
      return points || 0;
    },
    [scoringType]
  );

  const getOverallRank = useCallback(
    (player) => {
      const rank = player[`rank_${scoringType.toLowerCase()}`];
      return rank !== Infinity ? rank : "-";
    },
    [scoringType]
  );

  const getPosRank = useCallback(
    (player) => {
      const rank = player[`pos_rank_${scoringType.toLowerCase()}`];
      return rank !== Infinity ? rank : "-";
    },
    [scoringType]
  );

  const getWeeklyPoints = useCallback(
    (weekStats) => {
      if (!weekStats) return null;
      return scoringType === "PPR"
        ? weekStats.pts_ppr
        : scoringType === "HALF_PPR"
        ? weekStats.pts_half_ppr
        : weekStats.pts_std;
    },
    [scoringType]
  );

  const getWeeklyPosRank = useCallback(
    (weekStats) => {
      if (!weekStats) return null;
      return scoringType === "PPR"
        ? weekStats.pos_rank_ppr
        : scoringType === "HALF_PPR"
        ? weekStats.pos_rank_half_ppr
        : weekStats.pos_rank_std;
    },
    [scoringType]
  );

  const getScoreColor = useCallback((points) => {
    if (points === null || points === undefined)
      return "bg-base-200 text-gray-400"; // Neutral color for players who haven't played
    if (points >= 25) return "bg-green-500 text-white";
    if (points >= 20) return "bg-green-400 text-white";
    if (points >= 15) return "bg-green-300 text-black";
    if (points >= 10) return "bg-yellow-300 text-black";
    if (points >= 5) return "bg-orange-200 text-black";
    if (points > 0) return "bg-red-400 text-black";
    return "bg-red-500 text-white"; // Only use red for negative or zero points
  }, []);

  const getOpponent = useCallback(
    (playerTeam, week) => {
      const weekSchedule = nflSchedule[week];
      if (!weekSchedule) return "-";

      const matchup = Object.entries(weekSchedule).find(
        ([home, away]) => home === playerTeam || away === playerTeam
      );

      if (!matchup) return "-";
      const [home, away] = matchup;
      return playerTeam === home ? away : `@${home}`;
    },
    [nflSchedule]
  );
  useEffect(() => {
    setSortConfig({
      key:
        scoringType === "PPR"
          ? "rank_ppr"
          : scoringType === "HALF_PPR"
          ? "rank_half_ppr"
          : "rank_std",
      direction: "asc",
    });
  }, [scoringType]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Season Leaderboards (Week {currentWeek})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex-1 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search players or teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent className="bg-base-100">
              <SelectItem value="All">All Positions</SelectItem>
              <SelectItem value="QB">QB</SelectItem>
              <SelectItem value="RB">RB</SelectItem>
              <SelectItem value="WR">WR</SelectItem>
              <SelectItem value="TE">TE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={scoringType} onValueChange={setScoringType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Scoring Type" />
            </SelectTrigger>
            <SelectContent className="bg-base-100">
              <SelectItem value="PPR">PPR</SelectItem>
              <SelectItem value="HALF_PPR">Half PPR</SelectItem>
              <SelectItem value="STD">Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("overallRank")}
                  >
                    Overall Rank
                    {sortConfig.key === "overallRank" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>Player</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("posRank")}>
                    Pos Rank
                    {sortConfig.key === "posRank" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleSort(
                        scoringType === "PPR"
                          ? "averagePointsPPR"
                          : scoringType === "HALF_PPR"
                          ? "averagePointsHalfPPR"
                          : "averagePointsStandard"
                      )
                    }
                  >
                    PPG{" "}
                    <span className="text-xs text-gray-500 ml-1">(games)</span>
                    {sortConfig.key ===
                      (scoringType === "PPR"
                        ? "averagePointsPPR"
                        : scoringType === "HALF_PPR"
                        ? "averagePointsHalfPPR"
                        : "averagePointsStandard") &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleSort(
                        scoringType === "PPR"
                          ? "totalPointsPPR"
                          : scoringType === "HALF_PPR"
                          ? "totalPointsHalfPPR"
                          : "totalPointsStandard"
                      )
                    }
                  >
                    Total
                    {sortConfig.key ===
                      (scoringType === "PPR"
                        ? "totalPointsPPR"
                        : scoringType === "HALF_PPR"
                        ? "totalPointsHalfPPR"
                        : "totalPointsStandard") &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </Button>
                </TableHead>
                {Array.from({ length: currentWeek }, (_, i) => i + 1).map(
                  (week) => (
                    <TableHead key={week}>Week {week}</TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5 + currentWeek} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlayers.map((player) => (
                  <TableRow key={player.id || `${player.name}-${player.team}`}>
                    <TableCell className="font-medium">
                      {getOverallRank(player)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="relative w-10 h-10 overflow-hidden rounded-full">
                          <Avatar className="w-full h-full">
                            <AvatarImage
                              src={player?.headshot_url || "/placeholder.svg"}
                              alt={player?.name || "Player"}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {player?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-gray-500">
                            {player.team} ({player.position})
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {player.position}
                      {getPosRank(player)}
                    </TableCell>
                    <TableCell>
                      {getAveragePoints(player).toFixed(1)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({player.games})
                      </span>
                    </TableCell>
                    <TableCell>{getTotalPoints(player).toFixed(1)}</TableCell>
                    {player.weeklyStats.map((weekStats, index) => {
                      const points = getWeeklyPoints(weekStats);
                      const posRank = getWeeklyPosRank(weekStats);
                      return (
                        <TableCell
                          key={index}
                          className={`${getScoreColor(points)} p-0`}
                        >
                          {points !== null && points !== undefined ? (
                            <div className="p-2">
                              <div className="font-bold">
                                {points.toFixed(1)}
                              </div>
                              <div className="text-xs">
                                {player.position}
                                {posRank || "-"}
                              </div>
                              <div className="text-xs">
                                {weekStats.opponent}
                              </div>
                            </div>
                          ) : (
                            <div className="p-2">-</div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
