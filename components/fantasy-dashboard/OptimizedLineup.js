import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for demonstration
const mockOptimizedLineup = [
  { id: 1, position: "QB", player: "Josh Allen", projectedPoints: 22.7 },
  {
    id: 2,
    position: "RB1",
    player: "Christian McCaffrey",
    projectedPoints: 20.5,
  },
  { id: 3, position: "RB2", player: "Austin Ekeler", projectedPoints: 18.3 },
  { id: 4, position: "WR1", player: "Justin Jefferson", projectedPoints: 19.8 },
  { id: 5, position: "WR2", player: "Ja'Marr Chase", projectedPoints: 17.2 },
  { id: 6, position: "TE", player: "Mark Andrews", projectedPoints: 14.6 },
  { id: 7, position: "FLEX", player: "Deebo Samuel", projectedPoints: 15.9 },
  { id: 8, position: "K", player: "Harrison Butker", projectedPoints: 9.2 },
  {
    id: 9,
    position: "DEF",
    player: "San Francisco 49ers",
    projectedPoints: 8.5,
  },
];

export default function OptimizedLineup() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimized Lineup</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Projected Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOptimizedLineup.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.position}</TableCell>
                <TableCell>{player.player}</TableCell>
                <TableCell>{player.projectedPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
