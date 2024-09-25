import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const formatPosition = (position) => {
  if (position === "SUPER_FLEX") return "SFLX";
  if (position === "IDP_FLEX") return "IDPF";
  if (position === "REC_FLEX") return "RFLX";
  return position;
};

const PlayerRow = React.memo(
  ({ playerId, position, playerDetails, playerStats, projectedPoints }) => {
    const player = playerDetails[playerId] || {};
    const stats = playerStats[playerId] || {};

    return (
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell className="w-[60px] font-medium text-primary">
          {formatPosition(position)}
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
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
              <div className="font-semibold">
                {stats.playerDetails?.name ||
                  player.name ||
                  `Unknown Player (ID: ${playerId})`}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.playerDetails?.team && (
                  <Badge variant="outline" className="mr-1 text-[10px]">
                    {stats.playerDetails.team}
                  </Badge>
                )}
                <span>
                  {stats.playerDetails?.position || "Unknown Position"}
                </span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">{stats.gamesPlayed || 0}</TableCell>
        <TableCell className="text-right font-medium">
          {stats.totalPoints?.toFixed(2) || "0.00"}
        </TableCell>
        <TableCell className="text-right font-medium">
          {projectedPoints?.toFixed(2) || "0.00"}
        </TableCell>
      </TableRow>
    );
  }
);

PlayerRow.displayName = "PlayerRow";

export default PlayerRow;
