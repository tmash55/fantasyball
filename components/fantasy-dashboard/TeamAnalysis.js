import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchUserRoster,
  fetchPlayerDetails,
  fetchPlayerStats,
} from "@/libs/sleeper";
import { ErrorBoundary } from "react-error-boundary";

const formatPosition = (position) => {
  if (position === "SUPER_FLEX") return "SFLX";
  if (position === "IDP_FLEX") return "IDPF";
  if (position === "REC_FLEX") return "RFLX";
  return position;
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

const POSITION_MULTIPLIERS = {
  QB: 1,
  RB: 1.2,
  WR: 1.1,
  TE: 0.9,
  K: 0.5,
  DEF: 0.5,
};

const AVERAGE_PPG = {
  QB: 18,
  RB: 12,
  WR: 11,
  TE: 8,
  K: 8,
  DEF: 7,
};

function calculatePlayerScore(player, isStarter = true) {
  if (player.position === "K" || player.position === "DEF") {
    return 70; // Base score for K and DEF
  }

  const baseScore = 100 - (player.positionRank - 1) * 2;
  const ppgAdjustment = (player.ppg / AVERAGE_PPG[player.position]) * 10;
  const positionMultiplier = POSITION_MULTIPLIERS[player.position];
  let finalScore = (baseScore + ppgAdjustment) * positionMultiplier;

  if (!isStarter) {
    finalScore *= 0.8;
  }

  return Math.min(Math.max(finalScore, 0), 100); // Ensure score is between 0 and 100
}

function getLetterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function gradePositionGroup(starters, bench) {
  if (starters.length === 0 && bench.length === 0) {
    return { score: 0, grade: "F" };
  }

  const starterScores = starters.map((player) => calculatePlayerScore(player));
  const benchScores = bench.map((player) =>
    calculatePlayerScore(player, false)
  );

  const averageStarterScore =
    starterScores.length > 0
      ? starterScores.reduce((a, b) => a + b, 0) / starterScores.length
      : 0;
  const topBenchScore = benchScores.length > 0 ? Math.max(...benchScores) : 0;

  const groupScore = averageStarterScore * 0.8 + topBenchScore * 0.2;
  return {
    score: groupScore,
    grade: getLetterGrade(groupScore),
  };
}

function gradeRoster(roster) {
  const grades = {};
  const positions = ["QB", "RB", "WR", "TE", "K", "DEF"];

  positions.forEach((pos) => {
    const starters = roster.starters.filter(
      (player) => player.position === pos
    );
    const bench = roster.bench.filter((player) => player.position === pos);
    grades[pos] = gradePositionGroup(starters, bench);
  });

  // Calculate overall team grade
  const overallScore =
    Object.values(grades).reduce((sum, grade) => sum + grade.score, 0) /
    positions.length;
  grades.overall = {
    score: overallScore,
    grade: getLetterGrade(overallScore),
  };

  return grades;
}

const SkeletonRow = () => (
  <TableRow>
    <TableCell className="py-2 md:py-4 w-[20px] md:w-[30px]">
      <Skeleton className="h-4 w-6 md:w-8" />
    </TableCell>
    <TableCell className="py-2 md:py-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-20 md:w-24" />
          <Skeleton className="h-3 w-16 md:w-20 mt-1" />
        </div>
      </div>
    </TableCell>
    <TableCell className="py-2 md:py-4">
      <Skeleton className="h-4 w-12 md:w-16" />
    </TableCell>
    <TableCell className="py-2 md:py-4">
      <Skeleton className="h-4 w-12 md:w-16" />
    </TableCell>
  </TableRow>
);

const PlayerRow = React.memo(
  ({ playerId, position, playerDetails, playerStats, scoringFormat }) => {
    const player = playerDetails[playerId] || {};
    const stats = playerStats[playerId] || {};

    const getPositionRank = () => {
      let rank;
      if (scoringFormat.startsWith("PPR")) {
        rank = stats.pos_rank_ppr;
      } else if (scoringFormat.startsWith("Half PPR")) {
        rank = stats.pos_rank_half_ppr;
      } else {
        rank = stats.pos_rank;
      }
      return rank !== undefined ? `${player.position}${rank}` : "-";
    };

    const positionRank = getPositionRank();
    const ppg =
      player.position === "K" || player.position === "DEF"
        ? "-"
        : stats.averagePoints !== undefined
        ? stats.averagePoints.toFixed(1)
        : "-";

    return (
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell className="font-medium text-primary py-2 md:py-4 text-xs md:text-sm w-[20px] md:w-[30px]">
          {formatPosition(position)}
        </TableCell>
        <TableCell className="py-2 md:py-4">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage
                src={`https://sleepercdn.com/content/nfl/players/${playerId}.jpg`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://sleepercdn.com/images/v2/icons/player_default.webp";
                }}
              />
              <AvatarFallback>
                {player.name ? player.name[0] : ""}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-xs md:text-sm">
                {player.name || `Unknown Player (ID: ${playerId})`}
              </div>
              <div className="text-[9px] md:text-xs text-muted-foreground">
                {player.team && player.position && (
                  <>
                    <span className="md:hidden mr-1">{player.team}</span>
                    <Badge
                      variant="outline"
                      className="hidden md:inline-flex mr-1 text-[10px] md:text-xs"
                    >
                      {player.team}
                    </Badge>
                  </>
                )}
                <span>{player.position || "Unknown Position"}</span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right font-medium py-2 md:py-4 text-xs md:text-sm">
          {ppg}
        </TableCell>
        <TableCell className="text-right font-medium py-2 md:py-4 text-xs md:text-sm">
          {positionRank !== undefined ? positionRank : "-"}
        </TableCell>
      </TableRow>
    );
  }
);

PlayerRow.displayName = "PlayerRow";

