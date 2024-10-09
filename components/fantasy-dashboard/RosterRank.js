"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchLeagueDetails,
  fetchLeagueRostersForEachTeam,
  fetchLeagueUsers,
  fetchPlayerDetails,
  fetchPlayerStatsAPI,
} from "@/libs/sleeper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";

const formatPosition = (position) => {
  const [basePosition, number] = position.split(/(\d+)/).filter(Boolean);
  let formattedPosition = basePosition;

  switch (basePosition) {
    case "SUPER_FLEX":
      formattedPosition = "SFLX";
      break;
    case "IDP_FLEX":
      formattedPosition = "IDPF";
      break;
    case "REC_FLEX":
      formattedPosition = "RFLX";
      break;
    default:
      break;
  }

  return number ? `${formattedPosition}${number}` : formattedPosition;
};

const calculateIDPPoints = (stats, settings) => {
  if (!stats) return 0;

  let points = 0;

  points += (stats.idp_tkl_solo || 0) * (settings.idp_tkl_solo || 0);
  points += (stats.idp_tkl_ast || 0) * (settings.idp_tkl_ast || 0);
  points += (stats.idp_tkl_loss || 0) * (settings.idp_tkl_loss || 0);
  points += (stats.idp_sack || 0) * (settings.idp_sack || 0);
  points += (stats.idp_qb_hit || 0) * (settings.idp_qb_hit || 0);
  points += (stats.idp_int || 0) * (settings.idp_int || 0);
  points += (stats.idp_pass_def || 0) * (settings.idp_pass_def || 0);

  if (settings.idp_fumble_rec) {
    points += (stats.idp_fumble_rec || 0) * settings.idp_fumble_rec;
  }
  if (settings.idp_fumble_force) {
    points += (stats.idp_fumble_force || 0) * settings.idp_fumble_force;
  }
  if (stats.bonus_tkl_10p) {
    points += stats.bonus_tkl_10p * (settings.bonus_tkl_10p || 0);
  }

  return points;
};

const optimizeLineup = (roster, playerDetails, playerStats, leagueDetails) => {
  console.log("Optimizing lineup for roster:", roster.roster_id);
  const scoringType = leagueDetails.scoring_settings.rec
    ? leagueDetails.scoring_settings.rec === 1
      ? "ppr"
      : "half_ppr"
    : "std";

  const getPlayerPoints = (playerId) => {
    const player = playerDetails[playerId];
    const stats = playerStats[playerId];

    if (!player || !stats) return 0;

    if (["DB", "LB", "DL"].includes(player.position)) {
      return calculateIDPPoints(stats, leagueDetails.scoring_settings);
    } else {
      return parseFloat(stats[`pts_${scoringType}`] || 0);
    }
  };

  const isPositionMatch = (playerPosition, rosterPosition) => {
    const basePosition = rosterPosition.replace(/\d+$/, "");
    switch (basePosition) {
      case "QB":
        return playerPosition === "QB";
      case "RB":
        return playerPosition === "RB";
      case "WR":
        return playerPosition === "WR";
      case "TE":
        return playerPosition === "TE";
      case "K":
        return playerPosition === "K";
      case "FLEX":
        return ["RB", "WR", "TE"].includes(playerPosition);
      case "SUPER_FLEX":
        return ["QB", "RB", "WR", "TE"].includes(playerPosition);
      case "IDP_FLEX":
        return ["DB", "LB", "DL"].includes(playerPosition);
      case "DB":
        return playerPosition === "DB";
      case "LB":
        return playerPosition === "LB";
      case "DL":
        return playerPosition === "DL";
      default:
        return false;
    }
  };

  const sortedPlayers = [...roster.players].sort(
    (a, b) => getPlayerPoints(b) - getPlayerPoints(a)
  );

  const optimizedStarters = new Array(
    leagueDetails.roster_positions.length
  ).fill(null);
  const remainingPlayers = [...sortedPlayers];

  const assignBestPlayer = (position, index) => {
    const playerIndex = remainingPlayers.findIndex((playerId) =>
      isPositionMatch(playerDetails[playerId].position, position)
    );
    if (playerIndex !== -1) {
      optimizedStarters[index] = remainingPlayers[playerIndex];
      remainingPlayers.splice(playerIndex, 1);
      return true;
    }
    return false;
  };

  leagueDetails.roster_positions.forEach((position, index) => {
    if (
      !["FLEX", "SUPER_FLEX", "IDP_FLEX"].includes(position.replace(/\d+$/, ""))
    ) {
      assignBestPlayer(position, index);
    }
  });

  leagueDetails.roster_positions.forEach((position, index) => {
    if (
      ["FLEX", "SUPER_FLEX", "IDP_FLEX"].includes(
        position.replace(/\d+$/, "")
      ) &&
      optimizedStarters[index] === null
    ) {
      assignBestPlayer(position, index);
    }
  });

  console.log("Optimized starters:", optimizedStarters);
  return optimizedStarters.filter((player) => player !== null);
};

