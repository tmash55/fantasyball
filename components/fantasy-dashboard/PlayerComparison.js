import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPlayerSeasonalStats, searchPlayers } from "@/libs/sleeper";
import {
  ChevronRight,
  ChevronLeft,
  SearchIcon,
  XCircleIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const scoringSystems = [
  { label: "Standard", value: "standard" },
  { label: "Half PPR", value: "halfPPR" },
  { label: "PPR", value: "PPR" },
];
import { motion } from "framer-motion";

const PlayerComparison = ({ leagueSettings }) => {
  const [searchTerm1, setSearchTerm1] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchResults1, setSearchResults1] = useState([]);
  const [searchResults2, setSearchResults2] = useState([]);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [comparisonData, setComparisonData] = useState({});
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [error, setError] = useState(null);
  const [scoringSystem, setScoringSystem] = useState("PPR");
  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);

  const handleSearch = useCallback(
    async (searchTerm, setResults, setIsLoading) => {
      if (searchTerm) {
        setIsLoading(true);
        try {
          const results = await searchPlayers(searchTerm);
          setResults(results);
        } catch (err) {
          console.error("Error searching players:", err);
          setError("An error occurred while searching for players.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    },
    []
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchTerm1, setSearchResults1, setIsLoading1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm1, handleSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchTerm2, setSearchResults2, setIsLoading2);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm2, handleSearch]);

  const handlePlayerSelect = useCallback(
    async (player, playerNumber) => {
      if (playerNumber === 1) {
        setPlayer1(player);
        setSearchTerm1(player.player_name);
        setSearchResults1([]);
      } else {
        setPlayer2(player);
        setSearchTerm2(player.player_name);
        setSearchResults2([]);
      }

      if (!comparisonData[player.player_id]) {
        try {
          const playerStats = await fetchPlayerSeasonalStats(
            [player.player_id],
            leagueSettings,
            scoringSystem
          );
          setComparisonData((prev) => ({
            ...prev,
            ...playerStats,
          }));
        } catch (err) {
          console.error("Error fetching player stats:", err);
          setError("An error occurred while fetching player stats.");
        }
      }
    },
    [comparisonData, leagueSettings, scoringSystem]
  );

  useEffect(() => {
    if (player1 && player2) {
      const fetchStats = async () => {
        try {
          const playerStats = await fetchPlayerSeasonalStats(
            [player1.player_id, player2.player_id],
            leagueSettings,
            scoringSystem
          );
          setComparisonData(playerStats);
        } catch (err) {
          console.error("Error fetching player stats:", err);
          setError("An error occurred while fetching player stats.");
        }
      };
      fetchStats();
    }
  }, [player1, player2, leagueSettings, scoringSystem]);

  const clearPlayer = (playerNumber) => {
    if (playerNumber === 1) {
      setPlayer1(null);
      setSearchTerm1("");
    } else {
      setPlayer2(null);
      setSearchTerm2("");
    }
  };

  const clearAllPlayers = () => {
    setPlayer1(null);
    setPlayer2(null);
    setSearchTerm1("");
    setSearchTerm2("");
    setComparisonData({});
  };

  const renderComparison = () => {
    if (!player1 || !player2) return null;

    const p1 = comparisonData[player1.player_id];
    const p2 = comparisonData[player2.player_id];

    if (!p1 || !p2) return null;

    const getRelevantStats = (p1, p2) => {
      const fantasyStats = [
        { label: "Fantasy Points", key: "totalPoints", toFixed: 2 },
        { label: "Fantasy Average", key: "averagePoints", toFixed: 2 },
      ];

      const seasonalStats = [{ label: "Games Played", key: "gamesPlayed" }];

      // Passing stats
      if (
        (p1.rawStats?.passingYards ?? 0) > 0 ||
        (p2.rawStats?.passingYards ?? 0) > 0
      ) {
        seasonalStats.push(
          { label: "Passing Yards", key: "passingYards" },
          { label: "Passing TDs", key: "passingTds" },
          { label: "Passing EPA", key: "passingEpa", toFixed: 2 },
          { label: "Passing First Downs", key: "passingFirstDowns" },
          { label: "Passing Air Yards", key: "passingAirYards" },
          { label: "Passing YAC", key: "passingYardsAfterCatch" },
          { label: "Pass Attempts", key: "attempts" },
          { label: "Completions", key: "completions" },
          { label: "Interceptions", key: "interceptions" },
          { label: "Sacks", key: "sacks" },
          { label: "Sack Yards", key: "sackYards" }
        );
      }

      // Rushing stats
      if (
        (p1.rawStats?.rushingYards ?? 0) > 0 ||
        (p2.rawStats?.rushingYards ?? 0) > 0
      ) {
        seasonalStats.push(
          { label: "Rushing Yards", key: "rushingYards" },
          { label: "Rushing TDs", key: "rushingTds" },
          { label: "Rushing EPA", key: "rushingEpa", toFixed: 2 },
          { label: "Rushing First Downs", key: "rushingFirstDowns" },
          { label: "Carries", key: "carries" }
        );
      }

      // Receiving stats
      if (
        (p1.rawStats?.receptions ?? 0) > 0 ||
        (p2.rawStats?.receptions ?? 0) > 0
      ) {
        seasonalStats.push(
          { label: "Receptions", key: "receptions" },
          { label: "Targets", key: "targets" },
          { label: "Receiving Yards", key: "receivingYards" },
          { label: "Receiving TDs", key: "receivingTds" },
          { label: "Receiving Air Yards", key: "receivingAirYards" },
          { label: "Receiving YAC", key: "receivingYardsAfterCatch" },
          { label: "Receiving First Downs", key: "receivingFirstDowns" },
          { label: "Receiving EPA", key: "receivingEpa", toFixed: 2 }
        );
      }

      // Advanced metrics
      if (
        (p1.rawStats?.receptions ?? 0) > 0 ||
        (p2.rawStats?.receptions ?? 0) > 0 ||
        (p1.rawStats?.targets ?? 0) > 0 ||
        (p2.rawStats?.targets ?? 0) > 0
      ) {
        seasonalStats.push(
          { label: "RACR", key: "racr", toFixed: 2 },
          { label: "Target Share", key: "tgtSh", toFixed: 2 },
          { label: "Air Yards Share", key: "aySh", toFixed: 2 },
          { label: "YAC Share", key: "yacSh", toFixed: 2 },
          { label: "WOPR", key: "woprY", toFixed: 2 },
          { label: "YPTMPA", key: "yptmpa", toFixed: 2 }
        );
      }

      return { fantasyStats, seasonalStats };
    };

    const { fantasyStats, seasonalStats } = getRelevantStats(p1, p2);

    const getPercentage = (value1, value2) => {
      const max = Math.max(value1 || 0, value2 || 0, 1);
      return ((value1 || 0) / max) * 100;
    };

    const renderPlayerInfo = (player, side) => (
      <div
        className={`flex items-center ${
          side === "left" ? "flex-row" : "flex-row-reverse"
        } w-full`}
      >
        <Avatar
          className={`h-12 w-12 sm:h-16 sm:w-16 ${
            side === "left" ? "mr-2 sm:mr-4" : "ml-2 sm:ml-4"
          }`}
        >
          <AvatarImage
            src={
              player.playerDetails?.headshot_url ||
              `https://sleepercdn.com/content/nfl/players/${player.id}.jpg`
            }
            alt={player.playerDetails?.name}
          />
          <AvatarFallback>
            {player.playerDetails?.name?.[0] || "P"}
          </AvatarFallback>
        </Avatar>
        <div className={`text-${side}`}>
          <h2 className="text-lg sm:text-2xl font-bold">
            {player.playerDetails?.name || "Unknown"}
          </h2>
          <p className="text-xs sm:text-lg text-muted-foreground">
            {player.playerDetails?.position || "N/A"} -{" "}
            {player.playerDetails?.team || "N/A"}
          </p>
        </div>
      </div>
    );

    const renderStatSection = (title, stats) => (
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">
          {title}
        </h3>
        {stats.map(({ label, key, toFixed }) => {
          const value1 = getValue(comparisonData[player1?.player_id], key);
          const value2 = getValue(comparisonData[player2?.player_id], key);
          const comparison =
            value1 === value2
              ? "equal"
              : value1 > value2
              ? "p1Higher"
              : "p2Higher";

          return (
            <motion.div
              key={key}
              className="flex items-center mb-2 sm:mb-3 text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-[30%] sm:w-[35%] text-right pr-2">
                <span
                  className={
                    comparison === "p1Higher"
                      ? "text-primary font-semibold"
                      : ""
                  }
                >
                  {formatValue(
                    comparisonData[player1?.player_id],
                    key,
                    toFixed
                  )}
                </span>
              </div>
              <div className="w-[40%] sm:w-[30%] px-2">
                <div className="relative h-12 sm:h-10 flex items-center justify-center rounded-full overflow-hidden">
                  <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-primary-foreground z-10 text-center px-1 leading-tight">
                    {label}
                  </span>
                  {comparison !== "equal" &&
                    (comparison === "p1Higher" ? (
                      <ChevronLeft
                        className="absolute left-1 sm:left-2 text-primary z-20 hidden sm:block"
                        size={16}
                      />
                    ) : (
                      <ChevronRight
                        className="absolute right-1 sm:right-2 text-primary z-20 hidden sm:block"
                        size={16}
                      />
                    ))}
                </div>
              </div>
              <div className="w-[30%] sm:w-[35%] pl-2">
                <span
                  className={
                    comparison === "p2Higher"
                      ? "text-primary font-semibold"
                      : ""
                  }
                >
                  {formatValue(
                    comparisonData[player2?.player_id],
                    key,
                    toFixed
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );

    const getValue = (player, key) => {
      if (
        key === "totalPoints" ||
        key === "averagePoints" ||
        key === "gamesPlayed"
      ) {
        return player[key] || 0;
      }
      return player.rawStats?.[key] || 0;
    };

    const formatValue = (player, key, toFixed) => {
      const value = getValue(player, key);
      return toFixed ? value.toFixed(toFixed) : value;
    };

    return (
      <Card className="mt-8 bg-background text-foreground">
        <CardHeader>
          <CardTitle className="text-xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
            Player Comparison
          </CardTitle>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {renderPlayerInfo(p1, "left")}
            {renderPlayerInfo(p2, "right")}
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-8">
          {renderStatSection("Fantasy Stats", fantasyStats)}
          {renderStatSection("Seasonal Stats", seasonalStats)}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="bg-background text-foreground p-4 max-w-7xl mx-auto">
      {error && (
        <div
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
        <Select value={scoringSystem} onValueChange={setScoringSystem}>
          <SelectTrigger className="w-full sm:w-[180px] ">
            <SelectValue placeholder="Select scoring system" />
          </SelectTrigger>
          <SelectContent className="bg-base-100">
            {scoringSystems.map((system) => (
              <SelectItem key={system.value} value={system.value}>
                {system.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={clearAllPlayers}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Clear All Players
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8">
        {/* Player 1 search input */}
        <div className="space-y-4 relative">
          <div className="relative">
            <Input
              placeholder="Search for player 1"
              value={searchTerm1}
              onChange={(e) => {
                setSearchTerm1(e.target.value);
                if (player1) setPlayer1(null);
              }}
              className={player1 ? "pr-20 bg-transparent" : "bg-base-300"}
            />
            {player1 && (
              <Button
                className="absolute right-0 top-0"
                variant="ghost"
                size="icon"
                onClick={() => clearPlayer(1)}
              >
                <XCircleIcon className="h-4 w-4" />
              </Button>
            )}
            {!player1 && (
              <Button
                className="absolute right-0 top-0"
                variant="ghost"
                size="icon"
                disabled={isLoading1}
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchResults1.length > 0 && !player1 && (
            <Card
              className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto"
              ref={dropdownRef1}
            >
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {searchResults1.map((player) => (
                    <li
                      key={player.player_id}
                      className="p-2 hover:bg-muted cursor-pointer"
                      onClick={() => handlePlayerSelect(player, 1)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage
                            src={`https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`}
                            alt={player.player_name}
                          />
                          <AvatarFallback>
                            {player.player_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {player.player_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.position} - {player.team}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-4 relative">
          <div className="relative">
            <Input
              placeholder="Search for player 2"
              value={searchTerm2}
              onChange={(e) => {
                setSearchTerm2(e.target.value);
                if (player2) setPlayer2(null);
              }}
              className={player2 ? "pr-20 bg-transparent" : "bg-base-300"}
            />
            {player2 && (
              <Button
                className="absolute right-0 top-0"
                variant="ghost"
                size="icon"
                onClick={() => clearPlayer(2)}
              >
                <XCircleIcon className="h-4 w-4" />
              </Button>
            )}
            {!player2 && (
              <Button
                className="absolute right-0 top-0"
                variant="ghost"
                size="icon"
                disabled={isLoading2}
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchResults2.length > 0 && !player2 && (
            <Card
              className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto"
              ref={dropdownRef2}
            >
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {searchResults2.map((player) => (
                    <li
                      key={player.player_id}
                      className="p-2 hover:bg-muted cursor-pointer"
                      onClick={() => handlePlayerSelect(player, 2)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage
                            src={`https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`}
                            alt={player.player_name}
                          />
                          <AvatarFallback>
                            {player.player_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {player.player_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.position} - {player.team}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {renderComparison()}
    </div>
  );
};

export default PlayerComparison;
