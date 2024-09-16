"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTouchdownData } from "@/app/api/props/td-props-week-1/route";
import { MostRecentDateTD } from "@/utils/MostRecentDateTD";
import { RefreshCcw, Search, Info, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const WeekTds = () => {
  const [tdPropsData, setTdPropsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [mostRecentDate, setMostRecentDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "game_date",
    direction: "asc",
  });
  const [selectedWeek, setSelectedWeek] = useState("2");
  const [showCompletedGames, setShowCompletedGames] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
  const [selectedPosition, setSelectedPosition] = useState([]);
  const [selectedGame, setSelectedGame] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchTouchdownData(selectedWeek);
        if (!data || data.length === 0) {
          console.error("No data fetched or data is empty.");
          setFilteredData([]);
          return;
        }
        setTdPropsData(data);
        setFilteredData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedWeek]);

  useEffect(() => {
    const fetchMostRecentDate = async () => {
      const date = await MostRecentDateTD();
      setMostRecentDate(date);
    };
    fetchMostRecentDate();
  }, []);

  const applyFiltersAndSort = useCallback(
    (data) => {
      const filtered = data.filter((player) => {
        const matchesSearchQuery =
          debouncedSearchQuery === "" ||
          player.player_name
            ?.toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          player.name
            ?.toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase());

        const matchesPosition =
          selectedPosition.length === 0 ||
          selectedPosition.includes(player.position) ||
          (player.nfl_players?.position &&
            selectedPosition.includes(player.nfl_players.position)) ||
          (player.position === "DEF" && selectedPosition.includes("DEF")) ||
          (player.nfl_players?.position === "DEF" &&
            selectedPosition.includes("DEF"));

        const matchesGame =
          selectedGame.length === 0 || selectedGame.includes(player.game);
        const matchesTeam =
          selectedTeam.length === 0 || selectedTeam.includes(player.team);
        const matchesCompleted =
          !showCompletedGames || player.is_completed === 1;

        return (
          matchesSearchQuery &&
          matchesPosition &&
          matchesGame &&
          matchesTeam &&
          matchesCompleted
        );
      });

      const sortedData = filtered
        .filter((player) => player[sortConfig.key] !== "N/A")
        .sort((a, b) => {
          if (a[sortConfig.key] === null) return 1;
          if (b[sortConfig.key] === null) return -1;
          if (a[sortConfig.key] === b[sortConfig.key]) return 0;

          const aNum = parseFloat(a[sortConfig.key].replace(/[^\d.-]/g, ""));
          const bNum = parseFloat(b[sortConfig.key].replace(/[^\d.-]/g, ""));

          if (!isNaN(aNum) && !isNaN(bNum)) {
            if (sortConfig.direction === "asc") {
              if (aNum < 0 && bNum >= 0) return -1;
              if (aNum >= 0 && bNum < 0) return 1;
              return aNum - bNum;
            } else {
              if (aNum < 0 && bNum >= 0) return 1;
              if (aNum >= 0 && bNum < 0) return -1;
              return bNum - aNum;
            }
          }

          if (sortConfig.key === "game_date") {
            const aDate = new Date(a[sortConfig.key]);
            const bDate = new Date(b[sortConfig.key]);
            return sortConfig.direction === "asc"
              ? aDate - bDate
              : bDate - aDate;
          }

          return sortConfig.direction === "asc"
            ? a[sortConfig.key].localeCompare(b[sortConfig.key])
            : b[sortConfig.key].localeCompare(a[sortConfig.key]);
        });

      setFilteredData(sortedData);
    },
    [
      debouncedSearchQuery,
      selectedPosition,
      selectedGame,
      selectedTeam,
      showCompletedGames,
      sortConfig,
    ]
  );

  useEffect(() => {
    applyFiltersAndSort(tdPropsData);
  }, [
    debouncedSearchQuery,
    selectedPosition,
    selectedGame,
    selectedTeam,
    tdPropsData,
    showCompletedGames,
    sortConfig,
    applyFiltersAndSort,
  ]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedPosition([]);
    setSelectedGame([]);
    setSelectedTeam([]);
    setSortConfig({ key: "game_date", direction: "asc" });
    setShowCompletedGames(false);
  };

  const handleWeekChange = (week) => {
    setSelectedWeek(week);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center py-4 text-red-500">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-4xl font-bold mb-2">Weekly TD Props</h2>
          <p className="text-gray-400 mb-4">
            Explore comprehensive NFL touchdown prop statistics for each week.
            Use the filters and sorting options to customize your view and gain
            valuable insights.
          </p>
          <div className="flex items-center text-sm text-gray-400">
            <Info className="mr-2 h-4 w-4" />
            <span>Last updated: {mostRecentDate}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="w-full bg-gray-800 border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">TD Props</h2>
                <Select value={selectedWeek} onValueChange={handleWeekChange}>
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
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                  value={selectedPosition.join(",")}
                  onValueChange={(value) =>
                    setSelectedPosition(value.split(",").filter(Boolean))
                  }
                >
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600">
                    {["QB", "RB", "WR", "TE", "DEF"].map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedTeam.join(",")}
                  onValueChange={(value) =>
                    setSelectedTeam(value.split(",").filter(Boolean))
                  }
                >
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600">
                    {Array.from(
                      new Set(tdPropsData.map((player) => player.team))
                    )
                      .filter(Boolean)
                      .sort()
                      .map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
              <div className="rounded-md border border-gray-700 overflow-hidden">
                <div className="w-full overflow-auto max-h-[calc(100vh-100px)]">
                  <Table>
                    <TableHeader className="sticky top-0 z-20 bg-gray-800">
                      <TableRow className="hover:bg-gray-700">
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("player_name")}
                        >
                          <div className="flex items-center">
                            Player
                            <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("first_td_odds")}
                        >
                          <div className="flex items-center">
                            First TD Odds
                            <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("anytime_td_odds")}
                        >
                          <div className="flex items-center">
                            Anytime TD Odds
                            <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("two_plus_td_odds")}
                        >
                          <div className="flex items-center">
                            2+ TD Odds
                            <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredData.map((player, index) => {
                          const displayName =
                            player.player_name || player.name || "Unknown";
                          const hideTeamAndPosition =
                            displayName.includes("No Touchdown Scorer") ||
                            displayName.includes("D/ST");
                          const displayTeam = hideTeamAndPosition
                            ? ""
                            : player.team || "Unknown";
                          const displayPosition = hideTeamAndPosition
                            ? ""
                            : player.position || "Unknown";
                          const displayGame = player.game || "Unknown";
                          const displayFirstTdOdds =
                            player.first_td_odds || "N/A";
                          const displayAnytimeTdOdds =
                            player.anytime_td_odds || "N/A";
                          const displayTwoPlusTdOdds =
                            player.two_plus_td_odds || "N/A";

                          return (
                            <motion.tr
                              key={player.player_id || index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`hover:bg-gray-700 ${
                                index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                              }`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0 w-10 h-10">
                                    <Avatar className="w-10 h-10">
                                      <AvatarImage
                                        src={
                                          player.nfl_players?.headshot_url ||
                                          "/placeholder.svg"
                                        }
                                        alt={displayName}
                                        className="object-cover"
                                      />
                                      <AvatarFallback>
                                        {displayName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <div className="font-medium truncate">
                                      {displayName}
                                    </div>
                                    {!hideTeamAndPosition && (
                                      <div className="text-xs text-gray-400 flex items-center">
                                        <span
                                          className={`inline-block w-2 h-2 rounded-full mr-1 ${getPositionColor(
                                            displayPosition
                                          )}`}
                                        ></span>
                                        <span className="truncate">
                                          {displayPosition} - {displayTeam}
                                        </span>
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-400">
                                      {displayGame}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-sm">
                                  {displayFirstTdOdds}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-sm">
                                  {displayAnytimeTdOdds}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-sm">
                                  {displayTwoPlusTdOdds}
                                </Badge>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default WeekTds;
