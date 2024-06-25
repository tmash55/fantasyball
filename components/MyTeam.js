"use client";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { refreshPlayerDataIfNeeded } from "@/utils/playerData";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MyTeam = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [players, setPlayers] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [playerAdps, setPlayerAdps] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const username = searchParams.get("username");
      const leagueId = pathname.split("/")[3];

      if (username && leagueId) {
        const playerData = await refreshPlayerDataIfNeeded();
        setPlayerData(playerData);

        fetchUserData(username, leagueId, playerData);
      }
    };

    fetchData();
  }, [searchParams, pathname]);

  const fetchUserData = async (username, leagueId, playerData) => {
    try {
      const userResponse = await fetch(
        `https://api.sleeper.app/v1/user/${username}`
      );
      const userData = await userResponse.json();

      fetchRosterData(userData.user_id, leagueId, playerData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const fetchRosterData = async (userId, leagueId, playerData) => {
    try {
      const response = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/rosters`
      );
      const data = await response.json();

      const userRoster = data.find((roster) => roster.owner_id === userId);
      if (userRoster) {
        const playerDetails = userRoster.players.map((playerId) => ({
          id: playerId,
          name: playerData[playerId]?.full_name || "Unknown",
          position: playerData[playerId]?.position || "Unknown",
        }));
        setPlayers(playerDetails);
        fetchPlayerAdps(playerDetails, playerData);
      } else {
        setPlayers([]);
      }
    } catch (error) {
      console.error("Error fetching roster data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerAdps = async (playerDetails, playerData) => {
    const adpMap = {};

    for (let player of playerDetails) {
      if (player.name !== "Unknown") {
        const [firstName, lastName] = player.name.split(" ");
        console.log("Fetching ADP for:", firstName, lastName);

        const { data: adpData, error } = await supabase
          .from("adp_rankings_2024_June")
          .select("adp, positionRank")
          .eq("firstName", firstName)
          .ilike("lastName", `%${lastName}%`)
          .single();

        if (error) {
          console.error(
            `Error fetching ADP for ${firstName} ${lastName}:`,
            error
          );
          adpMap[player.id] = {
            adp: "Unknown ADP",
            positionRank: "Unknown Rank",
          };
        } else {
          console.log(`Fetched ADP for ${firstName} ${lastName}:`, adpData);
          adpMap[player.id] = {
            adp: adpData.adp,
            positionRank: adpData.positionRank,
          };
        }
      } else {
        console.log(`Player with ID ${player.id} not found`);
        adpMap[player.id] = {
          adp: "-",
          positionRank: "-",
        };
      }
    }

    setPlayerAdps(adpMap);
  };

  const renderTable = (players, position) => {
    const filteredPlayers = players
      .filter((player) => player.position === position)
      .sort((a, b) => {
        const rankA = parseFloat(playerAdps[a.id]?.adp) || Infinity;
        const rankB = parseFloat(playerAdps[b.id]?.adp) || Infinity;
        return rankA - rankB;
      });

    return (
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">{position}</h2>
        <table className="min-w-full text-slate-50 border rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Player</th>
              <th className="py-2 px-4 border-b">Position Rank</th>
              <th className="py-2 px-4 border-b">UD ADP</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => {
              const positionRank = playerAdps[player.id]?.positionRank || "-";
              const rankNumber =
                parseFloat(positionRank.replace(/^[A-Z]+/, "")) || Infinity;

              const getRowClass = (rankNumber) => {
                if (rankNumber >= 1 && rankNumber <= 12) {
                  return "bg-[#007f5f]";
                } else if (rankNumber >= 13 && rankNumber <= 24) {
                  return "bg-[#2b9348]";
                } else if (rankNumber >= 25 && rankNumber <= 36) {
                  return "bg-[#55a630]";
                } else if (rankNumber >= 37 && rankNumber <= 48) {
                  return "bg-[#80b918]";
                } else if (rankNumber >= 49 && rankNumber <= 60) {
                  return "bg-[#dad7cd]";
                } else if (rankNumber >= 61 && rankNumber <= 72) {
                  return "bg-[#FFCA28]";
                } else {
                  return "bg-[#333533]";
                }
              };

              return (
                <tr key={player.id} className={getRowClass(rankNumber)}>
                  <td className="py-2 px-4 border-b">{player.name}</td>
                  <td className="py-2 px-4 border-b">{positionRank}</td>
                  <td className="py-2 px-4 border-b">
                    {playerAdps[player.id]?.adp || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!players || players.length === 0) {
    return <p>No roster found for user in league</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {searchParams.get("username")}`s Roster
      </h1>
      {renderTable(players, "QB")}
      {renderTable(players, "RB")}
      {renderTable(players, "WR")}
      {renderTable(players, "TE")}
    </div>
  );
};

export default MyTeam;
