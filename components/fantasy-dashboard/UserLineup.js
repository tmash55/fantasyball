import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function UserLineup({ roster, rosterPositions }) {
  const starters = roster.starters || [];
  const players = roster.players || [];
  const bench = players.filter(
    (player) => !starters.some((starter) => starter.id === player.id)
  );

  const renderPlayer = (player, position) => (
    <div key={player.id} className="flex items-center space-x-2 mb-2">
      <Image
        src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`}
        alt={`${player.name}`}
        width={40}
        height={40}
        className="rounded-full"
      />
      <span>{player.name}</span>
      <span className="text-gray-500">{position}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Starting Lineup</CardTitle>
        </CardHeader>
        <CardContent>
          {rosterPositions
            .filter((pos) => pos !== "BN")
            .map(
              (position, index) =>
                starters[index] && renderPlayer(starters[index], position)
            )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bench</CardTitle>
        </CardHeader>
        <CardContent>
          {bench.map((player) => renderPlayer(player, "BN"))}
        </CardContent>
      </Card>
    </div>
  );
}