const calculatePositionRankings = (
  allRosters,
  playerDetails,
  playerStats,
  leagueDetails
) => {
  console.log("Calculating position rankings");
  const scoringType = leagueDetails.scoring_settings.rec
    ? leagueDetails.scoring_settings.rec === 1
      ? "ppr"
      : "half_ppr"
    : "std";

  const getPlayerPoints = (playerId) => {
    const player = playerDetails[playerId];
    const stats = playerStats[playerId];

    if (!player || !stats) return 0;

    if (["DB", "LB", "DL"].includes(player.position)) {
      return calculateIDPPoints(stats, leagueDetails.scoring_settings);
    } else {
      return parseFloat(stats[`pts_${scoringType}`] || 0);
    }
  };

  const positionRankings = {};

  // Count the number of each position
  const positionCounts = leagueDetails.roster_positions.reduce((acc, pos) => {
    const basePosition = pos.replace(/\d+$/, "");
    acc[basePosition] = (acc[basePosition] || 0) + 1;
    return acc;
  }, {});

  // Create a map to store all players for each position
  const positionSlotPlayers = {};

  allRosters.forEach((roster) => {
    const optimizedLineup = optimizeLineup(
      roster,
      playerDetails,
      playerStats,
      leagueDetails
    );

    optimizedLineup.forEach((playerId, index) => {
      if (playerId === null) return;
      const position = leagueDetails.roster_positions[index];
      const basePosition = position.replace(/\d+$/, "");
      const slotNumber = positionCounts[basePosition] > 1 ? index + 1 : 1;
      const positionSlot = `${basePosition}${slotNumber}`;

      if (!positionSlotPlayers[positionSlot]) {
        positionSlotPlayers[positionSlot] = [];
      }
      positionSlotPlayers[positionSlot].push(playerId);
    });
  });

  // Calculate rankings for each position and slot
  Object.entries(positionSlotPlayers).forEach(([positionSlot, players]) => {
    console.log(`Calculating rankings for position slot: ${positionSlot}`);
    console.log(`Players at position slot ${positionSlot}:`, players);

    const sortedPlayers = players
      .map((playerId) => ({
        playerId,
        points: getPlayerPoints(playerId),
      }))
      .sort((a, b) => b.points - a.points);

    positionRankings[positionSlot] = sortedPlayers.reduce(
      (acc, { playerId, points }, rank) => {
        acc[playerId] = {
          rank: rank + 1,
          total: sortedPlayers.length,
          points: points,
        };
        return acc;
      },
      {}
    );

    console.log(
      `Rankings for position slot ${positionSlot}:`,
      positionRankings[positionSlot]
    );
  });

  return positionRankings;
};

