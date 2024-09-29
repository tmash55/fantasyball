import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  fetchUserRoster,
  fetchPlayerDetails,
  fetchPlayerStats,
} from "@/libs/sleeper";
import { fetchWeeklyProjections } from "@/libs/projections";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorBoundary } from "react-error-boundary";

const formatPosition = (position) => {
  if (position === "SUPER_FLEX") return "SFLX";
  if (position === "IDP_FLEX") return "IDPF";
  if (position === "REC_FLEX") return "RFLX";
  return position;
};

const PremiumButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
  >
    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
      {children}
    </span>
  </button>
);

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
    <TableCell className="hidden md:table-cell py-2 md:py-4">
      <Skeleton className="h-4 w-12 md:w-16" />
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
  ({ playerId, position, playerDetails, playerStats, projectedPoints }) => {
    const player = playerDetails[playerId] || {};
    const stats = playerStats[playerId] || {};

    return (
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell className="font-medium text-primary py-2 md:py-4 text-xs md:text-sm w-[20px] md:w-[30px]">
          {formatPosition(position)}
        </TableCell>
        <TableCell className="py-2 md:py-4">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage
                src={
                  stats.playerDetails?.headshot_url ||
                  `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`
                }
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
                {stats.playerDetails?.name ||
                  player.name ||
                  `Unknown Player (ID: ${playerId})`}
              </div>
              <div className="text-[9px] md:text-xs text-muted-foreground">
                {stats.playerDetails?.team && stats.playerDetails?.position && (
                  <>
                    <span className="md:hidden mr-1">
                      {stats.playerDetails.team}
                    </span>
                    <Badge
                      variant="outline"
                      className="hidden md:inline-flex mr-1 text-[10px] md:text-xs"
                    >
                      {stats.playerDetails.team}
                    </Badge>
                  </>
                )}
                <span>
                  {stats.playerDetails?.position || "Unknown Position"}
                </span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell text-right py-2 md:py-4 text-xs md:text-sm">
          {stats.gamesPlayed || 0}
        </TableCell>
        <TableCell className="text-right font-medium py-2 md:py-4 text-xs md:text-sm">
          {stats.totalPoints?.toFixed(2) || "0.00"}
        </TableCell>
        <TableCell className="text-right font-medium py-2 md:py-4 text-xs md:text-sm">
          {projectedPoints?.toFixed(2) || "N/A"}
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
    projections,
    isLoading,
    onOptimize,
  }) => {
    return (
      <div className="mb-4 md:mb-6">
        <div className="flex justify-between items-center mb-2 md:mb-4 py-2">
          <h3 className="text-base md:text-lg font-semibold">{title}</h3>
          {title === "Starting Lineup" && (
            <PremiumButton onClick={onOptimize}>Optimize</PremiumButton>
          )}
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
                <TableHead className="hidden md:table-cell text-right py-2 md:py-4 text-xs md:text-sm">
                  Games
                </TableHead>
                <TableHead className="text-right py-2 md:py-4 text-xs md:text-sm">
                  Total Pts
                </TableHead>
                <TableHead className="text-right py-2 md:py-4 text-xs md:text-sm">
                  Proj Pts
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
                      projectedPoints={projections[playerId]?.projectedPoints}
                    />
                  ))}
            </TableBody>
          </Table>
        </div>
        {title === "Starting Lineup" && (
          <div className="mt-2 text-right">
            <span className="font-semibold">
              Total Projected Points:{" "}
              {players
                .reduce(
                  (total, playerId) =>
                    total + (projections[playerId]?.projectedPoints || 0),
                  0
                )
                .toFixed(2)}
            </span>
          </div>
        )}
      </div>
    );
  }
);

PlayerTable.displayName = "PlayerTable";

const UserRoster = ({ league }) => {
  const [userRoster, setUserRoster] = useState(null);
  const [playerDetails, setPlayerDetails] = useState({});
  const [playerStats, setPlayerStats] = useState({});
  const [weeklyProjections, setWeeklyProjections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRosterAndPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!league.userRoster || !league.userRoster.owner_id) {
        throw new Error("No line up available");
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

      const [details, stats, projections] = await Promise.all([
        fetchPlayerDetails(allPlayerIds),
        fetchPlayerStats(allPlayerIds, league.scoring_settings),
        fetchWeeklyProjections(allPlayerIds, league.scoring_settings),
      ]);

      setPlayerDetails(details);
      setPlayerStats(stats);
      setWeeklyProjections(projections);
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

  const optimizeLineup = useCallback(() => {
    // ... (keep the existing optimizeLineup function)
  }, [
    userRoster,
    starters,
    bench,
    league.roster_positions,
    playerDetails,
    weeklyProjections,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 overflow-auto h-full pr-2 md:pr-4">
        <PlayerTable
          title="Loading..."
          players={[]}
          positions={[]}
          playerDetails={{}}
          playerStats={{}}
          projections={{}}
          isLoading={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (!userRoster) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">No line up available</p>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="space-y-4 md:space-y-6 overflow-auto h-full pr-2 md:pr-4">
        <PlayerTable
          title="Starting Lineup"
          players={starters}
          positions={league.roster_positions}
          playerDetails={playerDetails}
          playerStats={playerStats}
          projections={weeklyProjections}
          isLoading={isLoading}
          onOptimize={optimizeLineup}
        />
        <PlayerTable
          title="Bench"
          players={bench}
          positions={bench.map(() => "BN")}
          playerDetails={playerDetails}
          playerStats={playerStats}
          projections={weeklyProjections}
          isLoading={isLoading}
        />
      </div>
    </ErrorBoundary>
  );
};

export default UserRoster;
