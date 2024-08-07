// components/UserRank.js

import React, { useEffect, useState } from "react";

import { calculateUserRank } from "../utils/fantasyRank";
import { useSearchParams } from "next/navigation";

const UserRank = ({ playerValues }) => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [rank, setRank] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRank = async () => {
      if (username) {
        setLoading(true);
        const { userScore, userRank } = await calculateUserRank(
          username,
          playerValues
        );
        setScore(userScore);
        setRank(userRank);
        setLoading(false);
      }
    };
    fetchRank();
  }, [username, playerValues]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Rank</h2>
      <p>Score: {score}</p>
      <p>Rank: {rank}</p>
    </div>
  );
};

export default UserRank;