export default function RosterRank({ leagueId, userId }) {
  const [loading, setLoading] = useState(true);
  const [leagueDetails, setLeagueDetails] = useState(null);
  const [leagueRosters, setLeagueRosters] = useState([]);
  const [userRoster, setUserRoster] = useState(null);
  const [teamNames, setTeamNames] = useState({});
  const [playerDetails, setPlayerDetails] = useState({});
  const [playerStats, setPlayerStats] = useState({});
  const [positionRankings, setPositionRankings] = useState({});
  const [error, setError] = useState(null);
  const [allRosters, setAllRosters] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if (!leagueId) {
        setError("League ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const [details, rosters, users] = await Promise.all([
          fetchLeagueDetails(leagueId),
          fetchLeagueRostersForEachTeam(leagueId),
          fetchLeagueUsers(leagueId),
        ]);

        setLeagueDetails(details);

        const nameMapping = {};
        users.forEach((user) => {
          nameMapping[user.user_id] =
            user.display_name || user.team_name || `Team ${user.user_id}`;
        });
        setTeamNames(nameMapping);

        const userRoster = rosters.find((roster) => roster.owner_id === userId);
        setUserRoster(userRoster);

        const otherRosters = rosters.filter(
          (roster) => roster.owner_id !== userId
        );
        setLeagueRosters(otherRosters);
        setAllRosters(rosters);

        const allPlayerIds = rosters.flatMap((roster) => roster.players);
        const [players, stats] = await Promise.all([
          fetchPlayerDetails(allPlayerIds),
          fetchPlayerStatsAPI(),
        ]);
        setPlayerDetails(players);
        setPlayerStats(stats);

        const rankings = calculatePositionRankings(
          rosters,
          players,
          stats,
          details
        );
        setPositionRankings(rankings);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "An error occurred while fetching data.");
        setLoading(false);
      }
    }

    fetchData();
  }, [leagueId, userId]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <LeagueDetails league={leagueDetails} />
      {userRoster && (
        <UserRoster
          roster={userRoster}
          teamName={teamNames[userRoster.owner_id]}
          playerDetails={playerDetails}
          playerStats={playerStats}
          leagueDetails={leagueDetails}
          positionRankings={positionRankings}
        />
      )}
      <LeagueRosters
        rosters={leagueRosters}
        teamNames={teamNames}
        playerDetails={playerDetails}
        playerStats={playerStats}
        leagueDetails={leagueDetails}
        positionRankings={positionRankings}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="w-full h-[200px]" />
      <Skeleton className="w-full h-[300px]" />
      <Skeleton className="w-full h-[400px]" />
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function LeagueDetails({ league }) {
  if (!league) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">League Name</TableCell>
              <TableCell>{league.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Season</TableCell>
              <TableCell>{league.season}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total Rosters</TableCell>
              <TableCell>{league.total_rosters}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
function TeamSummary({ stats }) {
  return (
    <div className="flex items-center space-x-3">
      <Badge
        variant="secondary"
        className="bg-red-400 text-white px-2 py-1 rounded-full"
      >
        {stats.wins}-{stats.losses}
      </Badge>
      <span className="text-white">{stats.fpts.toFixed(2)} PF</span>
    </div>
  );
}

function UserRoster({
  roster,
  teamName,
  playerDetails,
  playerStats,
  leagueDetails,
  positionRankings,
  allRosters,
}) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>Your Roster: {teamName}</CardTitle>
      </CardHeader>
      <CardContent>
        <RosterDetails
          roster={roster}
          teamName={teamName}
          playerDetails={playerDetails}
          playerStats={playerStats}
          leagueDetails={leagueDetails}
          positionRankings={positionRankings}
          allRosters={allRosters}
        />
      </CardContent>
    </Card>
  );
}

