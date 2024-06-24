"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Header from "@/components/Header";

const Leagues = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <h1>{username}</h1>
      <ul>
        {leagues.map((league) => (
          <li key={league.league_id}>
            <Link
              href={`/dashboard/leagues/${league.league_id}?username=${username}`}
            >
              <span className="underline hover:text-blue-500">
                {league.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leagues;
