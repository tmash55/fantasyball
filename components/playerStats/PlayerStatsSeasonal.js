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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpDown, Search, Info } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PlayerStatsSeasonal = () => {
  const [seasonData, setSeasonData] = useState([]);
  const [selectedStatType, setSelectedStatType] = useState("passing");
  const [sortConfig, setSortConfig] = useState({
    key: "passing_yards",
    direction: "descending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("player_seasonal_stats")
          .select(`
            player_id,
            season,
            passing_yards,
            passing_tds,
            interceptions,
            rushing_yards,
            rushing_tds,
            receiving_yards,
            receiving_tds,
            receptions,
            completions,
            carries,
            attempts,
            receiving_air_yards,
            receiving_yards_after_catch,
            targets,
            target_share,
            tgt_sh,
            passing_air_yards,
            passing_epa,
            receiving_epa,
            rushing_epa,
            passing_yards_after_catch,
            air_yards_share,
            receiving_first_downs,
            passing_first_downs,
            games,
            sacks,
            sack_yards,
            pacr,
            racr,
            wopr_x,
            dom,
            ry_sh,
            nfl_players (
              player_name,
              position,
              team,
              headshot_url
            )
          `);

        if (error) throw new Error(error.message);

        setSeasonData(data);
      } catch (err) {
        console.error(
          "Error fetching player seasonal stats data:",
          err.message
        );
      }
    };

    fetchData();
  }, []);

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
      key: `${statType}_yards`,
      direction: "descending",
    });
  };

  const teams = useMemo(() => {
    const teamSet = new Set(
      seasonData.map((player) => player.nfl_players?.team).filter(Boolean)
    );
    return ["All", ...Array.from(teamSet).sort((a, b) => a.localeCompare(b))];
  }, [seasonData]);

  const sortedAndFilteredData = useMemo(() => {
    const filteredData = seasonData.filter((player) => {
      const playerName = player.nfl_players?.player_name?.toLowerCase() || "";
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = playerName.includes(searchLower);
      const matchesTeam =
        selectedTeam === "All" || player.nfl_players?.team === selectedTeam;

      if (selectedStatType === "receiving") {
        return (
          matchesSearch &&
          matchesTeam &&
          (player.receiving_yards > 0 ||
            player.receiving_tds > 0 ||
            player.receptions > 0 ||
            player.targets > 0)
        );
      }
      if (selectedStatType === "passing") {
        return (
          matchesSearch &&
          matchesTeam &&
          (player.passing_yards > 0 ||
            player.passing_tds > 0 ||
            player.attempts > 0 ||
            player.interceptions > 0)
        );
      }
      if (selectedStatType === "rushing") {
        return (
          matchesSearch &&
          matchesTeam &&
          (player.rushing_yards > 0 ||
            player.rushing_tds > 0 ||
            player.carries > 0)
        );
      }
      return matchesSearch && matchesTeam;
    });

    const sortedData = filteredData
      .map((player) => ({
        ...player,
        avg_yards_per_reception:
          player.receptions > 0
            ? player.receiving_yards / player.receptions
            : 0,
        yards_per_game:
          player.games > 0
            ? player[`${selectedStatType}_yards`] / player.games
            : 0,
        avg_yards_per_carry:
          player.carries > 0 ? player.rushing_yards / player.carries : 0,
      }))
      .sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "number" && typeof bValue === "number") {
          if (aValue < bValue)
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (aValue > bValue)
            return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });

    return sortedData.map((player, index) => ({
      ...player,
      rank:
        sortConfig.direction === "descending"
          ? index + 1
          : sortedData.length - index,
    }));
  }, [seasonData, selectedStatType, sortConfig, searchTerm, selectedTeam]);

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
      { key: "games", label: "G", sortable: true, tooltip: "Games played" },
      {
        key: "receptions",
        label: "Rec",
        sortable: true,
        tooltip: "Receptions",
      },
      { key: "targets", label: "Tgt", sortable: true, tooltip: "Targets" },
      {
        key: "receiving_yards",
        label: "Yds",
        sortable: true,
        tooltip: "Receiving yards",
      },
      {
        key: "avg_yards_per_reception",
        label: "Y/R",
        sortable: true,
        tooltip: "Yards per reception",
      },
      {
        key: "receiving_tds",
        label: "TD",
        sortable: true,
        tooltip: "Receiving touchdowns",
      },
      {
        key: "yards_per_game",
        label: "Y/G",
        sortable: true,
        tooltip: "Receiving yards per game",
      },
      {
        key: "receiving_yards_after_catch",
        label: "YAC",
        sortable: true,
        tooltip: "Yards after catch",
      },
      {
        key: "tgt_sh",
        label: "Tgt%",
        sortable: true,
        tooltip: "Target share",
      },
      {
        key: "ry_sh",
        label: "Yds%",
        sortable: true,
        tooltip: "Receiving yards share",
      },
      { key: "dom", label: "DOM", sortable: true, tooltip: "Dominator Rating" },
      {
        key: "wopr_x",
        label: "WOPR",
        sortable: true,
        tooltip: "Weighted Opportunity Rating",
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
      {
        key: "racr",
        label: "RACR",
        sortable: true,
        tooltip: "Receiver Air Conversion Ratio",
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
      { key: "games", label: "G", sortable: true, tooltip: "Games played" },
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
        key: "passing_tds",
        label: "TD",
        sortable: true,
        tooltip: "Passing touchdowns",
      },
      {
        key: "interceptions",
        label: "INT",
        sortable: true,
        tooltip: "Interceptions thrown",
      },
      {
        key: "yards_per_game",
        label: "Y/G",
        sortable: true,
        tooltip: "Passing yards per game",
      },
      {
        key: "passing_air_yards",
        label: "AirY",
        sortable: true,
        tooltip: "Air yards on completions",
      },
      {
        key: "passing_yards_after_catch",
        label: "YAC",
        sortable: true,
        tooltip: "Yards after catch on completions",
      },
      { key: "sacks", label: "Sck", sortable: true, tooltip: "Times sacked" },
      {
        key: "sack_yards",
        label: "SckY",
        sortable: true,
        tooltip: "Yards lost on sacks",
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
      {
        key: "pacr",
        label: "PACR",
        sortable: true,
        tooltip: "Passing Air Conversion Ratio",
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
      { key: "games", label: "G", sortable: true, tooltip: "Games played" },
      {
        key: "carries",
        label: "Car",
        sortable: true,
        tooltip: "Rushing attempts",
      },
      {
        key: "rushing_yards",
        label: "Yds",
        sortable: true,
        tooltip: "Rushing yards",
      },
      {
        key: "avg_yards_per_carry",
        label: "Y/C",
        sortable: true,
        tooltip: "Average yards per carry",
      },
      {
        key: "rushing_tds",
        label: "TD",
        sortable: true,
        tooltip: "Rushing touchdowns",
      },
      {
        key: "yards_per_game",
        label: "Y/G",
        sortable: true,
        tooltip: "Rushing yards per game",
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
          <h2 className="text-4xl font-bold mb-2">Seasonal Player Stats</h2>
          <p className="text-gray-400 mb-4">
            Explore comprehensive NFL player statistics for the entire season.
            Use the filters and sorting options to customize your view and gain
            valuable insights.
          </p>
          <div className="flex items-center text-sm text-gray-400">
            <Info className="mr-2 h-4 w-4" />
            <span>Pro Tip: Click on column headers to sort the data.</span>
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
                <h2 className="text-2xl font-bold">Season Stats</h2>
                <div className="flex flex-wrap gap-2">
                  {["passing", "rushing", "receiving"].map((statType) => (
                    <motion.div
                      key={statType}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={
                          selectedStatType === statType
                            ? "secondary"
                            : "outline"
                        }
                        onClick={() => handleStatTypeChange(statType)}
                        className="text-white border-gray-700 text-sm"
                      >
                        {statType.charAt(0).toUpperCase() + statType.slice(1)}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600">
                    {teams.map((team) => (
                      <SelectItem
                        key={team}
                        value={team}
                        className="focus:bg-gray-600"
                      >
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
                                  className={`${
                                    sortConfig.key === column.key
                                      ? "bg-gray-700"
                                      : ""
                                  } ${
                                    column.sortable ? "cursor-pointer" : ""
                                  } transition-colors duration-200 text-xs sm:text-sm whitespace-nowrap ${
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
                      <AnimatePresence>
                        {sortedAndFilteredData.map((player, index) => (
                          <motion.tr
                            key={player.player_id}
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
                                } transition-colors duration-200 text-xs sm:text-sm py-2 px-1 sm:px-3 ${
                                  column.key === "player_name" ? "w-64" : ""
                                }`}
                              >
                                {column.key === "player_name" ? (
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10">
                                      <Avatar className="w-10 h-10">
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
                                    <div className="flex-grow min-w-0">
                                      <div className="font-medium truncate">
                                        {player.nfl_players?.player_name ||
                                          "Unknown"}
                                      </div>
                                      <div className="text-xs text-gray-400 flex items-center">
                                        <span
                                          className={`inline-block w-2 h-2 rounded-full mr-1 ${getPositionColor(
                                            player.nfl_players?.position
                                          )}`}
                                        ></span>
                                        <span className="truncate">
                                          {player.nfl_players?.team || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : column.key === "position" ? (
                                  player.nfl_players?.position || "N/A"
                                ) : column.key === "avg_yards_per_reception" ||
                                  column.key === "yards_per_game" ||
                                  column.key === "dom" ||
                                  column.key === "wopr_x" ||
                                  column.key === "receiving_epa" ||
                                  column.key === "racr" ||
                                  column.key === "passing_epa" ||
                                  column.key === "pacr" ||
                                  column.key === "rushing_epa" ||
                                  column.key === "avg_yards_per_carry" ? (
                                  (player[column.key] || 0).toFixed(2)
                                ) : column.key === "tgt_sh" ||
                                  column.key === "ry_sh" ? (
                                  `${((player[column.key] || 0) * 100).toFixed(
                                    1
                                  )}%`
                                ) : (
                                  player[column.key]
                                )}
                              </TableCell>
                            ))}
                          </motion.tr>
                        ))}
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

export default PlayerStatsSeasonal;
