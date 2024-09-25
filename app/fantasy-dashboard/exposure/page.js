"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { fetchPlayerNames } from "@/libs/sleeper";

export default function ExposurePage() {
  const [players, setPlayers] = useState([]);
  const [playerExposure, setPlayerExposure] = useState({});
  const [playerLeagues, setPlayerLeagues] = useState({});
  const [playerNames, setPlayerNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPlayers, setExpandedPlayers] = useState({});
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;

      try {
        setLoading(true);
        setError(null);

        const userResponse = await axios.get(
          `https://api.sleeper.app/v1/user/${username}`
        );
        const userId = userResponse.data.user_id;
        const sport = "nfl";
        const season = "2024";
        const leaguesResponse = await axios.get(
          `https://api.sleeper.app/v1/user/${userId}/leagues/${sport}/${season}`
        );

        const leagues = leaguesResponse.data;
        const totalLeagues = leagues.length;
        const playerCount = {};
        const playerLeaguesMap = {};

        for (const league of leagues) {
          const rostersResponse = await axios.get(
            `https://api.sleeper.app/v1/league/${league.league_id}/rosters`
          );
          const rosters = rostersResponse.data;

          const userRoster = rosters.find(
            (roster) => roster.owner_id === userId
          );

          if (userRoster && userRoster.players) {
            const leagueType =
              league.settings.type === 0
                ? "Redraft"
                : league.settings.type === 1
                ? "Keeper"
                : "Dynasty";

            userRoster.players.forEach((playerId) => {
              if (!playerCount[playerId]) {
                playerCount[playerId] = {
                  total: 0,
                  Redraft: 0,
                  Keeper: 0,
                  Dynasty: 0,
                };
                playerLeaguesMap[playerId] = [];
              }
              playerCount[playerId].total += 1;
              playerCount[playerId][leagueType] += 1;
              playerLeaguesMap[playerId].push({
                name: league.name,
                id: league.league_id,
                type: leagueType,
              });
            });
          }
        }

        const playerExposure = {};
        for (const [playerId, counts] of Object.entries(playerCount)) {
          playerExposure[playerId] = {
            total: (counts.total / totalLeagues) * 100,
            Redraft: (counts.Redraft / totalLeagues) * 100,
            Keeper: (counts.Keeper / totalLeagues) * 100,
            Dynasty: (counts.Dynasty / totalLeagues) * 100,
          };
        }

        const sortedPlayers = Object.keys(playerCount).sort(
          (a, b) => playerExposure[b].total - playerExposure[a].total
        );

        setPlayers(sortedPlayers);
        setPlayerExposure(playerExposure);
        setPlayerLeagues(playerLeaguesMap);

        const names = await fetchPlayerNames(sortedPlayers);
        setPlayerNames(names);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const filteredPlayers = players.filter((playerId) =>
    playerNames[playerId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePlayerExpansion = (playerId) => {
    setExpandedPlayers((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  if (!username) {
    return <div>Please provide a username to view exposure data.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading exposure data...</span>
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Player Exposure for {username}</h1>
      <Input
        type="text"
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Card>
        <CardHeader>
          <CardTitle>Top Players by Exposure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span>Redraft</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span>Keeper</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Dynasty</span>
            </div>
          </div>
          <div className="space-y-4">
            {filteredPlayers.map((playerId) => (
              <Collapsible
                key={playerId}
                open={expandedPlayers[playerId]}
                onOpenChange={() => togglePlayerExpansion(playerId)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-primary-content rounded-lg transition-colors duration-200">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-1/4 font-medium truncate">
                      {playerNames[playerId] || `Unknown (${playerId})`}
                    </div>
                    <div className="w-1/2 h-4 bg-secondary rounded-full overflow-hidden flex">
                      <div
                        className="bg-red-500 h-full"
                        style={{
                          width: `${playerExposure[playerId].Redraft}%`,
                        }}
                        title={`Redraft: ${playerExposure[
                          playerId
                        ].Redraft.toFixed(1)}%`}
                      />
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${playerExposure[playerId].Keeper}%` }}
                        title={`Keeper: ${playerExposure[
                          playerId
                        ].Keeper.toFixed(1)}%`}
                      />
                      <div
                        className="bg-green-500 h-full"
                        style={{
                          width: `${playerExposure[playerId].Dynasty}%`,
                        }}
                        title={`Dynasty: ${playerExposure[
                          playerId
                        ].Dynasty.toFixed(1)}%`}
                      />
                    </div>
                    <div className="w-1/4 text-right">
                      {playerExposure[playerId].total.toFixed(1)}%
                    </div>
                  </div>
                  {expandedPlayers[playerId] ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-4 bg-primary-content rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Exposure Breakdown:
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {["Redraft", "Keeper", "Dynasty"].map((type) => (
                          <div
                            key={type}
                            className="flex flex-col items-center p-2 bg-background rounded-md"
                          >
                            <span className="text-sm font-medium">{type}</span>
                            <span className="text-lg font-bold">
                              {playerExposure[playerId][type].toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Rostered in:</h4>
                      <div className="space-y-2">
                        {playerLeagues[playerId].map((league) => (
                          <div
                            key={league.id}
                            className="flex justify-between items-center p-2 bg-background rounded-md"
                          >
                            <span className="text-sm font-medium">
                              {league.name}
                            </span>
                            <span className="text-xs px-2 py-1 bg-base-100 text-primary-foreground rounded-full">
                              {league.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
