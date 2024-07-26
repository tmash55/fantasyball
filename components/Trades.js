import React, { useEffect, useState } from "react";
import axios from "axios";

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

  const getPlayerName = (playerId) => {
    const player = players[playerId];
    return player ? player.full_name : `Player ID: ${playerId}`;
  };

  const getTeamName = (rosterId) => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    return roster ? roster.owner : `Roster ID: ${rosterId}`;
  };

  const renderTeamDetails = (teamId, trade) => {
    const draftPicksReceived = trade.draft_picks.filter(
      (pick) => pick.owner_id === teamId
    );
    const draftPicksDropped = trade.draft_picks.filter(
      (pick) => pick.previous_owner_id === teamId
    );
    const playersAdded = trade.adds
      ? Object.entries(trade.adds).filter(([, rosterId]) => rosterId === teamId)
      : [];
    const playersDropped = trade.drops
      ? Object.entries(trade.drops).filter(
          ([, rosterId]) => rosterId === teamId
        )
      : [];

    return (
      <div key={teamId}>
        <h5>{getTeamName(teamId)}</h5>
        {draftPicksReceived.length > 0 && (
          <div>
            <h6>Draft Picks Received:</h6>
            {draftPicksReceived.map((pick) => (
              <p key={`${pick.season}-${pick.round}`}>
                Season: {pick.season}, Round: {pick.round}, From:{" "}
                {getTeamName(pick.previous_owner_id)}
              </p>
            ))}
          </div>
        )}
        {draftPicksDropped.length > 0 && (
          <div>
            <h6>Draft Picks Dropped:</h6>
            {draftPicksDropped.map((pick) => (
              <p key={`${pick.season}-${pick.round}`}>
                Season: {pick.season}, Round: {pick.round}, To:{" "}
                {getTeamName(pick.owner_id)}
              </p>
            ))}
          </div>
        )}
        {playersAdded.length > 0 && (
          <div>
            <h6>Players Added:</h6>
            {playersAdded.map(([playerId]) => (
              <p key={playerId}>{getPlayerName(playerId)}</p>
            ))}
          </div>
        )}
        {playersDropped.length > 0 && (
          <div>
            <h6>Players Dropped:</h6>
            {playersDropped.map(([playerId]) => (
              <p key={playerId}>{getPlayerName(playerId)}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p>Loading trades...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {trades.length === 0 ? (
        <p>No trades found for this user.</p>
      ) : (
        trades.map((trade) => (
          <div key={trade.transaction_id} className="trade">
            <h4>Trade {trade.transaction_id}</h4>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {trade.roster_ids.map((teamId) =>
                renderTeamDetails(teamId, trade)
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Trades;
