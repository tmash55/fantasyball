import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LeagueRankings = ({ league }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Record</TableHead>
          <TableHead>PF</TableHead>
          <TableHead>PA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {league.rosters
          .sort((a, b) => (b.settings?.wins || 0) - (a.settings?.wins || 0))
          .map((roster, index) => (
            <TableRow
              key={roster.roster_id}
              className={
                roster.owner_id === league.userRoster.owner_id
                  ? "font-bold"
                  : ""
              }
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://sleepercdn.com/avatars/${roster.avatar}`}
                    />
                    <AvatarFallback>
                      {roster.username ? roster.username[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{roster.username || `Team ${roster.roster_id}`}</span>
                </div>
              </TableCell>
              <TableCell>{`${roster.settings?.wins || 0}-${
                roster.settings?.losses || 0
              }`}</TableCell>
              <TableCell>
                {roster.settings?.fpts?.toFixed(2) || "0.00"}
              </TableCell>
              <TableCell>
                {roster.settings?.fpts_against?.toFixed(2) || "0.00"}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default LeagueRankings;
