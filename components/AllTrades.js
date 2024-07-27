import React from "react";
import IndividualTrade from "./IndividualTrade";
import CombinedTradesSummary from "./CombinedTradesSummary";

const AllTrades = ({ trades, players, rosters, userId }) => {
  return (
    <div>
      {trades.map((trade) => (
        <IndividualTrade
          key={trade.transaction_id}
          trade={trade}
          players={players}
          rosters={rosters}
        />
      ))}
      <CombinedTradesSummary
        trades={trades}
        players={players}
        rosters={rosters}
        userId={userId}
      />
    </div>
  );
};

export default AllTrades;
