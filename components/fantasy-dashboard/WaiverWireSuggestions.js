import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function WaiverWireSuggestions({ leagues }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const fetchSuggestions = async () => {
      // Simulating an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuggestions([
        {
          id: "1",
          playerName: "Rookie WR",
          position: "WR",
          team: "LAR",
          reason: "Emerging as a top target",
        },
        {
          id: "2",
          playerName: "Backup RB",
          position: "RB",
          team: "GB",
          reason: "Starter injured, likely to see increased workload",
        },
        {
          id: "3",
          playerName: "Sleeper TE",
          position: "TE",
          team: "MIA",
          reason: "Consistently increasing target share",
        },
      ]);
    };

    fetchSuggestions();
  }, [leagues]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Waiver Wire Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <ul className="space-y-4">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id} className="border-b pb-2">
                <h3 className="font-semibold">
                  {suggestion.playerName} ({suggestion.position} -{" "}
                  {suggestion.team})
                </h3>
                <p className="text-sm text-muted-foreground">
                  {suggestion.reason}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No waiver wire suggestions available.</p>
        )}
      </CardContent>
    </Card>
  );
}
