"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  Search,
  Info,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { fetchWeekData } from "@/app/api/props/weeklyprops2";
import { fetchTouchdownData } from "@/app/api/props/td-props-week-1/route";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PlayerDetailsRow from "./PlayerDetailsRow";

const WeeklyFantasyProjections = () => {
  const [weekData, setWeekData] = useState([]);
  const [touchdownData, setTouchdownData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("2");
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "fantasy_points",
    direction: "descending",
  });
  const [scoringSettings, setScoringSettings] = useState({
    ppr: 1,
    passingTDPts: 4,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeekData(selectedWeek);
        const tdData = await fetchTouchdownData(selectedWeek);

        const combinedData = data.reduce((acc, player) => {
          const existingPlayer = acc.find(
            (p) => p.player_id === player.player_id
          );

          if (existingPlayer) {
            Object.keys(player).forEach((key) => {
              if (
                player[key] !== null &&
                player[key] !== "N/A" &&
                !existingPlayer[key]
              ) {
                existingPlayer[key] = player[key];
              }
            });
          } else {
            acc.push({ ...player });
          }

          return acc;
        }, []);

        const processedData = combinedData.map((player) => {
          if (
            player.receivingyardsou > 0 &&
            (player.receptionsou === null || player.receptionsou === "N/A")
          ) {
            player.receptionsou = 1;
          }

          const playerTouchdownData = tdData.find(
            (td) => td.player_id === player.player_id
          );

          if (playerTouchdownData) {
            player.anytime_td_odds = playerTouchdownData.anytime_td_odds;
          }

          return player;
        });

        setWeekData(processedData);
        setTouchdownData(tdData);
      } catch (err) {
        console.error("Error fetching weekly projections data:", err.message);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedWeek]);

  const parseOdds = (odds) => {
    if (typeof odds === "string") {
      // Trim any whitespace
      odds = odds.trim();

      // Check if the first character is a minus sign
      const isNegative = odds.charAt(0) === "−";
      console.log(isNegative);

      // Remove the minus sign if it exists
      if (isNegative) {
        odds = odds.substring(1);
      }

      // Parse the remaining string as a float
      const parsedValue = parseFloat(odds);

      // Return the parsed value multiplied by -1 if it was negative
      return isNegative ? -parsedValue : parsedValue;
    }

    return parseFloat(odds); // Return the number if it's already a number
  };
  const calculateTouchdownPoints = (oddsString) => {
    const tdOdds = parseOdds(oddsString);
    let touchdownImpliedProbability = 0;
    if (!isNaN(tdOdds)) {
      if (tdOdds < 0) {
        touchdownImpliedProbability =
          Math.abs(tdOdds) / (Math.abs(tdOdds) + 100);
      } else if (tdOdds > 0) {
        touchdownImpliedProbability = 100 / (tdOdds + 100);
      }
    }
    return (touchdownImpliedProbability * 6).toFixed(2);
  };
  const calculateImpliedProbability = (odds) => {
    const parsedOdds = parseOdds(odds);
    if (parsedOdds < 0) {
      return Math.abs(parsedOdds) / (Math.abs(parsedOdds) + 100);
    } else if (parsedOdds > 0) {
      return 100 / (parsedOdds + 100);
    }
    return 0;
  };

  const calculateFantasyPoints = useCallback(
    (player) => {
      // Safely parse numerical values or default to 0 if not valid
      const passingYards = parseFloat(player.passyardsou) || 0;
      const passingTDs = parseFloat(player.passtdsnumber) || 0;
      const interceptions = parseFloat(player.interceptions) || 0;
      const rushingYards = parseFloat(player.rushyardsou) || 0;
      const receivingYards = parseFloat(player.receivingyardsou) || 0;
      const receptions = parseFloat(player.receptionsou) || 0;
      const tdOdds = parseOdds(player.anytime_td_odds) || 0;

      // Calculate fantasy points components
      const passingYardsPoints = (passingYards / 25) * 1;
      // Calculate passing TD points using implied probability
      const passingTDImpliedProbability = calculateImpliedProbability(
        player.passtdsoverodds
      );
      const expectedPassingTDs =
        passingTDs * passingTDImpliedProbability +
        (passingTDs - 0.5) * (1 - passingTDImpliedProbability);
      const passingTDPoints = expectedPassingTDs * scoringSettings.passingTDPts;

      // Calculate interception points using implied probability
      const interceptionImpliedProbability = calculateImpliedProbability(
        player.interceptionsoverodds
      );
      const expectedInterceptions =
        interceptions * interceptionImpliedProbability +
        (interceptions - 0.5) * (1 - interceptionImpliedProbability);
      const interceptionPoints = expectedInterceptions * -2; // Negative points for interceptions

      const rushingYardsPoints = (rushingYards / 10) * 1;
      const receivingYardsPoints = (receivingYards / 10) * 1;
      const receptionsPoints = receptions * scoringSettings.ppr;

      // Calculate implied probability for anytime touchdown odds

      // Calculate expected touchdown points using implied probability

      const touchdownImpliedProbability = calculateImpliedProbability(
        player.anytime_td_odds
      );
      const touchdownPoints = touchdownImpliedProbability * 6;
      // Return total fantasy points
      return (
        passingYardsPoints +
        passingTDPoints -
        interceptionPoints +
        rushingYardsPoints +
        receivingYardsPoints +
        receptionsPoints +
        touchdownPoints
      ).toFixed(2);
    },
    [scoringSettings]
  );

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";
    setSortConfig({ key, direction });
  };

  const handleScoringChange = (setting, value) => {
    setScoringSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const togglePlayerDetails = (index) => {
    setSelectedPlayerIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const filteredAndSortedData = weekData
    .filter((player) => {
      const matchesPosition =
        selectedPosition === "All" ||
        player.nfl_players?.position === selectedPosition;
      const matchesTeam =
        selectedTeam === "All" || player.nfl_players?.team === selectedTeam;
      const matchesSearch =
        searchQuery === "" ||
        player.nfl_players?.player_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesPosition && matchesTeam && matchesSearch;
    })
    .sort((a, b) => {
      const aValue =
        sortConfig.key === "fantasy_points"
          ? parseFloat(calculateFantasyPoints(a))
          : parseFloat(a[sortConfig.key]) || 0;
      const bValue =
        sortConfig.key === "fantasy_points"
          ? parseFloat(calculateFantasyPoints(b))
          : parseFloat(b[sortConfig.key]) || 0;

      return sortConfig.direction === "ascending"
        ? aValue - bValue
        : bValue - aValue;
    })
    .map((player, index) => ({ ...player, rank: index + 1 }));

  const teams = Array.from(
    new Set(weekData.map((player) => player.nfl_players?.team).filter(Boolean))
  ).sort();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen text-gray-100 p-8"
    >
      <main className="space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold mb-2">
            Weekly Fantasy Projections
          </h2>
          <p className="text-gray-400 mb-4">
            Explore comprehensive NFL player projections for each week. Use the
            filters and sorting options to customize your view and gain valuable
            insights for your fantasy team.
          </p>
          <div className="flex items-center text-sm text-gray-400">
            <Info className="mr-2 h-4 w-4" />
            <span>Pro Tip: Click on a player to see detailed projections.</span>
          </div>
        </motion.div>

        <Card className="w-full bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold">Fantasy Projections</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={scoringSettings.ppr === 1 ? "secondary" : "outline"}
                  onClick={() => handleScoringChange("ppr", 1)}
                  className="text-white border-gray-600"
                >
                  PPR
                </Button>
                <Button
                  variant={
                    scoringSettings.ppr === 0.5 ? "secondary" : "outline"
                  }
                  onClick={() => handleScoringChange("ppr", 0.5)}
                  className="text-white border-gray-600"
                >
                  Half PPR
                </Button>
                <Button
                  variant={
                    scoringSettings.passingTDPts === 4 ? "secondary" : "outline"
                  }
                  onClick={() => handleScoringChange("passingTDPts", 4)}
                  className="text-white border-gray-600"
                >
                  4 Pt Pass TD
                </Button>
                <Button
                  variant={
                    scoringSettings.passingTDPts === 6 ? "secondary" : "outline"
                  }
                  onClick={() => handleScoringChange("passingTDPts", 6)}
                  className="text-white border-gray-600"
                >
                  6 Pt Pass TD
                </Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  {Array.from({ length: 18 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Week {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              <Select
                value={selectedPosition}
                onValueChange={setSelectedPosition}
              >
                <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  <SelectItem value="All">All</SelectItem>
                  {["QB", "RB", "WR", "TE"].map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  <SelectItem value="All">All</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border border-gray-700 overflow-hidden">
              <div className="w-full overflow-auto max-h-[calc(100vh-100px)]">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-gray-800">
                    <TableRow className="hover:bg-gray-700">
                      <TableHead className="w-[100px]">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Opponent</TableHead>
                      <TableHead
                        className="text-right cursor-pointer"
                        onClick={() => handleSort("fantasy_points")}
                      >
                        <div className="flex items-center justify-end">
                          Fantasy Points
                          <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            <div className="animate-pulse flex space-x-4">
                              <div className="flex-1 space-y-4 py-1">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-gray-700 rounded"></div>
                                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-4 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : filteredAndSortedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAndSortedData.map((player, index) => (
                          <React.Fragment key={player.player_id || index}>
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`hover:bg-gray-700 cursor-pointer ${
                                index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                              }`}
                              onClick={() => togglePlayerDetails(index)}
                            >
                              <TableCell className="font-medium">
                                {player.rank}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="relative w-10 h-10 overflow-hidden rounded-full">
                                    <Avatar className="w-full h-full">
                                      <AvatarImage
                                        src={
                                          player.nfl_players?.headshot_url ||
                                          "/placeholder.svg"
                                        }
                                        alt={
                                          player.nfl_players?.player_name ||
                                          "Player"
                                        }
                                        className="object-cover"
                                      />
                                      <AvatarFallback>
                                        {player.nfl_players?.player_name?.charAt(
                                          0
                                        ) || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {player.nfl_players?.player_name ||
                                        "Unknown"}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      <span
                                        className={`inline-block w-2 h-2 rounded-full mr-1 ${getPositionColor(
                                          player.nfl_players?.position
                                        )}`}
                                      ></span>
                                      {player.nfl_players?.team || "N/A"} -{" "}
                                      {player.nfl_players?.position || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{player.opponent || "N/A"}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary" className="text-lg">
                                  {calculateFantasyPoints(player)}
                                </Badge>
                              </TableCell>
                            </motion.tr>
                            {selectedPlayerIndex === index && (
                              <TableRow>
                                <TableCell colSpan={4}>
                                  <PlayerDetailsRow
                                    player={player}
                                    scoringSettings={scoringSettings}
                                    calculateImpliedProbability={
                                      calculateImpliedProbability
                                    }
                                    calculateTouchdownPoints={
                                      calculateTouchdownPoints
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </motion.div>
  );
};

export default WeeklyFantasyProjections;
