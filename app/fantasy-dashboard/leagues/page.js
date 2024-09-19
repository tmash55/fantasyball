"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Settings,
  Calendar,
  Trophy,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchUserLeaguesAndDetails } from "@/libs/sleeper";
import Image from "next/image";
import UserLineup from "@/components/fantasy-dashboard/UserLineup";

export default function LeaguesPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const [leagues, setLeagues] = useState({
    redraft: [],
    dynasty: [],
    keeper: [],
  });
  const [expandedLeague, setExpandedLeague] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [userId, setUserId] = useState(null);

  const fetchLeagues = useCallback(async () => {
    if (!username) {
      setError(
        "Username not provided in the URL. Please include a '?username=' parameter."
      );
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedLeagues = await fetchUserLeaguesAndDetails(
        username,
        selectedYear
      );
      if (fetchedLeagues.length > 0 && fetchedLeagues[0].rosters.length > 0) {
        const userRoster = fetchedLeagues[0].rosters.find(
          (roster) => roster.owner_id
        );
        if (userRoster) {
          setUserId(userRoster.owner_id);
        }
      }
      const categorizedLeagues = fetchedLeagues.reduce(
        (acc, league) => {
          const simplifiedLeague = {
            league_id: league.league_id,
            name: league.name,
            settings: league.settings || {},
            scoring_settings: league.scoring_settings || {},
            total_rosters: league.total_rosters,
            status: league.status,
            season: league.season,
            roster_positions: league.roster_positions || [],
            rosters: league.rosters || [],
            userRoster: league.userRoster,
          };
          const leagueType = simplifiedLeague.settings.type || 0;
          switch (leagueType) {
            case 0:
              acc.redraft.push(simplifiedLeague);
              break;
            case 1:
              acc.keeper.push(simplifiedLeague);
              break;
            case 2:
              acc.dynasty.push(simplifiedLeague);
              break;
            default:
              console.warn(`Unknown league type: ${leagueType}`);
              acc.redraft.push(simplifiedLeague);
          }
          return acc;
        },
        { redraft: [], dynasty: [], keeper: [] }
      );
      setLeagues(categorizedLeagues);
    } catch (err) {
      console.error("Error fetching leagues:", err);
      setError(`Failed to fetch leagues: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [username, selectedYear]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const handleRetry = () => {
    setRetryCount((prevCount) => prevCount + 1);
    fetchLeagues();
  };

  const handleLeagueClick = (league) => {
    setExpandedLeague(league);
  };

  const handleBackClick = () => {
    setExpandedLeague(null);
  };

  const handleYearChange = (year) => {
    setSelectedYear(parseInt(year));
  };

  const getScoringFormat = (scoringSettings) => {
    if (!scoringSettings) return "Unknown";

    const rec = scoringSettings.rec || 0;
    const bonusRecTe = scoringSettings.bonus_rec_te || 0;

    if (rec === 1) {
      if (bonusRecTe > 0) {
        return `PPR TEP (+${bonusRecTe})`;
      }
      return "PPR";
    } else if (rec === 0.5) {
      if (bonusRecTe > 0) {
        return `Half PPR TEP (+${bonusRecTe})`;
      }
      return "Half PPR";
    } else if (rec === 0) {
      if (bonusRecTe > 0) {
        return `Standard TEP (+${bonusRecTe})`;
      }
      return "Standard";
    }
    return "Custom";
  };

  const formatPoints = (points, decimal) => {
    const mainPoints = String(points || 0);
    const decimalPoints = String(decimal || 0).padStart(2, "0");
    return `${mainPoints}.${decimalPoints}`;
  };

  const getUserRecord = (league) => {
    const userRoster = league.rosters.find(
      (roster) => roster.owner_id === userId
    );
    if (userRoster && userRoster.settings) {
      const wins = userRoster.settings.wins || 0;
      const losses = userRoster.settings.losses || 0;
      const ties = userRoster.settings.ties || 0;
      return `${wins}-${losses}${ties ? `-${ties}` : ""}`;
    }
    return "N/A";
  };

  const renderLeagueStats = (league) => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>View League Settings</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">League Size:</p>
              <p>{league.total_rosters || "Unknown"}</p>
            </div>
            <div>
              <p className="font-semibold">Scoring Format:</p>
              <p>{getScoringFormat(league.scoring_settings)}</p>
            </div>
            <div>
              <p className="font-semibold">Type:</p>
              <p>
                {league.settings.type === 0
                  ? "Redraft"
                  : league.settings.type === 1
                  ? "Keeper"
                  : league.settings.type === 2
                  ? "Dynasty"
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Status:</p>
              <p>{league.status || "Unknown"}</p>
            </div>
            <div>
              <p className="font-semibold">Season:</p>
              <p>{league.season || "Unknown"}</p>
            </div>
            <div>
              <p className="font-semibold">Starting Positions:</p>
              <p>
                {league.roster_positions
                  ? league.roster_positions
                      .filter((pos) => pos !== "BN")
                      .join(", ")
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Your Record:</p>
              <p>{getUserRecord(league)}</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>View Roster Stats</AccordionTrigger>
        <AccordionContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Team Name</th>
                  <th className="px-4 py-2">Record</th>
                  <th className="px-4 py-2">Points For</th>
                  <th className="px-4 py-2">Points Against</th>
                </tr>
              </thead>
              <tbody>
                {league.rosters
                  .sort(
                    (a, b) => (b.settings?.wins || 0) - (a.settings?.wins || 0)
                  )
                  .map((roster, index) => (
                    <tr
                      key={roster.roster_id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-2 text-center">{index + 1}</td>
                      <td className="px-4 py-2 text-center flex items-center justify-center">
                        {roster.avatar && (
                          <Image
                            src={`https://sleepercdn.com/avatars/thumbs/${roster.avatar}`}
                            alt={`${roster.username}'s avatar`}
                            width={24}
                            height={24}
                            className="rounded-full mr-2"
                          />
                        )}
                        {roster.username}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {`${roster.settings?.wins || 0}-${
                          roster.settings?.losses || 0
                        }${
                          roster.settings?.ties
                            ? `-${roster.settings.ties}`
                            : ""
                        }`}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {formatPoints(
                          roster.settings?.fpts,
                          roster.settings?.fpts_decimal
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {formatPoints(
                          roster.settings?.fpts_against,
                          roster.settings?.fpts_against_decimal
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Your Lineup</AccordionTrigger>
        <AccordionContent>
          {league.userRoster ? (
            <UserLineup
              roster={league.userRoster}
              rosterPositions={league.roster_positions}
            />
          ) : (
            <p>Unable to fetch your lineup for this league.</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const renderLeagueCards = (leagueList, title) => {
    if (leagueList.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagueList.map((league) => (
            <Card
              key={league.league_id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleLeagueClick(league)}
            >
              <CardHeader>
                <CardTitle>{league.name || "Unnamed League"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">
                  League Size: {league.total_rosters || "Unknown"}
                </p>
                <p className="mt-2">
                  Scoring: {getScoringFormat(league.scoring_settings)}
                </p>
                <p className="mt-2">Status: {league.status || "Unknown"}</p>
                <div className="mt-2 flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>
                    Starting Positions:{" "}
                    {league.roster_positions
                      ? league.roster_positions.filter((pos) => pos !== "BN")
                          .length
                      : "Unknown"}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>
                    Type:{" "}
                    {league.settings.type === 0
                      ? "Redraft"
                      : league.settings.type === 1
                      ? "Keeper"
                      : league.settings.type === 2
                      ? "Dynasty"
                      : "Unknown"}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>
                    Current Leader:{" "}
                    {league.rosters && league.rosters.length > 0
                      ? Math.max(
                          ...league.rosters.map(
                            (roster) => roster.settings?.wins || 0
                          )
                        ) + " Wins"
                      : "Unknown"}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="font-semibold">Your Record: </span>
                  <span className="ml-2">{getUserRecord(league)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading leagues...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={handleRetry}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Retry (Attempt {retryCount + 1})
        </Button>
      </div>
    );
  }

  if (expandedLeague) {
    return (
      <div className="container mx-auto py-10">
        <Button onClick={handleBackClick} className="mb-4" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Leagues
        </Button>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              {expandedLeague.name || "Unnamed League"}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderLeagueStats(expandedLeague)}</CardContent>
        </Card>
      </div>
    );
  }

  const nonEmptyLeagueTypes = [
    { type: "redraft", title: "Redraft Leagues" },
    { type: "keeper", title: "Keeper Leagues" },
    { type: "dynasty", title: "Dynasty Leagues" },
  ].filter((leagueType) => leagues[leagueType.type].length > 0);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leagues for {username}</h1>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          <Select
            onValueChange={handleYearChange}
            defaultValue={selectedYear.toString()}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2023, 2022, 2021, 2020].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {nonEmptyLeagueTypes.length === 0 ? (
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
}
