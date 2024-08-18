// components/UserRank.js

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { calculateUserRank } from "../utils/fantasyRank"; // Assuming this handles rank calculation

const UserRank = ({ leagueId, playerValues, adpValues }) => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [dynastyRank, setDynastyRank] = useState(null);
  const [adpRank, setAdpRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanks = async () => {
      if (username && playerValues && adpValues) {
        setLoading(true);
        try {
          // Fetch dynasty rank
          const { userRank: dynastyUserRank } = await calculateUserRank(
            username,
            playerValues
          );

          // Fetch ADP rank
          const { userRank: adpUserRank } = await calculateUserRank(
            username,
            adpValues
          );

          setDynastyRank(dynastyUserRank);
          setAdpRank(adpUserRank);
        } catch (error) {
          console.error("Error calculating user rank:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRanks();
  }, [username, playerValues, adpValues]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Rank in League {leagueId}</h2>
      <p>Dynasty Rank: {dynastyRank !== null ? dynastyRank : "N/A"}</p>
      <p>ADP Rank: {adpRank !== null ? adpRank : "N/A"}</p>
    </div>
  );
};

export default UserRank;
