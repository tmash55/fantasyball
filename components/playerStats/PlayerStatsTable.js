"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpDown, Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentNFLWeek } from "@/libs/sleeper";

const PlayerStatsTable = () => {
  const [weekData, setWeekData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedStatType, setSelectedStatType] = useState("passing");
  const [sortConfig, setSortConfig] = useState({
    key: "passing_yards",
    direction: "descending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [teams, setTeams] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeWeek = async () => {
      try {
        const currentWeek = await getCurrentNFLWeek();
        setSelectedWeek(currentWeek.toString());
      } catch (err) {
        console.error("Error fetching current NFL week:", err);
        setSelectedWeek("1"); // Default to week 1 if there's an error
        setError("Failed to fetch current NFL week. Using default week 1.");
      }
    };

    initializeWeek();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedWeek) return; // Don't fetch if selectedWeek is not set yet

      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("player_weekly_stats")
          .select(
            `
            playerID,
            week,
            season,
            passing_yards,
            passing_touchdowns,
            interceptions,
            rushing_yards,
            rushing_touchdowns,
            receiving_yards,
            receiving_touchdowns,
            receptions,
            completions,
            carries,
            attempts,
            receiving_air_yards,
            receiving_yards_after_catch,
            targets,
            target_share,
            passing_air_yards,
            passing_epa,
            receiving_epa,
            rushing_epa,
            passing_yards_after_catch,
            air_yards_share,
            receiving_first_downs,
            passing_first_downs,
            nfl_players (
              player_name,
              position,
              team,
              headshot_url
            )
          `
          )
          .eq("week", selectedWeek);

        if (error) throw new Error(error.message);

        setWeekData(data || []);

        const uniqueTeams = [
          "All",
          ...new Set(
            (data || [])
              .map((player) => player.nfl_players?.team)
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b));
        setTeams(uniqueTeams);
      } catch (err) {
        console.error("Error fetching player stats data:", err.message);
        setWeekData([]);
        setTeams(["All"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedWeek]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  };

  const handleStatTypeChange = (statType) => {
    setSelectedStatType(statType);
    setSortConfig({
      key:
        statType === "rushing"
          ? "rushing_yards"
          : statType === "receiving"
          ? "receiving_yards"
          : "passing_yards",
      direction: "descending",
    });
  };

  const sortedAndFilteredData = useMemo(() => {
    return weekData
      .filter((player) => {
        const playerName = player.nfl_players?.player_name?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = playerName.includes(searchLower);
        const matchesTeam =
          selectedTeam === "All" || player.nfl_players?.team === selectedTeam;

        if (selectedStatType === "passing") {
          return (
            matchesSearch &&
            matchesTeam &&
            (player.passing_yards > 0 ||
              player.passing_touchdowns > 0 ||
              player.completions > 0 ||
              player.interceptions > 0)
          );
        }
        if (selectedStatType === "rushing") {
          return (
            matchesSearch &&
            matchesTeam &&
            (player.rushing_yards > 0 ||
              player.rushing_touchdowns > 0 ||
              player.carries > 0)
          );
        }
        if (selectedStatType === "receiving") {
          return (
            matchesSearch &&
            matchesTeam &&
            (player.receiving_yards > 0 ||
              player.receiving_touchdowns > 0 ||
              player.receptions > 0 ||
              player.targets > 0 ||
              player.receiving_air_yards > 0 ||
              player.receiving_yards_after_catch > 0 ||
              player.target_share > 0)
          );
        }
        return matchesSearch && matchesTeam;
      })
      .sort((a, b) => {
        const getDynamicValue = (player, key) => {
          if (key === "avg") {
            return player.carries > 0
              ? player.rushing_yards / player.carries
              : 0;
          }
          return parseFloat(player[key]) || 0;
        };

        if (sortConfig.key) {
          const aValue = getDynamicValue(a, sortConfig.key);
          const bValue = getDynamicValue(b, sortConfig.key);

          if (aValue < bValue)
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (aValue > bValue)
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }
        return 0;
      });
  }, [weekData, selectedStatType, sortConfig, searchTerm, selectedTeam]);

  const columns = {
    receiving: [
      {
        key: "rank",
        label: "Rank",
        sortable: false,
        tooltip: "Player's rank based on current sort",
      },
      {
        key: "player_name",
        label: "Name",
        sortable: false,
        tooltip: "Player's name",
      },
      {
        key: "position",
        label: "Pos",
        sortable: false,
        tooltip: "Player's position",
      },
      {
        key: "receptions",
        label: "Rec",
        sortable: true,
        tooltip: "Receptions",
      },
      { key: "targets", label: "Tgt", sortable: true, tooltip: "Targets" },
      {
        key: "receiving_air_yards",
        label: "AirY",
        sortable: true,
        tooltip: "Air yards",
      },
      {
        key: "receiving_yards",
        label: "Yds",
        sortable: true,
        tooltip: "Receiving yards",
      },
      {
        key: "receiving_touchdowns",
        label: "TD",
        sortable: true,
        tooltip: "Receiving touchdowns",
      },
      {
        key: "receiving_yards_after_catch",
        label: "YAC",
        sortable: true,
        tooltip: "Yards after catch",
      },
      {
        key: "target_share",
        label: "Tgt%",
        sortable: true,
        tooltip: "Target share",
      },
      {
        key: "air_yards_share",
        label: "AirY%",
        sortable: true,
        tooltip: "Air yards share",
      },
      {
        key: "receiving_first_downs",
        label: "1D",
        sortable: true,
        tooltip: "Receiving first downs",
      },
      {
        key: "receiving_epa",
        label: "EPA",
        sortable: true,
        tooltip: "Expected Points Added on receptions",
      },
    ],
    passing: [
      {
        key: "rank",
        label: "Rank",
        sortable: false,
        tooltip: "Player's rank based on current sort",
      },
      {
        key: "player_name",
        label: "Name",
        sortable: false,
        tooltip: "Player's name",
      },
      {
        key: "position",
        label: "Pos",
        sortable: false,
        tooltip: "Player's position",
      },
      {
        key: "completions",
        label: "Cmp",
        sortable: true,
        tooltip: "Completions",
      },
      {
        key: "attempts",
        label: "Att",
        sortable: true,
        tooltip: "Pass attempts",
      },
      {
        key: "passing_yards",
        label: "Yds",
        sortable: true,
        tooltip: "Passing yards",
      },
      {
        key: "passing_touchdowns",
        label: "TD",
        sortable: true,
        tooltip: "Passing touchdowns",
      },
      {
        key: "interceptions",
        label: "INT",
        sortable: true,
        tooltip: "Interceptions",
      },
      {
        key: "passing_air_yards",
        label: "AirY",
        sortable: true,
        tooltip: "Passing air yards",
      },
      {
        key: "passing_yards_after_catch",
        label: "YAC",
        sortable: true,
        tooltip: "Passing yards after catch",
      },
      {
        key: "passing_first_downs",
        label: "1D",
        sortable: true,
        tooltip: "Passing first downs",
      },
      {
        key: "passing_epa",
        label: "EPA",
        sortable: true,
        tooltip: "Expected Points Added on pass attempts",
      },
    ],
    rushing: [
      {
        key: "rank",
        label: "Rank",
        sortable: false,
        tooltip: "Player's rank based on current sort",
      },
      {
        key: "player_name",
        label: "Name",
        sortable: false,
        tooltip: "Player's name",
      },
      {
        key: "position",
        label: "Pos",
        sortable: false,
        tooltip: "Player's position",
      },
      { key: "carries", label: "Car", sortable: true, tooltip: "Carries" },
      {
        key: "rushing_yards",
        label: "Yds",
        sortable: true,
        tooltip: "Rushing yards",
      },
      {
        key: "avg",
        label: "Avg",
        sortable: true,
        tooltip: "Average yards per carry",
      },
      {
        key: "rushing_touchdowns",
        label: "TD",
        sortable: true,
        tooltip: "Rushing touchdowns",
      },
      {
        key: "rushing_epa",
        label: "EPA",
        sortable: true,
        tooltip: "Expected Points Added on rushing attempts",
      },
    ],
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

  return (
    <div className="min-h-screen text-gray-100 p-8">
      <main className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold mb-2">Weekly Player Stats</h2>
          <p className="text-gray-300 mb-4">
            Dive into comprehensive NFL player statistics. Use the filters and
            sorting options to customize your view and gain valuable insights
            for your fantasy team or analysis.
          </p>
          <div className="flex items-center text-sm text-gray-400">
            <Info className="mr-2 h-4 w-4" />
            <span>Pro Tip: Click on column headers to sort the data.</span>
          </div>
        </div>

        <Card className="w-full bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold">Weekly Stats</h2>
              <div className="flex flex-wrap gap-2">
                {["passing", "rushing", "receiving"].map((statType) => (
                  <Button
                    key={statType}
                    variant={
                      selectedStatType === statType ? "secondary" : "outline"
                    }
                    onClick={() => handleStatTypeChange(statType)}
                    className="text-white border-gray-700 text-sm"
                  >
                    {statType.charAt(0).toUpperCase() + statType.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[180px] bg-gray-700 text-white border-gray-600">
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 text-white border-gray-600"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[180px] bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
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
                      {columns[selectedStatType].map((column) => (
                        <TooltipProvider key={column.key}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <TableHead
                                key={column.key}
                                className={`${
                                  sortConfig.key === column.key
                                    ? "bg-gray-700"
                                    : ""
                                } ${
                                  column.sortable ? "cursor-pointer" : ""
                                } transition-colors duration-200 text-xs sm:text-sm whitespace-nowrap py-3 px-4${
                                  column.key === "player_name" ? "w-64" : ""
                                }`}
                                onClick={
                                  column.sortable
                                    ? () => handleSort(column.key)
                                    : undefined
                                }
                              >
                                <div className="flex items-center">
                                  {column.label}
                                  {column.sortable && (
                                    <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                                  )}
                                </div>
                              </TableHead>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="bg-gray-700 text-white"
                            >
                              {column.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns[selectedStatType].length}
                          className="text-center py-4"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : sortedAndFilteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns[selectedStatType].length}
                          className="text-center py-4"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence initial={false}>
                        {sortedAndFilteredData.map((player, index) => (
                          <motion.tr
                            key={player.playerID}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`hover:bg-gray-700 ${
                              index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                            }`}
                          >
                            {columns[selectedStatType].map((column) => (
                              <TableCell
                                key={column.key}
                                className={`${
                                  sortConfig.key === column.key
                                    ? "bg-gray-600"
                                    : ""
                                } transition-colors duration-200 text-xs sm:text-sm py-2 px-1 sm:px-3`}
                              >
                                {column.key === "rank" ? (
                                  index + 1
                                ) : column.key === "player_name" ? (
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
                                      <div className="text-xs text-gray-400">
                                        <span
                                          className={`inline-block w-2 h-2 rounded-full mr-1 ${getPositionColor(
                                            player.nfl_players?.position
                                          )}`}
                                        ></span>
                                        {player.nfl_players?.team || "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                ) : column.key === "position" ? (
                                  player.nfl_players?.position || "N/A"
                                ) : column.key === "avg" ? (
                                  player.carries > 0 ? (
                                    (
                                      player.rushing_yards / player.carries
                                    ).toFixed(2)
                                  ) : (
                                    "0.00"
                                  )
                                ) : column.key === "target_share" ||
                                  column.key === "air_yards_share" ? (
                                  `${((player[column.key] || 0) * 100).toFixed(
                                    1
                                  )}%`
                                ) : column.key.includes("epa") ? (
                                  (player[column.key] || 0).toFixed(2)
                                ) : (
                                  player[column.key] || 0
                                )}
                              </TableCell>
                            ))}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PlayerStatsTable;
