import React, { useEffect, useState } from "react";
import axios from "axios";
import IndividualTrade from "./IndividualTrade"; // Import the IndividualTrade component

const Trades = ({ league_id, roster_id, players, rosters }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axios.get(
          `https://api.sleeper.app/v1/league/${league_id}/transactions/1`
        );
        const tradesData = response.data.filter(
          (transaction) => transaction.type === "trade"
        );
        const userTrades = tradesData.filter((trade) =>
          trade.roster_ids.includes(roster_id)
        );
        setTrades(userTrades);
      } catch (err) {
        console.error("Error fetching trades:", err);
        setError("Failed to fetch trades");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [league_id, roster_id]);

  if (loading) return <p>Loading trades...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex justify-center gap-4 flex-wrap">
      {trades.length === 0 ? (
        <p>No trades found for this user.</p>
      ) : (
        trades.map((trade) => (
          <IndividualTrade
            key={trade.transaction_id}
            trade={trade}
            players={players}
            rosters={rosters}
          />
        ))
      )}
    </div>
  );
};

export default Trades;
