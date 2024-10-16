"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Team from "@/components/Team";
import LeagueSettings from "@/components/LeagueSettings";

import { transformPosition, fetchUsername } from "@/utils/helpers";
import { refreshPlayerDataIfNeeded } from "@/utils/playerData";
import useLeagueHistory from "./LeagueHistory";
import Link from "next/link";
import Drafts from "./Drafts";
import MyTeam from "./MyTeam";
import Trades from "./Trades"; // Import the Trades component
import { getMostRecentDate } from "@/utils/getMostRecentDate";

const LeagueDetails = () => {
  const { league_id } = useParams();
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const router = useRouter(); // Using useRouter from next/navigation
  const [mostRecentDate, setMostRecentDate] = useState(null);
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
  const [allOpen, setAllOpen] = useState(true);
  const [userRosterId, setUserRosterId] = useState(null); // State for user roster ID
  const leagueHistory = useLeagueHistory(league_id);
  const backUrl = `/dashboard/leagues?username=${username}`;

  const [teamValues, setTeamValues] = useState([]);
  const [teamADPs, setTeamADPs] = useState([]); // New state for team ADPs

  useEffect(() => {
    const fetchMostRecentDate = async () => {
      const date = await getMostRecentDate();
      setMostRecentDate(date);
    };

    fetchMostRecentDate();
  }, []);

  const handleValueCalculated = useCallback((teamName, totalValue) => {
    setTeamValues((prevValues) => {
      const updatedValues = prevValues.filter((v) => v.teamName !== teamName);
      updatedValues.push({ teamName, totalValue });
      return updatedValues;
    });
  }, []);

  const handleADPCalculated = useCallback((teamName, totalADP) => {
    setTeamADPs((prevADPs) => {
      const updatedADPs = prevADPs.filter((adp) => adp.teamName !== teamName);
      updatedADPs.push({ teamName, totalADP });
      return updatedADPs;
    });
  }, []);

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
              owner_id: roster.owner_id, // Add owner_id for comparison
            };
          })
        );

        setRosters(rostersWithOwners);

        // Find the user's roster ID
        const userRoster = rostersWithOwners.find(
          (roster) => roster.owner_id === userDetails.user_id
        );
        if (userRoster) {
          setUserRosterId(userRoster.roster_id);
        }
      } catch (err) {
        console.error("Error fetching league details:", err);
        setError("Failed to fetch league details");
      } finally {
        setLoading(false);
      }
    };

    if (userDetails) {
      fetchLeagueDetails();
    }
  }, [league_id, userDetails]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const activeRosterCount = rosterPositions.length;

  // Sort teamValues by totalValue in descending order
  const sortedTeamValues = [...teamValues].sort(
    (a, b) => b.totalValue - a.totalValue
  );

  // Sort teamADPs by totalADP in ascending order (lower ADP is better)
  const sortedTeamADPs = [...teamADPs].sort((a, b) => a.totalADP - b.totalADP);

  const navigateToLeaguesPage = () => {
    const userTeam = teamValues.find((team) => team.teamName === username);
    const userRank =
      sortedTeamValues.findIndex((team) => team.teamName === username) + 1;

    router.push(`/dashboard/leagues?username=${username}&rank=${userRank}`);
  };

  return (
    <section
      id="league"
      className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full my-8 flex flex-col gap-8 md:gap-12"
    >
      <div>
        <Link href={backUrl} className="link">
          Go Back
        </Link>
      </div>
      <div>
        <h1 className="text-5xl text-primary mb-16 text-center">
          {leagueName}
        </h1>
        <div>
          <h2 className="text-sm italic p-[-1]">
            Values as of {mostRecentDate ? mostRecentDate : "Loading..."}
          </h2>
        </div>
      </div>

      <div className="join join-vertical">
        <LeagueSettings
          leagueName={leagueName}
          settings={settings}
          activeRosterCount={activeRosterCount}
          rosterPositions={rosterPositions} // Pass roster positions to LeagueSettings
        />

        <div
          role="tablist"
          className="tabs tabs-boxed tabs-lg rounded-none border-t border-base-100"
        >
          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab"
            aria-label="Trades"
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 rounded-box p-6"
          >
            <h1 className="text-xl font-bold mb-4">Recent trades</h1>

            {/* Add the Trades component and pass league_id, userRosterId, players, and rosters to it */}
            {userRosterId && (
              <Trades
                league_id={league_id}
                roster_id={userRosterId}
                players={players}
                rosters={rosters}
              />
            )}
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab"
            aria-label="Roster"
            defaultChecked
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 rounded-box p-6"
          >
            <MyTeam />
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab"
            aria-label="Drafts"
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 rounded-box p-6 overflow-x-auto"
          >
            {/* Add the Drafts component here and pass the leagueHistory to it */}
            <Drafts leagueHistory={leagueHistory} />
          </div>
        </div>
      </div>

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
              onValueCalculated={handleValueCalculated} // Pass the callback to Team component
              onADPCalculated={handleADPCalculated} // Pass the ADP callback to Team component
            />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">
          Starting Lineup Dynasty Values
        </h2>
        <ol className="list-decimal">
          {sortedTeamValues.map(({ teamName, totalValue }, index) => (
            <li key={index}>
              <button onClick={() => navigateToLeaguesPage(teamName)}>
                {teamName}: {totalValue}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Starting Lineup ADP</h2>
        <ol className="list-decimal">
          {sortedTeamADPs.map(({ teamName, totalADP }, index) => (
            <li key={index}>
              <button onClick={() => navigateToLeaguesPage(teamName)}>
                {teamName}: {totalADP}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default LeagueDetails;
