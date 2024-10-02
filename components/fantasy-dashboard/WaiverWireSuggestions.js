"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCwIcon,
  PercentIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { getCurrentNFLWeek, getPlayerInfo } from "@/libs/sleeper";

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

function getHalfPPR(stats) {
  return stats.pts_half_ppr || 0;
}

async function getSnapCountTrends() {
  try {
    const response = await axios.get("/api/snaps");
    return response.data;
  } catch (error) {
    console.error("Error fetching snap count trends:", error);
    return [];
  }
}

async function getUserLeagues() {
  try {
    const response = await axios.get("/api/user-leagues");
    return response.data;
  } catch (error) {
    console.error("Error fetching user leagues:", error);
    return [];
  }
}

function calculatePlayerScore(player) {
  const recentPerformance = player.lastWeekPoints || 0;
  const consistency = player.avgLast3 || 0;
  const popularity = player.count || 0;

  const weightRecent = 0.4;
  const weightConsistency = 0.3;
  const weightPopularity = 0.3;

  return (
    recentPerformance * weightRecent +
    consistency * weightConsistency +
    popularity * weightPopularity
  );
}

export default function WaiverWireSuggestions() {
  const [trendingAdds, setTrendingAdds] = useState([]);
  const [trendingDrops, setTrendingDrops] = useState([]);
  const [snapCountTrends, setSnapCountTrends] = useState([]);
  const [recommendedAdds, setRecommendedAdds] = useState([]);
  const [userLeagues, setUserLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("recommended");
  const [currentWeek, setCurrentWeek] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [addsResponse, dropsResponse, leagues] = await Promise.all([
        fetch(
          "https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=24&limit=25"
        ),
        fetch(
          "https://api.sleeper.app/v1/players/nfl/trending/drop?lookback_hours=24&limit=25"
        ),
        getUserLeagues(),
      ]);

      if (!addsResponse.ok || !dropsResponse.ok) {
        throw new Error("Failed to fetch trending players");
      }

      const addsData = await addsResponse.json();
      const dropsData = await dropsResponse.json();

      const week = await getCurrentNFLWeek();
      setCurrentWeek(week);
      const lastWeek = week - 1;
      const stats = await Promise.all([
        getPlayerStats(lastWeek),
        getPlayerStats(lastWeek - 1),
        getPlayerStats(lastWeek - 2),
      ]);

      const addPlayersWithInfo = await Promise.all(
        addsData.map(async (player) => {
          const info = await getPlayerInfo(player.player_id);
          const playerStats = stats.map(
            (weekStats) => weekStats[player.player_id] || {}
          );
          const avgLast3 =
            playerStats
              .map(getHalfPPR)
              .filter(Boolean)
              .reduce((sum, points) => sum + points, 0) /
              playerStats.filter(Boolean).length || 0;
          const lastWeekPoints = getHalfPPR(playerStats[0]);
          return { ...player, ...info, avgLast3, lastWeekPoints };
        })
      );

      const dropPlayersWithInfo = await Promise.all(
        dropsData.map(async (player) => {
          const info = await getPlayerInfo(player.player_id);
          const playerStats = stats.map(
            (weekStats) => weekStats[player.player_id] || {}
          );
          const avgLast3 =
            playerStats
              .map(getHalfPPR)
              .filter(Boolean)
              .reduce((sum, points) => sum + points, 0) /
              playerStats.filter(Boolean).length || 0;
          const lastWeekPoints = getHalfPPR(playerStats[0]);
          return { ...player, ...info, avgLast3, lastWeekPoints };
        })
      );

      const snapTrends = await getSnapCountTrends();

      setTrendingAdds(addPlayersWithInfo);
      setTrendingDrops(dropPlayersWithInfo);
      setSnapCountTrends(snapTrends);
      setUserLeagues(leagues);

      const recommended = addPlayersWithInfo
        .map((player) => ({
          ...player,
          score: calculatePlayerScore(player),
          availableLeagues: leagues.filter(
            (league) =>
              !league.rosters.some((roster) =>
                roster.players.includes(player.player_id)
              )
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setRecommendedAdds(recommended);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const tabOptions = [
    {
      value: "recommended",
      label: "Recommended Adds",
      icon: <ThumbsUpIcon className="h-5 w-5 text-blue-500" />,
    },
    {
      value: "adds",
      label: "Trending Adds",
      icon: <ArrowUpIcon className="h-5 w-5 text-green-500" />,
    },
    {
      value: "drops",
      label: "Trending Drops",
      icon: <ArrowDownIcon className="h-5 w-5 text-red-500" />,
    },
    {
      value: "snaps",
      label: "Snap Count Trends",
      icon: <PercentIcon className="h-5 w-5 text-blue-500" />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "recommended":
        return renderPlayerTable(recommendedAdds, "recommended");
      case "adds":
        return renderPlayerTable(trendingAdds, "adds");
      case "drops":
        return renderPlayerTable(trendingDrops, "drops");
      case "snaps":
        return renderSnapCountTable();
      default:
        return null;
    }
  };

  const renderPlayerTable = (players, type) => {
    return (
      <div className={isMobile ? "overflow-x-auto" : ""}>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className="w-[250px] text-gray-300">Player</TableHead>
              {!isMobile && (
                <>
                  <TableHead className="text-gray-300">
                    Points Last Week
                  </TableHead>
                  <TableHead className="text-gray-300">Avg Last 3</TableHead>
                </>
              )}
              <TableHead className="text-right text-gray-300">
                {type === "drops" ? "Drops" : "Adds"}
              </TableHead>
              {type === "recommended" && !isMobile && (
                <TableHead className="text-gray-300">Available In</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow
                key={player.player_id}
                className="border-b border-gray-700"
              >
                <TableCell className="py-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`}
                        alt={player.player_name}
                      />
                      <AvatarFallback>
                        {player.player_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-100">
                        {player.player_name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {player.team} - {player.position}
                      </div>
                      {isMobile && (
                        <div className="text-xs text-gray-400 mt-1">
                          Last: {player.lastWeekPoints?.toFixed(1) || "N/A"} |
                          Avg: {player.avgLast3?.toFixed(1) || "N/A"}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                {!isMobile && (
                  <>
                    <TableCell className="text-gray-100">
                      {typeof player.lastWeekPoints === "number"
                        ? player.lastWeekPoints.toFixed(1)
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-100">
                      {typeof player.avgLast3 === "number"
                        ? player.avgLast3.toFixed(1)
                        : "N/A"}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right text-gray-100">
                  {player.count}
                </TableCell>
                {type === "recommended" && !isMobile && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {player.availableLeagues.map((league) => (
                        <Badge
                          key={league.league_id}
                          variant="secondary"
                          className="bg-gray-700 text-gray-200"
                        >
                          {league.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderSnapCountTable = () => (
    <div className={isMobile ? "overflow-x-auto" : ""}>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-700">
            <TableHead className="w-[250px] text-gray-300">Player</TableHead>
            {!isMobile && (
              <>
                <TableHead className="text-gray-300">Last Week %</TableHead>
                <TableHead className="text-gray-300">Avg Last 3 %</TableHead>
              </>
            )}
            <TableHead className="text-right text-gray-300">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapCountTrends.map((player) => (
            <TableRow
              key={player.pfr_player_id}
              className="border-b border-gray-700"
            >
              <TableCell className="py-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://sleepercdn.com/content/nfl/players/${player.pfr_player_id}.jpg`}
                      alt={player.player}
                    />
                    <AvatarFallback>{player.player.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-100">
                      {player.player}
                    </div>
                    <div className="text-sm text-gray-400">
                      {player.team} - {player.player_position}
                    </div>
                    {isMobile && (
                      <div className="text-xs text-gray-400 mt-1">
                        Last: {(player.last_week_pct * 100).toFixed(1)}% | Avg:{" "}
                        {(player.avg_last_3_pct * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              {!isMobile && (
                <>
                  <TableCell className="text-gray-100">
                    {(player.last_week_pct * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-gray-100">
                    {(player.avg_last_3_pct * 100).toFixed(1)}%
                  </TableCell>
                </>
              )}
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  {player.pct_change >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      player.pct_change >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {Math.abs(player.pct_change * 100).toFixed(1)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const tabVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 },
  };

  const contentVariants = {
    enter: { opacity: 0, y: 10, position: "absolute" },
    center: { opacity: 1, y: 0, position: "absolute" },
    exit: { opacity: 0, y: -10, position: "absolute" },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Waiver Wire Suggestions</CardTitle>
        <CardDescription>
          Recommended adds, trending players, and snap count changes
          {currentWeek !== null && ` for Week ${currentWeek}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <>
            <div className="flex justify-end mb-4 text-base-200">
              <Button onClick={fetchData} disabled={isLoading}>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            {isLoading ? (
              <div className="text-center p-4">Loading data...</div>
            ) : (
              <>
                {isMobile ? (
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full mb-4">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-base-100">
                      {tabOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                      {tabOptions.map((option) => (
                        <TabsTrigger
                          key={option.value}
                          value={option.value}
                          className="flex items-center justify-center transition-all duration-200 ease-in-out"
                        >
                          <motion.div
                            variants={{
                              inactive: { scale: 1, opacity: 0.7 },
                              active: { scale: 1.05, opacity: 1 },
                            }}
                            initial="inactive"
                            animate={
                              activeTab === option.value ? "active" : "inactive"
                            }
                            whileHover="active"
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center"
                          >
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </motion.div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}
                <div className="relative" style={{ minHeight: "400px" }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      variants={{
                        enter: { opacity: 0, y: 10, position: "absolute" },
                        center: { opacity: 1, y: 0, position: "absolute" },
                        exit: { opacity: 0, y: -10, position: "absolute" },
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="w-full h-full overflow-auto"
                    >
                      {renderTabContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
