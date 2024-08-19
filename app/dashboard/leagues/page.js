"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserRank from "@/components/UserRank"; // Import UserRank component

const Leagues = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const [leagues, setLeagues] = useState([]);
  const [buyIns, setBuyIns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ranks, setRanks] = useState({});

  const handleRankCalculated = useCallback(
    (rankData) => {
      setRanks((prevRanks) => ({
        ...prevRanks,
        [rankData.leagueId]: {
          dynastyRank: rankData.dynastyRank,
          adpRank: rankData.adpRank,
        },
      }));
    },
    [] // Ensure this callback is memoized and does not change on every render
  );

  useEffect(() => {
    if (username) {
      const fetchLeagues = async () => {
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
          setLeagues(leaguesResponse.data);
        } catch (err) {
          console.error("Error fetching leagues:", err);
          setError("Failed to fetch leagues");
        } finally {
          setLoading(false);
        }
      };
      fetchLeagues();
    }
  }, [username]);

  // Function to handle changes to the Buy In inputs
  const handleBuyInChange = (leagueId, value) => {
    const updatedBuyIns = { ...buyIns, [leagueId]: value };
    setBuyIns(updatedBuyIns);
    localStorage.setItem("buyIns", JSON.stringify(updatedBuyIns)); // Save to local storage
  };

  // Function to load Buy In values from local storage
  useEffect(() => {
    const storedBuyIns = JSON.parse(localStorage.getItem("buyIns")) || {};
    setBuyIns(storedBuyIns);
  }, []);

  // Calculate total Buy In and Total Pot
  const totalBuyIn = Object.values(buyIns).reduce(
    (sum, value) => sum + parseFloat(value || 0),
    0
  );
  const totalPot = leagues.reduce((sum, league) => {
    const buyIn = parseFloat(buyIns[league.league_id] || 0);
    return sum + buyIn * league.settings.num_teams;
  }, 0);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <main>
        <div>
          <Header />
          <section
            id="league"
            className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full my-8 flex flex-col gap-2 md:gap-6"
          >
            <h1 className="text-2xl font-bold mb-4 uppercase">
              {username}
              <span className="lowercase">`s League(s)</span>
            </h1>
            <p className="">Number of active leagues: {leagues.length}</p>
            <p className="underline">
              <Link href={`/dashboard/exposure/?username=${username}`}>
                Exposure
              </Link>
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full table">
                <thead>
                  <tr>
                    <th className="">League Name</th>
                    <th className="">Rosters</th>
                    <th className="">Redraft Rank</th>
                    <th className="">Dynasty Rank</th>
                    <th className="">Buy In</th>
                    <th className="">Total Pot</th>
                  </tr>
                </thead>
                <tbody>
                  {leagues.map((league) => (
                    <tr key={league.league_id} className="hover ">
                      <td className="hover:text-primary">
                        <Link
                          href={`/dashboard/leagues/${league.league_id}?username=${username}`}
                        >
                          <span className="">{league.name}</span>
                        </Link>
                      </td>
                      <td>{league.settings.num_teams}</td>
                      {/* Use the UserRank component to display ranks */}
                      <td>
                        <UserRank
                          leagueId={league.league_id}
                          username={username}
                          rankType="redraft"
                          onRankCalculated={handleRankCalculated}
                        />
                        <p>
                          {" "}
                          Contender Rank:
                          {ranks[league.league_id]?.adpRank || "N/A"}
                        </p>
                      </td>
                      <td>
                        <UserRank
                          leagueId={league.league_id}
                          username={username}
                          rankType="dynasty"
                          onRankCalculated={handleRankCalculated}
                        />
                        <p>
                          Dynasty Rank:{" "}
                          {ranks[league.league_id]?.dynastyRank || "N/A"}
                        </p>
                      </td>
                      <td className="w-20">
                        <label className="input input-bordered flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 opacity-70"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 1 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
                            <path d="M12 3v3m0 12v3" />
                          </svg>
                          <input
                            type="text"
                            className="grow"
                            placeholder="0"
                            value={buyIns[league.league_id] || ""}
                            onChange={(e) =>
                              handleBuyInChange(
                                league.league_id,
                                e.target.value
                              )
                            }
                          />
                        </label>
                      </td>
                      <td className="">
                        {(buyIns[league.league_id] || 0) *
                          league.settings.num_teams}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="4" className="text-right font-bold text-lg">
                      Total
                    </td>
                    <td className="font-bold flex items-center ml-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 opacity-70"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 1 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
                        <path d="M12 3v3m0 12v3" />
                      </svg>

                      {totalBuyIn}
                    </td>
                    <td className="">{totalPot}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Leagues;
