import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale } from "lucide-react";

export default function TradeAnalyzer({ leagues }) {
  const [team1Players, setTeam1Players] = useState("");
  const [team2Players, setTeam2Players] = useState("");
  const [analysis, setAnalysis] = useState("");

  const handleAnalyze = () => {
    // In a real application, you would send this data to an API for analysis
    setAnalysis(
      "Based on current player projections, this trade appears to be fairly balanced. Team 1 gains slight value in the short term, while Team 2 may benefit more in the long run."
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Trade Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="team1">Team 1 Players</Label>
            <Input
              id="team1"
              value={team1Players}
              onChange={(e) => setTeam1Players(e.target.value)}
              placeholder="Enter player names, comma separated"
            />
          </div>
          <div>
            <Label htmlFor="team2">Team 2 Players</Label>
            <Input
              id="team2"
              value={team2Players}
              onChange={(e) => setTeam2Players(e.target.value)}
              placeholder="Enter player names, comma separated"
            />
          </div>
          <Button type="submit">Analyze Trade</Button>
        </form>
        {analysis && (
          <div className="mt-4">
            <h3 className="font-semibold">Analysis:</h3>
            <p className="text-sm mt-2">{analysis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
