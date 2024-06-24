// components/LeagueDetails.js
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Team from "@/components/Team";
import LeagueSettings from "@/components/LeagueSettings";

import { transformPosition, fetchUsername } from "@/utils/helpers";
import { refreshPlayerDataIfNeeded } from "@/utils/playerData";
import MyTeam from "./MyTeam";
import TeamRanking from "./TeamRanking";
import FeaturesAccordion from "./FeaturesAccordion";

const LeagueDetails = () => {
  const { league_id } = useParams();
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [rosters, setRosters] = useState([]);
  const [players, setPlayers] = useState({});
  const [leagueName, setLeagueName] = useState("");
  const [settings, setSettings] = useState({
    rec: 0,
    bonus_rec_wr: 0,
    bonus_rec_rb: 0,
    bonus_rec_te: 0,
    best_ball: 0,
  });
  const [rosterPositions, setRosterPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userResponse = await axios.get(
          `https://api.sleeper.app/v1/user/${username}`
        );
        setUserDetails(userResponse.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    if (username) {
      fetchUserDetails();
    }
  }, [username]);

  useEffect(() => {
    const fetchLeagueDetails = async () => {
      try {
        const leagueResponse = await axios.get(
          `https://api.sleeper.app/v1/league/${league_id}`
        );
        const leagueData = leagueResponse.data;
        console.log("Fetched league data:", leagueData);
        setLeagueName(leagueData.name);
        setSettings({
          rec: leagueData.scoring_settings.rec ?? 0,
          bonus_rec_wr: leagueData.scoring_settings.bonus_rec_wr ?? 0,
          bonus_rec_rb: leagueData.scoring_settings.bonus_rec_rb ?? 0,
          bonus_rec_te: leagueData.scoring_settings.bonus_rec_te ?? 0,
          best_ball: leagueData.settings.best_ball ?? 0,
        });
        setRosterPositions(
          leagueData.roster_positions
            .filter((pos) => pos !== "BN")
            .map(transformPosition)
        );

        const playerData = await refreshPlayerDataIfNeeded();
        setPlayers(playerData || {});

        const rostersResponse = await axios.get(
          `https://api.sleeper.app/v1/league/${league_id}/rosters`
        );
        const fetchedRosters = rostersResponse.data;

        const rostersWithOwners = await Promise.all(
          fetchedRosters.map(async (roster) => {
            const ownerUsername = await fetchUsername(roster.owner_id);
            return {
              roster_id: roster.roster_id,
              owner: ownerUsername,
              starters: roster.starters,
            };
          })
        );

        setRosters(rostersWithOwners);
      } catch (err) {
        console.error("Error fetching league details:", err);
        setError("Failed to fetch league details");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueDetails();
  }, [league_id, username]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className=" relative py-10 lg:py-16 xl:py-20  ">
      <div className="md:max-w-md lg:max-w-2xl max-w-[50rem] mx-auto mb-12 lg:mb-20 md:text-center">
        <LeagueSettings leagueName={leagueName} settings={settings} />
        <MyTeam />
      </div>
      <div className="max-w-[77.5rem] mx-auto px-5 md:px-10 lg:px-15 xl:max-w-[87.5rem]  p-4 rounded-lg shadow-lg mb-4 relative py-10 lg:py-16 xl:py-20">
        <div className="flex flex-wrap gap-10 ">
          {rosters.map((roster) => (
            <Team
              key={roster.roster_id}
              roster={roster}
              players={players}
              rosterPositions={rosterPositions}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeagueDetails;
