"use client";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { refreshPlayerDataIfNeeded } from "@/utils/playerData";
import { createClient } from "@supabase/supabase-js";
import Table from "./TeamTable"; // Import the Table component
import TeamTable from "./TeamTable";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const stripSuffix = (name) => {
  return name.replace(/( Jr\.| Sr\.)$/, "");
};

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

        const { data: adpData, error: adpError } = await supabase
          .from("Underdog_Redraft_ADP_2023")
          .select("adp, positionRank")
          .eq("firstName", firstName)
          .ilike("lastName", lastName)
          .single();

        if (adpError) {
          console.error(
            `Error fetching ADP for ${firstName} ${lastName}:`,
            adpError
          );
          adpMap[player.id] = {
            adp: "Unknown ADP",
            positionRank: "Unknown Rank",
            dynastyValue: "Unknown",
          };
        } else {
          console.log(`Fetched ADP for ${firstName} ${lastName}:`, adpData);
          const strippedLastName = stripSuffix(lastName);
          const { data: dynastyData, error: dynastyError } = await supabase

            .from("ktc_test")
            .select("sf_value, age, sf_position_rank")
            .eq("first_name", firstName)
            .ilike("last_name", `%${strippedLastName}%`)
            .order("date", { ascending: false })
            .single()
            .limit(1);

          if (dynastyError) {
            console.error(
              `Error fetching Dynasty value for ${firstName} ${lastName}:`,
              dynastyError
            );
            adpMap[player.id] = {
              adp: adpData.adp,
              positionRank: adpData.positionRank,
              dynastyValue: "Unknown",
            };
          } else {
            console.log(
              `Fetched Dynasty value for ${firstName} ${lastName}:`,
              dynastyData
            );
            adpMap[player.id] = {
              adp: adpData.adp,
              positionRank: adpData.positionRank,
              dynastyValue: dynastyData.sf_value,
            };
          }
        }
      } else {
        console.log(`Player with ID ${player.id} not found`);
        adpMap[player.id] = {
          adp: "-",
          positionRank: "-",
          dynastyValue: "-",
        };
      }
    }

    setPlayerAdps(adpMap);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!players || players.length === 0) {
    return <p>No roster found for user in league</p>;
  }

  return (
    <div className="flex flex-wrap gap-16 justify-center">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-center pt-8">
          {searchParams.get("username")}`s Roster
        </h1>
      </div>

      <div className="w-full lg:w-1/3 ">
        <TeamTable players={players} position="RB" playerAdps={playerAdps} />
      </div>
      <div className="w-full lg:w-1/3 ">
        <TeamTable players={players} position="WR" playerAdps={playerAdps} />
      </div>
      <div className="w-full lg:w-1/3 ">
        <TeamTable players={players} position="QB" playerAdps={playerAdps} />
      </div>
      <div className="w-full lg:w-1/3 ">
        <TeamTable players={players} position="TE" playerAdps={playerAdps} />
      </div>
    </div>
  );
};

export default MyTeam;
