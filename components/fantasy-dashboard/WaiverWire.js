import React, { useState, useEffect } from "react";
import { fetchWaiverWirePlayers, fetchPlayerStats } from "@/libs/sleeper";
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
import { motion } from "framer-motion";

const WaiverWire = (league) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const waiverPlayers = await fetchWaiverWirePlayers(league);
        const playersWithStats = await Promise.all(
          waiverPlayers.map(async (player) => {
            const stats = await fetchPlayerStats(player.player_id);
            return { ...player, stats };
          })
        );
        setPlayers(playersWithStats);
        setFilteredPlayers(playersWithStats);
      } catch (error) {
        console.error("Error fetching waiver wire players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const filtered = players.filter((player) => {
      const nameMatch = player.full_name
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
            <AvatarFallback>{player.full_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{player.full_name}</div>
            <div className="text-sm text-muted-foreground">
              {player.team} - {player.position}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>{player.stats.pts_ppr.toFixed(2)}</TableCell>
      <TableCell>{player.stats.pts_half_ppr.toFixed(2)}</TableCell>
      <TableCell>{player.stats.pts_std.toFixed(2)}</TableCell>
      <TableCell>
        <Button onClick={() => addToComparison(player)}>Compare</Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div>
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle>Waiver Wire</CardTitle>
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
                  <TableHead>PPR</TableHead>
                  <TableHead>Half PPR</TableHead>
                  <TableHead>Standard</TableHead>
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
    </div>
  );
};

const TrendAnalysis = ({ playerId }) => {
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    // Fetch trend data for the player
    // This is a placeholder and should be replaced with actual API calls
    setTrend([10, 15, 12, 18, 20]);
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
            <CardTitle>{player.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>PPR: {player.stats.pts_ppr.toFixed(2)}</p>
            <p>Half PPR: {player.stats.pts_half_ppr.toFixed(2)}</p>
            <p>Standard: {player.stats.pts_std.toFixed(2)}</p>
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
              <TableHead>PPR</TableHead>
              <TableHead>Half PPR</TableHead>
              <TableHead>Standard</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchlistPlayers.map((player) => (
              <TableRow key={player.player_id}>
                <TableCell>{player.full_name}</TableCell>
                <TableCell>{player.stats.pts_ppr.toFixed(2)}</TableCell>
                <TableCell>{player.stats.pts_half_ppr.toFixed(2)}</TableCell>
                <TableCell>{player.stats.pts_std.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WaiverWire;
