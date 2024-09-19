import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function UpcomingMatchups({ leagues }) {
  const [matchups, setMatchups] = useState([]);

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const fetchMatchups = async () => {
      // Simulating an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMatchups(
        leagues.map((league, index) => ({
          id: `${index}`,
          leagueName: league.name,
          opponent: `Team ${index + 1}`,
          date: "2023-09-17",
        }))
      );
    };

    fetchMatchups();
  }, [leagues]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Matchups
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matchups.length > 0 ? (
          <ul className="space-y-4">
            {matchups.map((matchup) => (
              <li key={matchup.id} className="border-b pb-2">
                <h3 className="font-semibold">{matchup.leagueName}</h3>
                <p className="text-sm">vs {matchup.opponent}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {matchup.date}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming matchups available.</p>
        )}
      </CardContent>
    </Card>
  );
}
