import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export default function RecentPlayerNews({ leagues }) {
  const [news, setNews] = useState([]);

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const fetchNews = async () => {
      // Simulating an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNews([
        {
          id: "1",
          playerName: "Patrick Mahomes",
          team: "KC",
          news: "Threw for 300 yards and 3 TDs",
          date: "2023-09-10",
        },
        {
          id: "2",
          playerName: "Christian McCaffrey",
          team: "SF",
          news: "Rushed for 120 yards and 2 TDs",
          date: "2023-09-10",
        },
        {
          id: "3",
          playerName: "Justin Jefferson",
          team: "MIN",
          news: "Caught 10 passes for 150 yards",
          date: "2023-09-10",
        },
      ]);
    };

    fetchNews();
  }, [leagues]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Recent Player News
        </CardTitle>
      </CardHeader>
      <CardContent>
        {news.length > 0 ? (
          <ul className="space-y-4">
            {news.map((item) => (
              <li key={item.id} className="border-b pb-2">
                <h3 className="font-semibold">
                  {item.playerName} ({item.team})
                </h3>
                <p className="text-sm text-muted-foreground">{item.news}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.date}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent news available.</p>
        )}
      </CardContent>
    </Card>
  );
}
