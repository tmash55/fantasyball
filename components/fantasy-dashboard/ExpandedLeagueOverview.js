import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Crown } from "lucide-react";
import {
  fetchMatchups,
  fetchLeagueRosters,
  fetchLeagueUsers,
  getCurrentNFLWeek,
  fetchLeagueDetails,
} from "@/libs/sleeper";

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

const ExpandedLeagueOverview = ({ league }) => {
  const [weeklyHighScorers, setWeeklyHighScorers] = useState([]);
  const [yearlyHighScorer, setYearlyHighScorer] = useState(null);
  const [yearlyLowScorer, setYearlyLowScorer] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastYearWinner, setLastYearWinner] = useState(null);
  const currentYear = new Date().getFullYear();
  const isCurrentYear = league.season === currentYear.toString();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentWeek =
          league.season < currentYear ? 18 : await getCurrentNFLWeek();
        const [rostersData, usersData, leagueDetails] = await Promise.all([
          fetchLeagueRosters(league.league_id),
          fetchLeagueUsers(league.league_id),
          fetchLeagueDetails(league.league_id),
        ]);

        const rosterToUserMap = rostersData.reduce((acc, roster) => {
          acc[roster.roster_id] = roster.owner_id;
          return acc;
        }, {});

        const usernameMap = usersData.reduce((acc, user) => {
          acc[user.user_id] = user.display_name || user.username;
          return acc;
        }, {});

        // Process last year's winner
        if (
          isCurrentYear &&
          leagueDetails.metadata &&
          leagueDetails.metadata.latest_league_winner_roster_id
        ) {
          const winnerRosterId =
            leagueDetails.metadata.latest_league_winner_roster_id;
          const winnerUserId = rosterToUserMap[winnerRosterId];
          const winnerUsername = usernameMap[winnerUserId];
          setLastYearWinner(winnerUsername);
        } else {
          setLastYearWinner(null);
        }

        const weeklyScores = [];
        let highestYearlyScore = { score: 0, username: "N/A", week: 0 };
        let lowestYearlyScore = { score: Infinity, username: "N/A", week: 0 };

        for (let week = 1; week < currentWeek; week++) {
          const matchupsData = await fetchMatchups(league.league_id, week);
          let weekHighScorer = { points: 0, roster_id: null };
          let weekLowScorer = { points: Infinity, roster_id: null };

          matchupsData.forEach((matchup) => {
            if (matchup.points > weekHighScorer.points) {
              weekHighScorer = matchup;
            }
            if (matchup.points < weekLowScorer.points) {
              weekLowScorer = matchup;
            }
          });

          if (weekHighScorer.roster_id !== null) {
            const highUsername =
              usernameMap[rosterToUserMap[weekHighScorer.roster_id]] ||
              "Unknown";
            weeklyScores.push({
              week,
              username: highUsername,
              score: weekHighScorer.points,
            });

            if (weekHighScorer.points > highestYearlyScore.score) {
              highestYearlyScore = {
                score: weekHighScorer.points,
                username: highUsername,
                week,
              };
            }
          }

          if (
            weekLowScorer.roster_id !== null &&
            weekLowScorer.points < lowestYearlyScore.score
          ) {
            const lowUsername =
              usernameMap[rosterToUserMap[weekLowScorer.roster_id]] ||
              "Unknown";
            lowestYearlyScore = {
              score: weekLowScorer.points,
              username: lowUsername,
              week,
            };
          }
        }

        setWeeklyHighScorers(weeklyScores);
        setYearlyHighScorer(highestYearlyScore);
        setYearlyLowScorer(lowestYearlyScore);
      } catch (error) {
        console.error("Error fetching league data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [league, currentYear, isCurrentYear]);

  const recentActivity = league.recent_activity || [
    "Team A traded Player X for Player Y",
    "Team B picked up Free Agent Z",
    "Commissioner updated league settings",
  ];

  const scoringFormat = getScoringFormat(league.scoring_settings);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>League Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                League Type
              </p>
              <p className="text-lg font-semibold">
                {league.settings.type === 2
                  ? "Dynasty"
                  : league.settings.type === 1
                  ? "Keeper"
                  : "Redraft"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Teams
              </p>
              <p className="text-lg font-semibold">
                {league.total_rosters || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Scoring Type
              </p>
              <p className="text-lg font-semibold">{scoringFormat}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Season
              </p>
              <p className="text-lg font-semibold">{league.season || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {isCurrentYear && lastYearWinner && (
        <Card>
          <CardHeader>
            <CardTitle>Last Year's Winner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-yellow-500" aria-hidden="true" />
              <p className="text-lg font-semibold">{lastYearWinner}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={league.avatar} alt={league.name} />
              <AvatarFallback>{(league.name || "L")[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">
                {league.team_name || "Your Team"}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">
                  Rank: {league.userRoster?.settings?.rank || "N/A"}
                </Badge>
                <Badge variant="secondary">
                  Record: {league.userRoster?.settings?.wins || 0}-
                  {league.userRoster?.settings?.losses || 0}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentActivity.map((activity, index) => (
              <li key={index} className="text-sm flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-primary"></span>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>League Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Highest Score
              </p>
              <p className="text-lg font-semibold">
                {yearlyHighScorer && yearlyHighScorer.score > 0
                  ? yearlyHighScorer.score.toFixed(2)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Lowest Score
              </p>
              <p className="text-lg font-semibold">
                {yearlyLowScorer && yearlyLowScorer.score < Infinity
                  ? yearlyLowScorer.score.toFixed(2)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </p>
              <p className="text-lg font-semibold">
                {league.total_transactions || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly High Scorers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading weekly high scorers...</p>
          ) : (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {isOpen
                    ? "Hide Weekly High Scorers"
                    : "Show Weekly High Scorers"}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyHighScorers.map((scorer) => (
                      <TableRow key={scorer.week}>
                        <TableCell>{scorer.week}</TableCell>
                        <TableCell>{scorer.username}</TableCell>
                        <TableCell>{scorer.score.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Season Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Highest Scorer This Year
              </p>
              <p className="text-lg font-semibold">
                {yearlyHighScorer && yearlyHighScorer.score > 0
                  ? `${
                      yearlyHighScorer.username
                    } - ${yearlyHighScorer.score.toFixed(2)} points (Week ${
                      yearlyHighScorer.week
                    })`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Lowest Scorer This Year
              </p>
              <p className="text-lg font-semibold">
                {yearlyLowScorer && yearlyLowScorer.score < Infinity
                  ? `${
                      yearlyLowScorer.username
                    } - ${yearlyLowScorer.score.toFixed(2)} points (Week ${
                      yearlyLowScorer.week
                    })`
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpandedLeagueOverview;
