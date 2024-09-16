"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserRank from "@/components/UserRank"; // Import UserRank component
import { Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";

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
        <Suspense>
          <div>
            <Header />
            <section
              id="league"
              className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full my-8 flex flex-col gap-2 md:gap-6"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {" "}
                <h1 className="text-3xl font-bold mb-2 uppercase">
                  {username}
                  <span className="lowercase">`s Leagues</span>
                </h1>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="badge badge-lg border-transparent bg-neutral text-neutral-foreground hover:bg-neutral/80 text-sm py-1">
                    {" "}
                    <Users className="w-4 h-4 mr-1" />
                    {leagues.length} active leagues
                  </div>
                </div>
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
                        <motion.tr key={league.league_id} className="hover ">
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
                            {/* Flex container for the icon and rank */}
                            <div className="badge badge-primary flex items-center hover:bg-primary/80 text-sm py-1">
                              <Trophy className="w-3 h-3 mr-1" />
                              {ranks[league.league_id]?.adpRank || "N/A"}
                            </div>
                          </td>

                          <td>
                            <UserRank
                              leagueId={league.league_id}
                              username={username}
                              rankType="dynasty"
                              onRankCalculated={handleRankCalculated}
                            />
                            {/* Flex container for the icon and rank */}
                            <div className="badge badge-secondary flex items-center hover:bg-secondary/80 text-sm py-1">
                              <Trophy className="w-3 h-3 mr-1" />
                              {ranks[league.league_id]?.dynastyRank || "N/A"}
                            </div>
                          </td>

                          <td className="w-20 disabled">
                            <label className="input input-bordered flex items-center gap-2 ">
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
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 1 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
                                <path d="M12 3v3m0 12v3" />
                              </svg>
                              <input
                                type="text"
                                className="grow text-sm opacity-50"
                                placeholder="0 (Coming soon)"
                                disabled
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
                        </motion.tr>
                      ))}
                      <tr>
                        <td
                          colSpan="4"
                          className="text-right font-bold text-lg"
                        >
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
              </motion.div>
            </section>
          </div>
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default Leagues;
