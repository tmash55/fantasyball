"use client";

import React, { useState, useEffect } from "react";
import {
  fetchWaiverWirePlayers,
  fetchPlayerStats,
  fetchLeagueRosters,
  getCurrentNFLWeek,
  getPlayerInfo,
} from "@/libs/sleeper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const WaiverWire = ({ leagueId }) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [rankings, setRankings] = useState({
    overall: [],
    QB: [],
    RB: [],
    WR: [],
    TE: [],
  });
  const [currentWeek, setCurrentWeek] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const week = await getCurrentNFLWeek();
        setCurrentWeek(week);

        const leagueRosters = await fetchLeagueRosters(leagueId);
        const rosteredPlayerIds = leagueRosters.flatMap(
          (roster) => roster.players
        );
        const allPlayers = await fetchWaiverWirePlayers(leagueId);
        const availablePlayers = allPlayers.filter(
          (player) => !rosteredPlayerIds.includes(player.player_id)
        );

        const playersWithStats = await Promise.all(
          availablePlayers.map(async (player) => {
            const stats = await fetchPlayerStats([player.player_id], {}, "PPR");
            const info = await getPlayerInfo(player.player_id);
            return { ...player, ...info, stats: stats[player.player_id] };
          })
        );

        setPlayers(playersWithStats);
        setFilteredPlayers(playersWithStats);

        // Calculate rankings
        const overallRankings = [...playersWithStats].sort(
          (a, b) => b.stats.totalPoints - a.stats.totalPoints
        );
        const positionRankings = {
          QB: [...playersWithStats.filter((p) => p.position === "QB")].sort(
            (a, b) => b.stats.totalPoints - a.stats.totalPoints
          ),
          RB: [...playersWithStats.filter((p) => p.position === "RB")].sort(
            (a, b) => b.stats.totalPoints - a.stats.totalPoints
          ),
          WR: [...playersWithStats.filter((p) => p.position === "WR")].sort(
            (a, b) => b.stats.totalPoints - a.stats.totalPoints
          ),
          TE: [...playersWithStats.filter((p) => p.position === "TE")].sort(
            (a, b) => b.stats.totalPoints - a.stats.totalPoints
          ),
        };

        setRankings({
          overall: overallRankings.slice(0, 20),
          ...Object.fromEntries(
            Object.entries(positionRankings).map(([pos, players]) => [
              pos,
              players.slice(0, 10),
            ])
          ),
        });
      } catch (error) {
        console.error("Error fetching waiver wire players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [leagueId]);

  useEffect(() => {
    const filtered = players.filter((player) => {
      const nameMatch = player.player_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const positionMatch =
        positionFilter === "" || player.position === positionFilter;
      return nameMatch && positionMatch;
    });
    setFilteredPlayers(filtered);
  }, [searchTerm, positionFilter, players]);

  const toggleWatchlist = (playerId) => {
    setWatchlist((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const addToComparison = (player) => {
    if (selectedPlayers.length < 3) {
      setSelectedPlayers((prev) => [...prev, player]);
    }
  };

  const renderPlayerRow = (player) => (
    <TableRow key={player.player_id}>
      <TableCell>
        <Checkbox
          checked={watchlist.includes(player.player_id)}
          onCheckedChange={() => toggleWatchlist(player.player_id)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`}
            />
            <AvatarFallback>{player.player_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{player.player_name}</div>
            <div className="text-sm text-muted-foreground">
              {player.team} - {player.position}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>{player.stats.totalPoints.toFixed(2)}</TableCell>
      <TableCell>{player.stats.averagePoints.toFixed(2)}</TableCell>
      <TableCell>{player.stats.gamesPlayed}</TableCell>
      <TableCell>
        <Button onClick={() => addToComparison(player)}>Compare</Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div>
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle>Waiver Wire - Week {currentWeek}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="border rounded p-2"
            >
              <option value="">All Positions</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
            </select>
          </div>
          {loading ? (
            <div>Loading waiver wire players...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Watch</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Total Points</TableHead>
                  <TableHead>Avg Points</TableHead>
                  <TableHead>Games Played</TableHead>
                  <TableHead>Compare</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{filteredPlayers.map(renderPlayerRow)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Watchlist playerIds={watchlist} players={players} />

      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Player Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerComparison players={selectedPlayers} />
        </CardContent>
      </Card>

      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Waiver Wire Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overall">
            <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="QB">QB</TabsTrigger>
              <TabsTrigger value="RB">RB</TabsTrigger>
              <TabsTrigger value="WR">WR</TabsTrigger>
              <TabsTrigger value="TE">TE</TabsTrigger>
            </TabsList>
            <TabsContent value="overall">
              <RankingTable players={rankings.overall} />
            </TabsContent>
            <TabsContent value="QB">
              <RankingTable players={rankings.QB} />
            </TabsContent>
            <TabsContent value="RB">
              <RankingTable players={rankings.RB} />
            </TabsContent>
            <TabsContent value="WR">
              <RankingTable players={rankings.WR} />
            </TabsContent>
            <TabsContent value="TE">
              <RankingTable players={rankings.TE} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const TrendAnalysis = ({ playerId }) => {
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    const fetchTrend = async () => {
      // This is where you would fetch the trend data for the player
      // For now, we'll use dummy data
      setTrend([10, 15, 12, 18, 20]);
    };

    fetchTrend();
  }, [playerId]);

  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold">Points Trend</h4>
      {trend.map((point, index) => (
        <div
          key={index}
          style={{
            width: `${point * 5}px`,
            height: "10px",
            backgroundColor: "blue",
            marginBottom: "2px",
          }}
        />
      ))}
    </div>
  );
};

const PlayerComparison = ({ players }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {players.map((player) => (
        <Card key={player.player_id}>
          <CardHeader>
            <CardTitle>{player.player_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Points: {player.stats.totalPoints.toFixed(2)}</p>
            <p>Avg Points: {player.stats.averagePoints.toFixed(2)}</p>
            <p>Games Played: {player.stats.gamesPlayed}</p>
            <TrendAnalysis playerId={player.player_id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const Watchlist = ({ playerIds, players }) => {
  const watchlistPlayers = players.filter((player) =>
    playerIds.includes(player.player_id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Total Points</TableHead>
              <TableHead>Avg Points</TableHead>
              <TableHead>Games Played</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchlistPlayers.map((player) => (
              <TableRow key={player.player_id}>
                <TableCell>{player.player_name}</TableCell>
                <TableCell>{player.stats.totalPoints.toFixed(2)}</TableCell>
                <TableCell>{player.stats.averagePoints.toFixed(2)}</TableCell>
                <TableCell>{player.stats.gamesPlayed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const RankingTable = ({ players }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Total Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player, index) => (
          <TableRow key={player.player_id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{player.player_name}</TableCell>
            <TableCell>{player.position}</TableCell>
            <TableCell>{player.team}</TableCell>
            <TableCell>{player.stats.totalPoints.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default WaiverWire;
