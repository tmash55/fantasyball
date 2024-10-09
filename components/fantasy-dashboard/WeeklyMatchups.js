import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  fetchMatchups,
  fetchLeagueRosters,
  fetchLeagueUsers,
} from "@/libs/sleeper";

const WeeklyMatchups = ({
  leagueId,
  currentWeek,
  totalWeeks,
  currentUsername,
}) => {
  const [matchups, setMatchups] = useState([]);
  const [highestScorer, setHighestScorer] = useState(null);
  const [closestMatchup, setClosestMatchup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usernames, setUsernames] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  useEffect(() => {
    const getMatchupsAndUsernames = async () => {
      setIsLoading(true);
      try {
        const [matchupsData, rostersData, usersData] = await Promise.all([
          fetchMatchups(leagueId, selectedWeek),
          fetchLeagueRosters(leagueId),
          fetchLeagueUsers(leagueId),
        ]);

        const rosterToUserMap = rostersData.reduce((acc, roster) => {
          acc[roster.roster_id] = roster.owner_id;
          return acc;
        }, {});

        const usernameMap = usersData.reduce((acc, user) => {
          acc[user.user_id] = user.display_name || user.username;
          return acc;
        }, {});

        const rosterToUsernameMap = Object.keys(rosterToUserMap).reduce(
          (acc, rosterId) => {
            acc[rosterId] =
              usernameMap[rosterToUserMap[rosterId]] || `Team ${rosterId}`;
            return acc;
          },
          {}
        );

        setUsernames(rosterToUsernameMap);
        setMatchups(matchupsData);

        let maxScore = 0;
        let minDiff = Infinity;
        let maxScorer = null;
        let closestMatch = null;

        const matchupMap = matchupsData.reduce((acc, team) => {
          if (!acc[team.matchup_id]) {
            acc[team.matchup_id] = [];
          }
          acc[team.matchup_id].push(team);
          return acc;
        }, {});

        Object.values(matchupMap).forEach((matchup) => {
          const [team1, team2] = matchup;
          const scoreDiff = Math.abs(team1.points - team2.points);

          if (team1.points > maxScore) {
            maxScore = team1.points;
            maxScorer = team1;
          }
          if (team2.points > maxScore) {
            maxScore = team2.points;
            maxScorer = team2;
          }

          if (scoreDiff < minDiff) {
            minDiff = scoreDiff;
            closestMatch = matchup;
          }
        });

        setHighestScorer(maxScorer);
        setClosestMatchup(closestMatch);
      } catch (error) {
        console.error("Error fetching matchups and usernames:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    getMatchupsAndUsernames();
  }, [leagueId, selectedWeek]);

  const isCurrentUserTeam = (teamUsername) => {
    return teamUsername.toLowerCase() === currentUsername.toLowerCase();
  };

  const renderMatchupRow = (matchup, index) => {
    const [team1, team2] = matchup;
    const isCurrentUserMatchup =
      isCurrentUserTeam(usernames[team1.roster_id]) ||
      isCurrentUserTeam(usernames[team2.roster_id]);

    return (
      <motion.tr
        key={team1.matchup_id}
        className={
          isCurrentUserMatchup
            ? "bg-primary/20 hover:bg-primary/30"
            : "hover:bg-muted/50"
        }
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <TableCell className="font-medium">
          {usernames[team1.roster_id]}
          {isCurrentUserTeam(usernames[team1.roster_id]) && (
            <Badge className="ml-2 bg-primary text-base-200">You</Badge>
          )}
        </TableCell>
        <TableCell>{team1.points.toFixed(2)}</TableCell>
        <TableCell className="font-medium">
          {usernames[team2.roster_id]}
          {isCurrentUserTeam(usernames[team2.roster_id]) && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              You
            </Badge>
          )}
        </TableCell>
        <TableCell>{team2.points.toFixed(2)}</TableCell>
      </motion.tr>
    );
  };

  const renderMatchups = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading matchups...
            </motion.div>
          </TableCell>
        </TableRow>
      );
    }

    if (matchups.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            No matchups available for this week.
          </TableCell>
        </TableRow>
      );
    }

    const matchupMap = matchups.reduce((acc, team) => {
      if (!acc[team.matchup_id]) {
        acc[team.matchup_id] = [];
      }
      acc[team.matchup_id].push(team);
      return acc;
    }, {});

    const sortedMatchups = Object.values(matchupMap).sort((a, b) => {
      const aIsCurrentUser = a.some((team) =>
        isCurrentUserTeam(usernames[team.roster_id])
      );
      const bIsCurrentUser = b.some((team) =>
        isCurrentUserTeam(usernames[team.roster_id])
      );
      return bIsCurrentUser - aIsCurrentUser;
    });

    return sortedMatchups.map((matchup, index) =>
      renderMatchupRow(matchup, index)
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Week {selectedWeek} Matchups</CardTitle>
          <Select
            value={selectedWeek.toString()}
            onValueChange={(value) => setSelectedWeek(parseInt(value, 10))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent className="bg-base-100">
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(
                (week) => (
                  <SelectItem key={week} value={week.toString()}>
                    Week {week}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Opponent Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="sync">{renderMatchups()}</AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Week {selectedWeek} Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-4"
              >
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading stats...
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {highestScorer && (
                  <div>
                    <Badge variant="secondary">Highest Scorer</Badge>
                    <p className="mt-1">
                      {usernames[highestScorer.roster_id]} with{" "}
                      {highestScorer.points.toFixed(2)} points
                    </p>
                  </div>
                )}
                {closestMatchup && (
                  <div>
                    <Badge variant="secondary">Closest Matchup</Badge>
                    <p className="mt-1">
                      {usernames[closestMatchup[0].roster_id]} (
                      {closestMatchup[0].points.toFixed(2)}) vs{" "}
                      {usernames[closestMatchup[1].roster_id]} (
                      {closestMatchup[1].points.toFixed(2)})
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyMatchups;