function LeagueRosters({
  rosters,
  teamNames,
  playerDetails,
  playerStats,
  leagueDetails,
  positionRankings,
  allRosters,
}) {
  if (!rosters || rosters.length === 0) return null;
  const sortedRosters = [...rosters].sort(
    (a, b) => b.settings.pointsFor - a.settings.pointsFor
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Other Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {sortedRosters.map((roster) => (
            <AccordionItem
              key={roster.roster_id}
              value={`roster-${roster.roster_id}`}
              className="border-b border-gray-700 last:border-b-0"
            >
              <AccordionTrigger className="flex justify-between items-center py-4 px-2 hover:bg-gray-800 transition-colors">
                <span className="text-lg font-medium">
                  {teamNames[roster.owner_id] || `Team ${roster.roster_id}`}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 py-4">
                <RosterDetails
                  roster={roster}
                  teamName={teamNames[roster.owner_id]}
                  playerDetails={playerDetails}
                  playerStats={playerStats}
                  leagueDetails={leagueDetails}
                  positionRankings={positionRankings}
                  allRosters={allRosters}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function RosterDetails({
  roster,
  teamName,
  playerDetails,
  playerStats,
  leagueDetails,
  positionRankings,
}) {
  const [isBenchExpanded, setIsBenchExpanded] = useState(false);

  const scoringType = leagueDetails.scoring_settings.rec
    ? leagueDetails.scoring_settings.rec === 1
      ? "ppr"
      : "half_ppr"
    : "std";

  const getPlayerPoints = (playerId) => {
    const player = playerDetails[playerId];
    const stats = playerStats[playerId];

    if (!player || !stats) return 0;

    if (["DB", "LB", "DL"].includes(player.position)) {
      return calculateIDPPoints(stats, leagueDetails.scoring_settings);
    } else {
      return parseFloat(stats[`pts_${scoringType}`] || 0);
    }
  };

  const getPlayerPPG = (playerId) => {
    const points = getPlayerPoints(playerId);
    const stats = playerStats[playerId];

    if (points === 0 || !stats || !stats.gp) return 0;

    return points / stats.gp;
  };

  const optimizedStarters = useMemo(() => {
    return optimizeLineup(roster, playerDetails, playerStats, leagueDetails);
  }, [roster, playerDetails, playerStats, leagueDetails]);

  const getAdjustedRank = (playerId, position, index) => {
    const basePosition = position.replace(/\d+$/, "");
    const positionSlot = `${basePosition}${index + 1}`;

    if (
      positionRankings[positionSlot] &&
      positionRankings[positionSlot][playerId]
    ) {
      const { rank, total } = positionRankings[positionSlot][playerId];
      return `${rank}/${total}`;
    }

    // Fallback for FLEX positions
    if (["FLEX", "SUPER_FLEX", "REC_FLEX"].includes(basePosition)) {
      const eligiblePositions = getEligiblePositionsForFlex(basePosition);
      for (const pos of eligiblePositions) {
        if (positionRankings[pos] && positionRankings[pos][playerId]) {
          const { rank, total } = positionRankings[pos][playerId];
          return `${rank}/${total}`;
        }
      }
    }

    return "N/A";
  };

  const getEligiblePositionsForFlex = (flexPosition) => {
    switch (flexPosition) {
      case "FLEX":
        return ["RB", "WR", "TE"];
      case "SUPER_FLEX":
        return ["QB", "RB", "WR", "TE"];
      case "REC_FLEX":
        return ["WR", "TE"];
      default:
        return [];
    }
  };

  const formatPosition = (position) => {
    const positionMap = {
      SUPER_FLEX: "SFLX",
      IDP_FLEX: "IDPF",
      REC_FLEX: "RFLX",
    };

    const [basePosition, number] = position.split(/(\d+)/).filter(Boolean);
    const formattedBase = positionMap[basePosition] || basePosition;
    return number ? `${formattedBase}${number}` : formattedBase;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Wins</TableHead>
            <TableHead>Losses</TableHead>
            <TableHead>Total Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{teamName}</TableCell>
            <TableCell>{roster.settings.wins}</TableCell>
            <TableCell>{roster.settings.losses}</TableCell>
            <TableCell>
              {roster.settings.fpts + "." + roster.settings.fpts_decimal}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Optimized Starting Lineup</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pos</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Fantasy Pts</TableHead>
              <TableHead>PPG</TableHead>
              <TableHead>Position Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimizedStarters.map((playerId, index) => {
              if (playerId === null) return null;
              const position = leagueDetails.roster_positions[index];
              const positionWithCount = formatPosition(position);
              const ranking = getAdjustedRank(playerId, position, index);

              return (
                <TableRow key={playerId}>
                  <TableCell className="font-medium">
                    <span className="text-green-500">{positionWithCount}</span>
                  </TableCell>
                  <TableCell>
                    <PlayerInfo player={playerDetails[playerId]} />
                  </TableCell>
                  <TableCell>{getPlayerPoints(playerId).toFixed(2)}</TableCell>
                  <TableCell>{getPlayerPPG(playerId).toFixed(2)}</TableCell>
                  <TableCell>{ranking}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Collapsible
          open={isBenchExpanded}
          onOpenChange={setIsBenchExpanded}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Bench</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isBenchExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle bench</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Fantasy Pts</TableHead>
                  <TableHead>PPG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.players
                  .filter((playerId) => !optimizedStarters.includes(playerId))
                  .map((playerId) => (
                    <TableRow key={playerId}>
                      <TableCell>
                        <PlayerInfo player={playerDetails[playerId]} />
                      </TableCell>
                      <TableCell>
                        {getPlayerPoints(playerId).toFixed(2)}
                      </TableCell>
                      <TableCell>{getPlayerPPG(playerId).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}

function PlayerInfo({ player }) {
  if (!player) return null;

  return (
    <div className="flex items-center space-x-2">
      <div>
        <div className="font-medium">{player.name}</div>
        <div className="text-xs text-muted-foreground flex items-center space-x-1">
          <Badge variant="secondary">{player.team}</Badge>
          <span>{player.position}</span>
        </div>
      </div>
    </div>
  );
}
