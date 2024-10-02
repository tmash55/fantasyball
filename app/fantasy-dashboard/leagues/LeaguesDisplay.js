"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Trophy, Target } from "lucide-react";
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
import ExpandedLeagueView from "@/components/fantasy-dashboard/ExpandedLeagueView";
import { fetchUserLeaguesAndDetails } from "@/libs/sleeper";

const LeaguesDisplay = ({ initialLeagues, username }) => {
  const categorizeLeagues = useCallback((leagues) => {
    return leagues.reduce(
      (acc, league) => {
        const leagueType = league.settings.type || 0;
        switch (leagueType) {
          case 0:
            acc.redraft.push(league);
            break;
          case 1:
            acc.keeper.push(league);
            break;
          case 2:
            acc.dynasty.push(league);
            break;
          default:
            console.warn(`Unknown league type: ${leagueType}`);
            acc.redraft.push(league);
        }
        return acc;
      },
      { redraft: [], dynasty: [], keeper: [] }
    );
  }, []);

  const [leagues, setLeagues] = useState(() =>
    categorizeLeagues(initialLeagues)
  );
  const [expandedLeague, setExpandedLeague] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const years = [2024, 2023, 2022, 2021, 2020];
  const topRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchLeaguesForYear = async () => {
      setLoading(true);
      try {
        const leaguesData = await fetchUserLeaguesAndDetails(
          username,
          selectedYear
        );
        setLeagues(categorizeLeagues(leaguesData));
      } catch (error) {
        console.error("Error fetching leagues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaguesForYear();
  }, [username, selectedYear, categorizeLeagues]);

  useEffect(() => {
    if (expandedLeague && topRef.current) {
      const yOffset = -60; // Adjust this value based on your layout (e.g., fixed header height)
      const y =
        topRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [expandedLeague]);

  const handleYearChange = (year) => {
    setSelectedYear(parseInt(year));
    setExpandedLeague(null);
  };

  const handleLeagueClick = useCallback((league) => {
    setExpandedLeague(league);
  }, []);

  const handleBackClick = useCallback(() => {
    setExpandedLeague(null);
  }, []);

  const renderLeagueCards = (leagueList, title) => {
    if (leagueList.length === 0) return null;

    return (
      <div className="mb-8" key={title}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagueList.map((league, index) => (
            <motion.div
              key={league.league_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 overflow-hidden"
                onClick={() => handleLeagueClick(league)}
              >
                <CardHeader className="relative pb-2">
                  <div className="absolute top-2 right-2">
                    <Trophy className="h-5 w-5 text-primary/60" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary pr-6">
                    {league.name || "Unnamed League"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <LeagueInfoItem
                      label="League Size"
                      value={league.total_rosters || "Unknown"}
                    />
                    <LeagueInfoItem
                      label="Scoring"
                      value={getScoringFormat(league.scoring_settings)}
                    />
                    <LeagueInfoItem
                      label="Type"
                      value={
                        league.settings.type === 0
                          ? "Redraft"
                          : league.settings.type === 1
                          ? "Keeper"
                          : "Dynasty"
                      }
                    />
                    <LeagueInfoItem
                      label="Starting Positions"
                      value={
                        league.roster_positions
                          ? league.roster_positions.filter(
                              (pos) => pos !== "BN"
                            ).length
                          : "Unknown"
                      }
                    />
                    <LeagueInfoItem
                      label="Current Leader(s)"
                      value={getCurrentLeaders(league)}
                      tooltip={getCurrentLeadersDetails(league)}
                    />
                    <LeagueInfoItem
                      label="Your Record"
                      value={getUserRecord(league)}
                    />
                  </div>
                  <div className="mt-4 pt-2 border-t border-primary/20">
                    <PlayoffChance chance={calculatePlayoffChance(league)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const getCurrentLeaders = (league) => {
    if (!league.rosters || league.rosters.length === 0) return "Unknown";
    const maxWins = Math.max(
      ...league.rosters.map((roster) => roster.settings?.wins || 0)
    );
    const leaders = league.rosters.filter(
      (roster) => (roster.settings?.wins || 0) === maxWins
    );
    if (leaders.length === 0) return "Unknown";
    return leaders.length > 1
      ? `${leaders.length} tied`
      : leaders[0].username || "Unknown User";
  };

  const getCurrentLeadersDetails = (league) => {
    if (!league.rosters || league.rosters.length === 0) return "Unknown";
    const maxWins = Math.max(
      ...league.rosters.map((roster) => roster.settings?.wins || 0)
    );
    const leaders = league.rosters.filter(
      (roster) => (roster.settings?.wins || 0) === maxWins
    );
    if (leaders.length === 0) return "Unknown";
    const leaderNames = leaders
      .map((leader) => leader.username || "Unknown User")
      .join(", ");
    return `${leaderNames} (${maxWins} Wins)`;
  };

  const getScoringFormat = (scoringSettings) => {
    if (!scoringSettings) return "Unknown";
    const rec = scoringSettings.rec || 0;
    const bonusRecTe = scoringSettings.bonus_rec_te || 0;
    if (rec === 1) {
      return bonusRecTe > 0 ? `PPR TEP (+${bonusRecTe})` : "PPR";
    } else if (rec === 0.5) {
      return bonusRecTe > 0 ? `Half PPR TEP (+${bonusRecTe})` : "Half PPR";
    } else if (rec === 0) {
      return bonusRecTe > 0 ? `Standard TEP (+${bonusRecTe})` : "Standard";
    }
    return "Custom";
  };

  const getUserRecord = (league) => {
    if (league.userRoster && league.userRoster.settings) {
      const wins = league.userRoster.settings.wins || 0;
      const losses = league.userRoster.settings.losses || 0;
      const ties = league.userRoster.settings.ties || 0;
      return `${wins}-${losses}${ties ? `-${ties}` : ""}`;
    }
    return "N/A";
  };

  const calculatePlayoffChance = (league) => {
    if (!league.userRoster || !league.userRoster.settings) return 0;
    const totalTeams = league.total_rosters;
    const playoffSpots = Math.max(4, Math.floor(totalTeams / 3));
    const currentRank =
      league.rosters
        .sort((a, b) => (b.settings?.wins || 0) - (a.settings?.wins || 0))
        .findIndex(
          (roster) => roster.roster_id === league.userRoster.roster_id
        ) + 1;
    const totalGames =
      (league.userRoster.settings.wins || 0) +
      (league.userRoster.settings.losses || 0) +
      (league.userRoster.settings.ties || 0);
    const remainingWeeks = 14 - totalGames;
    const chancePercentage = Math.max(
      0,
      Math.min(100, 100 - (currentRank - playoffSpots) * (10 / remainingWeeks))
    );
    return chancePercentage.toFixed(1);
  };

  const nonEmptyLeagueTypes = [
    { type: "redraft", title: "Redraft Leagues" },
    { type: "keeper", title: "Keeper Leagues" },
    { type: "dynasty", title: "Dynasty Leagues" },
  ].filter((leagueType) => leagues[leagueType.type].length > 0);

  return (
    <div className="container mx-auto py-10" ref={topRef}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">
          Leagues for {username}
        </h1>
        {!isMobile && (
          <div className="relative">
            <Select
              onValueChange={handleYearChange}
              value={selectedYear.toString()}
            >
              <SelectTrigger className="w-[180px] pl-9">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="bg-base-100">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading leagues...</p>
      ) : expandedLeague ? (
        <ExpandedLeagueView
          league={expandedLeague}
          onBackClick={handleBackClick}
          username={username}
        />
      ) : nonEmptyLeagueTypes.length === 0 ? (
        <p className="text-center text-gray-500">
          No leagues found for {username} in {selectedYear}. Please check the
          username or try a different year.
        </p>
      ) : (
        nonEmptyLeagueTypes.map((leagueType) =>
          renderLeagueCards(leagues[leagueType.type], leagueType.title)
        )
      )}
    </div>
  );
};

const LeagueInfoItem = ({ label, value, tooltip }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}:</span>
    {tooltip ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-medium">{value}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <span className="font-medium">{value}</span>
    )}
  </div>
);

const PlayoffChance = ({ chance }) => (
  <div>
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <Target className="h-4 w-4 mr-2 text-primary/60" />
        <span className="text-sm font-medium">Playoff Chance:</span>
      </div>
      <span className="text-sm font-bold">{chance}%</span>
    </div>
    <div className="w-full bg-primary/20 rounded-full h-2 mt-2">
      <div
        className="bg-primary h-2 rounded-full"
        style={{ width: `${chance}%` }}
      />
    </div>
  </div>
);

export default LeaguesDisplay;
