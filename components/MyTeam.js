import { useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import TeamTable from "./TeamTable";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { refreshPlayerDataIfNeeded } from "@/utils/playerData";
import supabase from "@/lib/supabaseClient";

const stripSuffix = (name) => {
  return name.replace(/( Jr\.| Sr\.)$/, "");
};

const fetchUserData = async (username) => {
  const response = await fetch(`https://api.sleeper.app/v1/user/${username}`);
  if (!response.ok) {
    throw new Error("Error fetching user data");
  }
  return response.json();
};

const fetchRosterData = async (userId, leagueId) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/rosters`
  );
  if (!response.ok) {
    throw new Error("Error fetching roster data");
  }
  const data = await response.json();
  const userRoster = data.find((roster) => roster.owner_id === userId);
  return userRoster ? userRoster.players : [];
};

const fetchAdpData = async (firstName, lastName) => {
  const { data, error } = await supabase
    .from("Underdog_Redraft_ADP_2023")
    .select("adp, positionRank")
    .eq("firstName", firstName)
    .ilike("lastName", lastName)
    .single();

  if (error) {
    throw new Error(`Error fetching ADP: ${error.message}`);
  }

  return data;
};

const fetchDynastyData = async (firstName, lastName) => {
  const strippedLastName = stripSuffix(lastName);

  const { data, error } = await supabase
    .from("ktc_test")
    .select("sf_value, age, sf_position_rank")
    .eq("first_name", firstName)
    .ilike("last_name", `%${strippedLastName}%`)
    .order("date", { ascending: false })
    .single()
    .limit(1);

  if (error) {
    throw new Error(`Error fetching Dynasty value: ${error.message}`);
  }

  return data;
};

const MyTeam = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [players, setPlayers] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [playerAdps, setPlayerAdps] = useState({});
  const username = searchParams.get("username");
  const leagueId = pathname.split("/")[3];

  useEffect(() => {
    const fetchData = async () => {
      if (username && leagueId) {
        const playerData = await refreshPlayerDataIfNeeded();
        setPlayerData(playerData);
      }
    };

    fetchData();

    // Invalidate queries when searchParams or pathname change
    queryClient.invalidateQueries(["userData", username]);
    queryClient.invalidateQueries(["rosterData", username, leagueId]);
    queryClient.invalidateQueries(["playerData"]);
  }, [searchParams, pathname, queryClient, username, leagueId]);

  // Fetch user data using useQuery
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["userData", username],
    queryFn: () => fetchUserData(username),
    enabled: !!username, // only run if username is available
    staleTime: 0, // data is fresh only at the time of request
  });

  // Fetch roster data using useQuery
  const {
    data: rosterPlayerIds,
    isLoading: isRosterLoading,
    isError: isRosterError,
  } = useQuery({
    queryKey: ["rosterData", userData?.user_id, leagueId],
    queryFn: () => fetchRosterData(userData.user_id, leagueId),
    enabled: !!userData?.user_id && !!leagueId, // only run if user_id and leagueId are available
    staleTime: 0, // data is fresh only at the time of request
  });

  // Fetch ADP and Dynasty data for each player using useQueries
  const playerQueries = useQueries({
    queries: (rosterPlayerIds || []).map((playerId) => {
      const playerName = playerData[playerId]?.full_name || "Unknown";
      const [firstName, lastName] = playerName.split(" ") || ["Unknown", ""];

      return {
        queryKey: ["playerData", playerId],
        queryFn: async () => {
          if (playerName === "Unknown") {
            return {
              adp: "-",
              positionRank: "-",
              dynastyValue: "-",
            };
          }

          const adpData = await fetchAdpData(firstName, lastName);
          const dynastyData = await fetchDynastyData(firstName, lastName);

          return {
            adp: adpData.adp,
            positionRank: adpData.positionRank,
            dynastyValue: dynastyData.sf_value,
          };
        },
        enabled: !!playerId && playerName !== "Unknown", // only run if playerId is valid
        staleTime: 0, // data is fresh only at the time of request
      };
    }),
  });

  useEffect(() => {
    // Check if rosterPlayerIds and playerData are available
    if (rosterPlayerIds && playerData) {
      const playerDetails = rosterPlayerIds.map((playerId) => ({
        id: playerId,
        name: playerData[playerId]?.full_name || "Unknown",
        position: playerData[playerId]?.position || "Unknown",
      }));

      // Update the players state if playerDetails is different from current state
      if (JSON.stringify(playerDetails) !== JSON.stringify(players)) {
        setPlayers(playerDetails);
      }

      const adpMap = {};
      playerQueries.forEach((query, index) => {
        const playerId = rosterPlayerIds[index];
        adpMap[playerId] = query.data || {
          adp: "Unknown ADP",
          positionRank: "Unknown Rank",
          dynastyValue: "Unknown",
        };
      });

      // Update the playerAdps state if adpMap is different from current state
      if (JSON.stringify(adpMap) !== JSON.stringify(playerAdps)) {
        setPlayerAdps(adpMap);
      }
    }
  }, [rosterPlayerIds, playerQueries, playerData]);

  if (isUserLoading || isRosterLoading) {
    return <p>Loading...</p>;
  }

  if (isUserError || isRosterError) {
    return <p>Error loading data</p>;
  }

  if (!players || players.length === 0) {
    return <p>No roster found for user in league</p>;
  }

  return (
    <div className="flex flex-wrap gap-16 justify-center">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-center pt-8">
          {username}`s Roster
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
