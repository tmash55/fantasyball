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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react";
import {
  fetchPlayerSeasonalStatsOnly,
  getCurrentNFLWeek,
  fetchNFLSchedule,
} from "@/libs/sleeper";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const BASE_URL = "https://api.sleeper.app/v1";

const fetchNFLScheduleFromDB = async () => {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase.from("nfl_schedule").select("*");

  if (error) {
    console.error("Error fetching NFL schedule:", error);
    return {};
  }

  const scheduleByWeek = data.reduce((acc, game) => {
    if (!acc[game.week]) {
      acc[game.week] = [];
    }
    acc[game.week].push(game);
    return acc;
  }, {});

  return scheduleByWeek;
};

const getCurrentNFLWeekFallback = async () => {
  const currentDate = new Date();
  const seasonStartDate = new Date(currentDate.getFullYear(), 8, 1);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceStart = Math.floor(
    (currentDate - seasonStartDate) / msPerWeek
  );
  return Math.min(Math.max(1, weeksSinceStart + 1), 18);
};

const WeekDataCell = ({ points, posRank, opponent, weekStats, week }) => {
  const getScoreColor = (points) => {
    if (points === null || points === undefined)
      return "bg-gray-200 text-gray-400";
    if (points >= 25) return "bg-green-500 text-white";
    if (points >= 20) return "bg-green-400 text-white";
    if (points >= 15) return "bg-green-300 text-black";
    if (points >= 10) return "bg-yellow-300 text-black";
    if (points >= 5) return "bg-orange-200 text-black";
    if (points > 0) return "bg-red-400 text-black";
    return "bg-red-500 text-white";
  };

  const formatStat = (value) =>
    value !== undefined && value !== null ? value : "-";

  const hasStats = (stats) =>
    Object.values(stats).some(
      (value) => value !== undefined && value !== null && value !== 0
    );

  const passingStats = {
    Yards: weekStats?.pass_yd,
    TDs: weekStats?.pass_td,
    "Comp/Att": `${weekStats?.pass_cmp || "-"}/${weekStats?.pass_att || "-"}`,
    "Comp %": weekStats?.cmp_pct,
    "Yards/Comp": weekStats?.pass_ypc,
    Rating: weekStats?.pass_rtg,
    INTs: weekStats?.pass_int,
    "1st Downs": weekStats?.pass_fd,
  };

  const rushingStats = {
    Yards: weekStats?.rush_yd,
    TDs: weekStats?.rush_td,
    Attempts: weekStats?.rush_att,
    "Yards/Att": weekStats?.rush_ypa,
    YAC: weekStats?.rush_yac,
    "1st Downs": weekStats?.rush_fd,
    "RZ Attempts": weekStats?.rush_rz_att,
  };

  const receivingStats = {
    Receptions: weekStats?.rec,
    Yards: weekStats?.rec_yd,
    TDs: weekStats?.rec_td,
    Targets: weekStats?.rec_tgt,
    "1st Downs": weekStats?.rec_fd,
    "RZ Targets": weekStats?.rec_rz_tgt,
  };

  const otherStats = {
    Fumbles: weekStats?.fum,
    "Off. Snaps": weekStats?.off_snp,
    "Team Off. Snaps": weekStats?.tm_off_snp,
  };

  const renderStatSection = (title, stats) => {
    if (!hasStats(stats)) return null;
    return (
      <div>
        <h4 className="font-bold mb-1">{title}</h4>
        {Object.entries(stats).map(([key, value]) => (
          <p key={key}>
            {key}: {formatStat(value)}
          </p>
        ))}
      </div>
    );
  };

  const tooltipContent = (
    <div className="space-y-2 text-xs">
      <h3 className="text-sm font-bold text-center">Week {week} Stats</h3>
      <div className="grid grid-cols-2 gap-2">
        {renderStatSection("Passing", passingStats)}
        {renderStatSection("Rushing", rushingStats)}
        {renderStatSection("Receiving", receivingStats)}
        {renderStatSection("Other", otherStats)}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${getScoreColor(
              points
            )} p-1 rounded-md text-center cursor-pointer`}
          >
            <div className="text-lg font-bold">
              {points !== null && points !== undefined
                ? points.toFixed(1)
                : "-"}
            </div>
            <div className="text-xs font-semibold">{posRank || "-"}</div>
            <div className="text-xs">{opponent || "-"}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-[400px] bg-base-200">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function SeasonLeaderboards() {
  const [players, setPlayers] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "totalPointsPPR",
    direction: "desc",
    week: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [scoringType, setScoringType] = useState("PPR");
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [nflSchedule, setNFLSchedule] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [startWeek, setStartWeek] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCurrentWeekAndPlayers = useCallback(async () => {
    try {
      let week;
      try {
        week = await getCurrentNFLWeek();
      } catch (error) {
        console.error("Error fetching current NFL week:", error);
        week = await getCurrentNFLWeekFallback();
      }
      setCurrentWeek(week);
      setStartWeek(Math.max(1, week - 3));
      const schedule = await fetchNFLScheduleFromDB();
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

  const handleSort = useCallback((key, week = null) => {
    setSortConfig((prevConfig) => ({
      key,
      week,
      direction:
        prevConfig.key === key &&
        prevConfig.week === week &&
        prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  }, []);

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

  const getOpponent = useCallback(
    (playerTeam, week) => {
      const weekSchedule = nflSchedule[week];
      if (!weekSchedule) return "-";

      const game = weekSchedule.find(
        (game) => game.home_team === playerTeam || game.away_team === playerTeam
      );

      if (!game) return "-";
      return playerTeam === game.home_team
        ? game.away_team
        : `@${game.home_team}`;
    },
    [nflSchedule]
  );

  const sortedPlayers = useMemo(() => {
    const sortableItems = [...players];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.week !== null) {
          aValue = getWeeklyPoints(a.weeklyStats[sortConfig.week - 1]) || 0;
          bValue = getWeeklyPoints(b.weeklyStats[sortConfig.week - 1]) || 0;
        } else if (
          sortConfig.key.startsWith("rank_") ||
          sortConfig.key.startsWith("pos_rank_")
        ) {
          aValue = a[sortConfig.key] || Infinity;
          bValue = b[sortConfig.key] || Infinity;
        } else {
          aValue = a[sortConfig.key] || 0;
          bValue = b[sortConfig.key] || 0;
        }
        if (aValue < bValue) {
          return sortConfig.direction === "desc" ? 1 : -1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "desc" ? -1 : 1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [players, sortConfig, getWeeklyPoints]);

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

  useEffect(() => {
    setSortConfig({
      key:
        scoringType === "PPR"
          ? "rank_ppr"
          : scoringType === "HALF_PPR"
          ? "rank_half_ppr"
          : "rank_std",
      direction: "asc",
      week: null,
    });
  }, [scoringType]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedPosition("All");
    setScoringType("PPR");
    setSortConfig({
      key: "rank_ppr",
      direction: "asc",
      week: null,
    });
    setShowAllWeeks(false);
    setStartWeek(Math.max(1, currentWeek - 3));
  };

  const toggleWeekDisplay = () => {
    setShowAllWeeks(!showAllWeeks);
    setStartWeek(Math.max(1, currentWeek - 3));
  };

  const handlePreviousWeeks = () => {
    setStartWeek(Math.max(1, startWeek - 4));
  };

  const handleNextWeeks = () => {
    setStartWeek(Math.min(currentWeek - 3, startWeek + 4));
  };

  const visibleWeeks = showAllWeeks
    ? Array.from({ length: currentWeek }, (_, i) => i + 1)
    : Array.from({ length: 4 }, (_, i) => i + startWeek).filter(
        (week) => week <= currentWeek
      );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Season Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <p className="text-muted-foreground">
            This leaderboard displays comprehensive statistics for NFL players
            across the season. It includes overall rankings, position-specific
            rankings, average points per game, total points, and weekly
            performance data.
          </p>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <p>
              Tip: Hover over a player&apos;s weekly score to view detailed
              stats for that week.
            </p>
          </div>
        </div>
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
            <SelectContent className="bg-base-200">
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
            <SelectContent className="bg-base-200">
              <SelectItem value="PPR">PPR</SelectItem>
              <SelectItem value="HALF_PPR">Half PPR</SelectItem>
              <SelectItem value="STD">Standard</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
        </div>
        {!isMobile && (
          <div className="flex justify-between items-center mb-2">
            <Button onClick={toggleWeekDisplay} variant="outline">
              {showAllWeeks ? "Show 4 Weeks" : "Show All Weeks"}
            </Button>
            {!showAllWeeks && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handlePreviousWeeks}
                  disabled={startWeek === 1}
                  variant="outline"
                  size="icon"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>
                  Weeks {startWeek} - {Math.min(startWeek + 3, currentWeek)}
                </span>
                <Button
                  onClick={handleNextWeeks}
                  disabled={startWeek + 3 >= currentWeek}
                  variant="outline"
                  size="icon"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead
                    className={`sticky left-0 bg-background z-20 w-[40px] ${
                      isMobile ? "px-1 text-xs" : "px-2"
                    }`}
                  >
                    <Button
                      variant="ghost"
                      onClick={() =>
                        handleSort(`rank_${scoringType.toLowerCase()}`)
                      }
                      className={`${
                        isMobile ? "px-0 text-xs" : "text-sm"
                      } w-full justify-start`}
                    >
                      {isMobile ? "Rank" : "Rank"}
                      {sortConfig.key ===
                        `rank_${scoringType.toLowerCase()}` && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? (
                            <ChevronUpIcon className="h-3 w-3 inline" />
                          ) : (
                            <ChevronDownIcon className="h-3 w-3 inline" />
                          )}
                        </span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead
                    className={`sticky left-[40px] bg-background z-20 ${
                      isMobile ? "px-1 text-xs" : "px-4"
                    }`}
                  >
                    Player
                  </TableHead>
                  <TableHead
                    className={`w-[80px] ${isMobile ? "px-1 text-xs" : "px-2"}`}
                  >
                    <Button
                      variant="ghost"
                      onClick={() =>
                        handleSort(`pos_rank_${scoringType.toLowerCase()}`)
                      }
                      className={`${
                        isMobile ? "px-0 text-xs" : "text-sm"
                      } w-full justify-start`}
                    >
                      {isMobile ? "Pos" : "Pos Rank"}
                      {sortConfig.key ===
                        `pos_rank_${scoringType.toLowerCase()}` &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUpIcon className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDownIcon className="h-3 w-3 ml-1" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead
                    className={`w-[80px] ${isMobile ? "px-1 text-xs" : "px-2"}`}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(`averagePoints${scoringType}`)}
                      className={`${
                        isMobile ? "px-0 text-xs" : "text-sm"
                      } w-full justify-start`}
                    >
                      PPG
                      {sortConfig.key === `averagePoints${scoringType}` &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUpIcon className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDownIcon className="h-3 w-3 ml-1" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead
                    className={`w-[80px] ${isMobile ? "px-1 text-xs" : "px-2"}`}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(`totalPoints${scoringType}`)}
                      className={`${
                        isMobile ? "px-0 text-xs" : "text-sm"
                      } w-full justify-start`}
                    >
                      Total
                      {sortConfig.key === `totalPoints${scoringType}` &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUpIcon className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDownIcon className="h-3 w-3 ml-1" />
                        ))}
                    </Button>
                  </TableHead>
                  {!isMobile &&
                    visibleWeeks.map((week) => (
                      <TableHead key={week} className="p-0 w-[60px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("weeklyPoints", week)}
                          className="w-full h-full justify-center text-xs p-1"
                        >
                          W{week}
                          {sortConfig.key === "weeklyPoints" &&
                            sortConfig.week === week && (
                              <span className="ml-1">
                                {sortConfig.direction === "asc" ? (
                                  <ChevronUpIcon className="h-3 w-3 inline" />
                                ) : (
                                  <ChevronDownIcon className="h-3 w-3 inline" />
                                )}
                              </span>
                            )}
                        </Button>
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5 + (isMobile ? 0 : visibleWeeks.length)}
                      className="text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => (
                    <TableRow
                      key={player.id || `${player.name}-${player.team}`}
                    >
                      <TableCell
                        className={`sticky left-0 bg-background z-10 font-medium ${
                          isMobile ? "px-1 text-xs" : "px-2"
                        }`}
                      >
                        {getOverallRank(player)}
                      </TableCell>
                      <TableCell
                        className={`sticky left-[40px] bg-background z-10 ${
                          isMobile ? "px-1" : "px-4"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {!isMobile && (
                            <div className="relative w-8 h-8 overflow-hidden rounded-full">
                              <Avatar className="w-full h-full">
                                <AvatarImage
                                  src={
                                    player?.headshot_url || "/placeholder.svg"
                                  }
                                  alt={player?.name || "Player"}
                                  className="object-cover"
                                />
                                <AvatarFallback>
                                  {player?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                          <div>
                            <div
                              className={`font-semibold ${
                                isMobile ? "text-xs" : "text-sm"
                              }`}
                            >
                              {player.name}
                            </div>
                            <div
                              className={`text-gray-500 ${
                                isMobile ? "text-xs" : "text-xs"
                              }`}
                            >
                              {player.team} ({player.position})
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`${
                          isMobile ? "px-1 text-xs" : "px-2 text-sm"
                        }`}
                      >
                        {player.position}
                        {getPosRank(player)}
                      </TableCell>
                      <TableCell
                        className={`${
                          isMobile ? "px-1 text-xs" : "px-2 text-sm"
                        }`}
                      >
                        {getAveragePoints(player).toFixed(1)}
                        <span className="text-xs text-gray-500 ml-1">
                          ({player.games})
                        </span>
                      </TableCell>
                      <TableCell
                        className={`${
                          isMobile ? "px-1 text-xs" : "px-2 text-sm"
                        }`}
                      >
                        {getTotalPoints(player).toFixed(1)}
                      </TableCell>
                      {!isMobile &&
                        visibleWeeks.map((week) => {
                          const weekStats = player.weeklyStats[week - 1];
                          const points = getWeeklyPoints(weekStats);
                          const posRank = getWeeklyPosRank(weekStats);
                          return (
                            <TableCell key={week} className="p-1 w-[60px]">
                              <WeekDataCell
                                points={points}
                                posRank={`${player.position}${posRank || "-"}`}
                                opponent={getOpponent(player.team, week)}
                                weekStats={weekStats}
                                week={week}
                              />
                            </TableCell>
                          );
                        })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