const PlayerTable = React.memo(
  ({
    title,
    players,
    positions,
    playerDetails,
    playerStats,
    isLoading,
    scoringFormat,
  }) => {
    return (
      <div className="mb-4 md:mb-6">
        <div className="flex justify-between items-center mb-2 md:mb-4 py-2">
          <h3 className="text-base md:text-lg font-semibold">{title}</h3>
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20px] md:w-[30px] py-2 md:py-4 text-xs md:text-sm">
                  Pos
                </TableHead>
                <TableHead className="py-2 md:py-4 text-xs md:text-sm">
                  Player
                </TableHead>
                <TableHead className="text-right py-2 md:py-4 text-xs md:text-sm">
                  PPG
                </TableHead>
                <TableHead className="text-right py-2 md:py-4 text-xs md:text-sm">
                  Pos Rank
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array(players.length)
                    .fill()
                    .map((_, index) => <SkeletonRow key={index} />)
                : players.map((playerId, index) => (
                    <PlayerRow
                      key={playerId}
                      playerId={playerId}
                      position={positions[index]}
                      playerDetails={playerDetails}
                      playerStats={playerStats}
                      scoringFormat={scoringFormat}
                    />
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
);

PlayerTable.displayName = "PlayerTable";

const TeamGrades = ({ grades }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Team Grades</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Object.entries(grades).map(([position, grade]) => (
          <div key={position} className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium">{position.toUpperCase()}</h4>
            <p className="text-2xl font-bold">{grade.grade}</p>
            <p className="text-sm text-muted-foreground">
              {grade.score.toFixed(1)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TeamAnalysis = ({ league, username }) => {
  const [userRoster, setUserRoster] = useState(null);
  const [playerDetails, setPlayerDetails] = useState({});
  const [playerStats, setPlayerStats] = useState({});
  const [teamGrades, setTeamGrades] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scoringFormat = getScoringFormat(league.scoring_settings);

  useEffect(() => {
    console.log("League Scoring Settings:", league.scoring_settings);
    console.log("Detected Scoring Format:", scoringFormat);
  }, [league.scoring_settings, scoringFormat]);

  const fetchRosterAndPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!league.userRoster || !league.userRoster.owner_id) {
        throw new Error("No lineup available");
      }

      const roster = await fetchUserRoster(
        league.league_id,
        league.userRoster.owner_id
      );
      setUserRoster(roster);

      const allPlayerIds = [
        ...(roster.starters || []),
        ...(roster.players || []),
      ];

      const [details, stats] = await Promise.all([
        fetchPlayerDetails(allPlayerIds),
        fetchPlayerStats(allPlayerIds, league.scoring_settings),
      ]);

      setPlayerDetails(details);
      setPlayerStats(stats);

      // Calculate team grades
      const rosterWithStats = {
        starters: roster.starters.map((playerId) => ({
          ...details[playerId],
          ...stats[playerId],
          positionRank: stats[playerId].pos_rank || 999,
          ppg:
            stats[playerId].pts_per_game || stats[playerId].averagePoints || 0,
        })),
        bench: roster.players
          .filter((playerId) => !roster.starters.includes(playerId))
          .map((playerId) => ({
            ...details[playerId],
            ...stats[playerId],
            positionRank: stats[playerId].pos_rank || 999,
            ppg:
              stats[playerId].pts_per_game ||
              stats[playerId].averagePoints ||
              0,
          })),
      };

      console.log("Roster with stats:", rosterWithStats);
      const calculatedGrades = gradeRoster(rosterWithStats);
      setTeamGrades(calculatedGrades);

      // Log a sample player's stats to verify the correct variable names
      if (stats[allPlayerIds[0]]) {
        console.log("Sample player stats:", stats[allPlayerIds[0]]);
      }
    } catch (error) {
      console.error("Error fetching roster and player details:", error);
      setError(
        error.message || "Failed to load roster data. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [league.league_id, league.scoring_settings, league.userRoster]);

  useEffect(() => {
    fetchRosterAndPlayers();
  }, [fetchRosterAndPlayers]);

  const { starters, bench } = useMemo(() => {
    if (!userRoster) return { starters: [], bench: [] };
    const starters = userRoster.starters || [];
    const bench = (userRoster.players || []).filter(
      (playerId) => !starters.includes(playerId)
    );
    return { starters, bench };
  }, [userRoster]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{username}&apos;s Team Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerTable
            title="Loading..."
            players={[]}
            positions={[]}
            playerDetails={{}}
            playerStats={{}}
            isLoading={true}
            scoringFormat={scoringFormat}
          />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>${username}&apos;s Team Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!userRoster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{username}&apos;s Team Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">No lineup available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Card>
        <CardHeader>
          <CardTitle>{username}&apos;s Team Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 md:space-y-6 overflow-auto h-full pr-2 md:pr-4">
            <PlayerTable
              title="Starting Lineup"
              players={starters}
              positions={league.roster_positions}
              playerDetails={playerDetails}
              playerStats={playerStats}
              isLoading={isLoading}
              scoringFormat={scoringFormat}
            />
            <PlayerTable
              title="Bench"
              players={bench}
              positions={bench.map(() => "BN")}
              playerDetails={playerDetails}
              playerStats={playerStats}
              isLoading={isLoading}
              scoringFormat={scoringFormat}
            />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Team Stats</h3>
            <p>Wins: {userRoster.settings?.wins || 0}</p>
            <p>Losses: {userRoster.settings?.losses || 0}</p>
            <p>Ties: {userRoster.settings?.ties || 0}</p>
            <p>
              Total Points: {userRoster.settings?.fpts?.toFixed(2) || "0.00"}
            </p>
          </div>
          {teamGrades && <TeamGrades grades={teamGrades} />}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default TeamAnalysis;
