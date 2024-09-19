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
const mockProjections = [
  { id: 1, player: "Patrick Mahomes", position: "QB", projectedPoints: 24.5 },
  { id: 2, player: "Derrick Henry", position: "RB", projectedPoints: 18.2 },
  { id: 3, player: "Davante Adams", position: "WR", projectedPoints: 16.8 },
  { id: 4, player: "Travis Kelce", position: "TE", projectedPoints: 15.3 },
  { id: 5, player: "Justin Tucker", position: "K", projectedPoints: 9.5 },
];

export default function WeeklyProjections() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Projections</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Projected Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProjections.map((projection) => (
              <TableRow key={projection.id}>
                <TableCell>{projection.player}</TableCell>
                <TableCell>{projection.position}</TableCell>
                <TableCell>{projection.projectedPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
