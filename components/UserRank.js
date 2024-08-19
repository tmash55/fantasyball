import React, { useEffect } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { fetchUsername } from "../utils/helpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const stripSuffix = (name) => {
  return name.replace(/( Jr\.| Sr\.)$/, "");
};

const fetchPlayerDataFromDatabase = async (playerId) => {
  if (playerId === 0) return null; // Skip invalid playerId
  const { data, error } = await supabase
    .from("sleeper_players")
    .select("*")
    .eq("player_id", playerId)
    .single();

  if (error || !data) {
    console.error(
      `Error fetching player data for player_id ${playerId}:`,
      error
    );
    return null;
  }

  return data;
};

const fetchAdpData = async (firstName, lastName) => {
  const { data, error } = await supabase
    .from("Underdog_Redraft_ADP_2023")
    .select("adp")
    .eq("firstName", firstName)
    .ilike("lastName", `%${lastName}%`)
    .single();

  if (error || !data) {
    return null;
  }

  return data.adp;
};

const fetchsfValue = async (firstName, strippedLastName) => {
  const { data, error } = await supabase
    .from("ktc_test")
    .select("sf_value")
    .ilike("first_name", firstName)
    .ilike("last_name", `%${strippedLastName}%`)
    .order("date", { ascending: false })
    .single()
    .limit(1);

  if (error || !data) {
    return null;
  }

  return data.sf_value;
};

const fetchAndCalculateRanks = async ({ queryKey }) => {
  const [_, leagueId, username] = queryKey;

  try {
    const leagueResponse = await axios.get(
      `https://api.sleeper.app/v1/league/${leagueId}`
    );
    const leagueStatus = leagueResponse.data.status;

    if (leagueStatus === "pre_draft") {
      return { dynastyRank: "N/A", adpRank: "N/A" };
    }

    const rostersResponse = await axios.get(
      `https://api.sleeper.app/v1/league/${leagueId}/rosters`
    );
    const rosters = rostersResponse.data;

    let teamValues = [];
    let teamAdps = [];

    await Promise.all(
      rosters.map(async (roster) => {
        const ownerId = roster.owner_id;
        const ownerUsername = await fetchUsername(ownerId);

        let totalValueSum = 0;
        let totalAdpSum = 0;

        await Promise.all(
          roster.starters.map(async (starterId) => {
            if (starterId === 0) return;

            const player = await fetchPlayerDataFromDatabase(starterId);

            if (player) {
              const { first_name: firstName, last_name: lastName } = player;
              const strippedLastName = stripSuffix(lastName);

              const [adp, sfValue] = await Promise.all([
                fetchAdpData(firstName, lastName),
                fetchsfValue(firstName, strippedLastName),
              ]);

              if (adp) totalAdpSum += parseFloat(adp);
              if (sfValue) totalValueSum += sfValue;
            }
          })
        );

        teamValues.push({
          username: ownerUsername,
          totalValue: totalValueSum,
        });
        teamAdps.push({ username: ownerUsername, totalAdp: totalAdpSum });
      })
    );

    teamValues.sort((a, b) => b.totalValue - a.totalValue);
    const userDynastyRank =
      teamValues.findIndex((team) => team.username === username) + 1;

    teamAdps.sort((a, b) => a.totalAdp - b.totalAdp);
    const userAdpRank =
      teamAdps.findIndex((team) => team.username === username) + 1;

    return { dynastyRank: userDynastyRank, adpRank: userAdpRank };
  } catch (error) {
    console.error("Error fetching or calculating ranks:", error);
    return { dynastyRank: null, adpRank: null };
  }
};

const UserRank = ({ leagueId, username, onRankCalculated }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userRank", leagueId, username],
    queryFn: fetchAndCalculateRanks,
    staleTime: 60000,
  });

  useEffect(() => {
    if (data && onRankCalculated) {
      onRankCalculated({
        leagueId,
        dynastyRank: data.dynastyRank,
        adpRank: data.adpRank,
      });
    }
  }, [data, onRankCalculated, leagueId]);

  return null;
};

export default UserRank;
