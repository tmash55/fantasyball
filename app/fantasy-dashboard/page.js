"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart, Trophy, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUserLeaguesAndDetails } from "@/libs/sleeper";
import WeeklyProjections from "@/components/fantasy-dashboard/WeeklyProjections";
import OptimizedLineup from "@/components/fantasy-dashboard/OptimizedLineup";
import UserRank from "@/components/UserRank";
import RecentPlayerNews from "@/components/fantasy-dashboard/RecentPlayerNews";
import UpcomingMatchups from "@/components/fantasy-dashboard/UpcomingMatchups";
import TradeAnalyzer from "@/components/fantasy-dashboard/TradeAnalyzer";
import WaiverWireSuggestions from "@/components/fantasy-dashboard/WaiverWireSuggestions";
import LeagueOverview from "@/components/fantasy-dashboard/LeagueOverview";

export default function FantasyDashboard() {
  const [leagues, setLeagues] = useState([]);
  const [buyIns, setBuyIns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ranks, setRanks] = useState({});

  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const handleRankCalculated = useCallback((rankData) => {
    setRanks((prevRanks) => ({
      ...prevRanks,
      [rankData.leagueId]: {
        dynastyRank: rankData.dynastyRank,
        adpRank: rankData.adpRank,
      },
    }));
  }, []);

  useEffect(() => {
    async function loadUserLeagues() {
      if (username) {
        try {
          setLoading(true);
          setError(null);
          const userLeagues = await fetchUserLeaguesAndDetails(username, 2024);
          setLeagues(Array.isArray(userLeagues) ? userLeagues : []);
        } catch (err) {
          console.error("Error fetching leagues:", err);
          setError("Failed to fetch leagues. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    loadUserLeagues();
  }, [username]);

  useEffect(() => {
    const storedBuyIns = JSON.parse(localStorage.getItem("buyIns")) || {};
    setBuyIns(storedBuyIns);
  }, []);

  const handleBuyInChange = (leagueId, value) => {
    const updatedBuyIns = { ...buyIns, [leagueId]: value };
    setBuyIns(updatedBuyIns);
    localStorage.setItem("buyIns", JSON.stringify(updatedBuyIns));
  };

  const totalBuyIn = Object.values(buyIns).reduce(
    (sum, value) => sum + parseFloat(value || 0),
    0
  );
  const totalPot = leagues.reduce((sum, league) => {
    const buyIn = parseFloat(buyIns[league.league_id] || 0);
    return sum + buyIn * league.settings.num_teams;
  }, 0);

  if (!username) {
    return null; // The layout will handle showing the SleeperInput
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your fantasy dashboard...</span>
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 uppercase">
          {username}
          <span className="lowercase">&apos;s Fantasy Dashboard</span>
        </h1>
        <div className="flex items-center space-x-2 mb-6">
          <Link href={`/fantasy-dashboard/leagues?username=${username}`}>
            <div className="badge badge-lg border-transparent bg-neutral text-neutral-foreground hover:bg-neutral/80 text-sm py-1 cursor-pointer">
              <Users className="w-4 h-4 mr-1" />
              {leagues.length} active leagues
            </div>
          </Link>
          <Link href={`/fantasy-dashboard/exposure?username=${username}`}>
            <div className="badge badge-lg border-transparent bg-neutral text-neutral-foreground hover:bg-neutral/80 text-sm py-1 cursor-pointer">
              <BarChart className="w-4 h-4 mr-1" />
              View Player Exposure
            </div>
          </Link>
        </div>

        <LeagueOverview leaguesData={leagues} />

        <Tabs defaultValue="myTeams" className="w-full">
          <TabsList>
            <TabsTrigger value="myTeams">My Teams</TabsTrigger>
            <TabsTrigger value="playerNews">Player News</TabsTrigger>
            <TabsTrigger value="upcomingMatchups">
              Upcoming Matchups
            </TabsTrigger>
            <TabsTrigger value="tradeAnalyzer">Trade Analyzer</TabsTrigger>
            <TabsTrigger value="waiverWire">Waiver Wire</TabsTrigger>
          </TabsList>

          <TabsContent value="myTeams">
            <Card>
              <CardHeader>
                <CardTitle>My Teams</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <motion.tr key={league.league_id} className="hover">
                          <td className="hover:text-primary">
                            <Link
                              href={`/dashboard/leagues/${league.league_id}?username=${username}`}
                            >
                              <span className="">{league.name}</span>
                            </Link>
                          </td>
                          <td>{league.settings.num_teams}</td>
                          <td>
                            <UserRank
                              leagueId={league.league_id}
                              username={username}
                              rankType="redraft"
                              onRankCalculated={handleRankCalculated}
                            />
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
                            <div className="badge badge-secondary flex items-center hover:bg-secondary/80 text-sm py-1">
                              <Trophy className="w-3 h-3 mr-1" />
                              {ranks[league.league_id]?.dynastyRank || "N/A"}
                            </div>
                          </td>
                          <td className="w-20 disabled">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playerNews">
            <RecentPlayerNews leagues={leagues} />
          </TabsContent>

          <TabsContent value="upcomingMatchups">
            <UpcomingMatchups leagues={leagues} />
          </TabsContent>

          <TabsContent value="tradeAnalyzer">
            <TradeAnalyzer leagues={leagues} />
          </TabsContent>

          <TabsContent value="waiverWire">
            <WaiverWireSuggestions leagues={leagues} />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <WeeklyProjections />
          <OptimizedLineup />
        </div>
      </motion.div>
    </div>
  );
}
