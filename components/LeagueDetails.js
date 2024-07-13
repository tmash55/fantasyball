"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Team from "@/components/Team";
import LeagueSettings from "@/components/LeagueSettings";
import { createClient } from "@supabase/supabase-js";
import { transformPosition, fetchUsername } from "@/utils/helpers";
import { refreshPlayerDataIfNeeded } from "@/utils/playerData";
import MyTeam from "./MyTeam";
import MyTeamTabs from "./MyTeamTabs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    pass_td: 0,
  });
  const [rosterPositions, setRosterPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [allOpen, setAllOpen] = useState(false);

  const toggleAll = () => {
    setAllOpen(!allOpen);
  };

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
          pass_td: leagueData.scoring_settings.pass_td ?? 0,
          best_ball: leagueData.settings.best_ball ?? 0,
        });

        const filteredPositions = leagueData.roster_positions.filter(
          (pos) => pos !== "BN"
        );

        setRosterPositions(filteredPositions.map(transformPosition));

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

  const activeRosterCount = rosterPositions.length;

  return (
    <section
      id="league"
      className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full my-8 flex flex-col gap-8 md:gap-12"
    >
      <div className="flex justify-center items-center">
        <LeagueSettings
          leagueName={leagueName}
          settings={settings}
          activeRosterCount={activeRosterCount}
          rosterPositions={rosterPositions} // Pass roster positions to LeagueSettings
        />
      </div>
      <MyTeamTabs />

      <div className="">
        <div className="flex justify-center mb-4">
          <button
            className="text-white btn btn-outline px-4 py-2"
            onClick={toggleAll}
          >
            {allOpen ? "Minimize Rosters" : "View All Rosters"}
          </button>
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          {rosters.map((roster) => (
            <Team
              key={roster.roster_id}
              roster={roster}
              players={players}
              rosterPositions={rosterPositions}
              isOpen={allOpen}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeagueDetails;
