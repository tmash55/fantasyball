"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { refreshPlayerDataIfNeeded } from "@/utils/playerData";
import PlayerCard from "./PlayerCard"; // Import the PlayerCard component

const PlayerExposure = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [players, setPlayers] = useState([]);
  const [playerNames, setPlayerNames] = useState({});
  const [playerExposure, setPlayerExposure] = useState({});
  const [playerLeagues, setPlayerLeagues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerLeagues, setSelectedPlayerLeagues] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
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
            userRoster.players.forEach((playerId) => {
              if (!playerCount[playerId]) {
                playerCount[playerId] = 0;
                playerLeaguesMap[playerId] = [];
              }
              playerCount[playerId] += 1;
              playerLeaguesMap[playerId].push({
                name: league.name,
                id: league.league_id,
              });
            });
          }
        }

        console.log("Player Leagues Map:", playerLeaguesMap);

        const playerExposure = {};
        for (const [playerId, count] of Object.entries(playerCount)) {
          playerExposure[playerId] = ((count / totalLeagues) * 100).toFixed(2);
        }

        const sortedPlayers = Object.keys(playerCount).sort(
          (a, b) => playerExposure[b] - playerExposure[a]
        );

        setPlayers(sortedPlayers);
        setPlayerExposure(playerExposure);
        setPlayerLeagues(playerLeaguesMap);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError("Failed to fetch players");
      } finally {
        setLoading(false);
      }
    };

    const fetchAndSetPlayerNames = async () => {
      const playerData = await refreshPlayerDataIfNeeded();
      if (playerData) {
        const playerNamesMap = {};
        for (const [playerId, playerInfo] of Object.entries(playerData)) {
          playerNamesMap[playerId] = playerInfo.full_name;
        }
        setPlayerNames(playerNamesMap);
      }
    };

    if (username) {
      fetchPlayers();
      fetchAndSetPlayerNames();
    }
  }, [username]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handlePlayerClick = (playerId) => {
    const playerData = {
      first_name: playerNames[playerId].split(" ")[0],
      last_name: playerNames[playerId].split(" ").slice(1).join(" "),
      id: playerId,
      leagues: playerLeagues[playerId],
      // Add other necessary player properties here
    };
    setSelectedPlayer(playerData);
    setSelectedPlayerLeagues(playerLeagues[playerId]);
    document.getElementById(`player_modal_${playerId}`).showModal();
  };

  return (
    <div>
      <Link
        href={`/dashboard/leagues?username=${username}`}
        className="link flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icon-tabler-arrow-left"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 12l14 0" />
          <path d="M5 12l6 6" />
          <path d="M5 12l6 -6" />
        </svg>
        League List
      </Link>
      <h1 className="text-2xl font-bold mb-4 uppercase">
        Player Exposure for {username}
      </h1>
      <table className="min-w-full table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Exposure (%)</th>
            <th>Leagues</th>
          </tr>
        </thead>
        <tbody>
          {players.map((playerId, index) => (
            <tr key={index} className="hover">
              <td>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => handlePlayerClick(playerId)}
                >
                  {playerNames[playerId] || playerId}
                </span>
              </td>
              <td>{playerExposure[playerId]}%</td>
              <td>
                {playerLeagues[playerId] &&
                  playerLeagues[playerId].map((league, idx) => (
                    <span key={idx}>
                      <Link
                        href={`/dashboard/leagues/${league.id}?username=${username}`}
                        className="hover:underline hover:text-primary"
                      >
                        {league.name}
                      </Link>
                      {idx < playerLeagues[playerId].length - 1 ? ", " : ""}
                    </span>
                  ))}
              </td>
              <dialog id={`player_modal_${playerId}`} className="modal">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">Player Details</h3>
                  {selectedPlayer && (
                    <PlayerCard
                      player={selectedPlayer}
                      leagues={selectedPlayerLeagues}
                    />
                  )}
                  <div className="modal-action">
                    <form method="dialog">
                      <button className="btn">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerExposure;
