import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { formatDate } from "../utils/dateUtils";
import classNames from "classnames";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const IndividualTrade = ({ trade, players, rosters }) => {
  const [historicalData, setHistoricalData] = useState({});
  const [tradeDayData, setTradeDayData] = useState({});
  const [draftPickValues, setDraftPickValues] = useState({});
  const [tradeDayPickValues, setTradeDayPickValues] = useState({});
  const [totals, setTotals] = useState({
    totalAddedCurrent: 0,
    totalTradedCurrent: 0,
    totalAddedTradeDay: 0,
    totalTradedTradeDay: 0,
  });

  useEffect(() => {
    const fetchHistoricalData = async () => {
      const { data: recentData, error: recentError } = await supabase
        .from("Dynasty-historical-data")
        .select("first_name, last_name, value, date")
        .order("date", { ascending: false });

      if (recentError) {
        console.error("Error fetching recent historical data:", recentError);
      } else {
        const recentHistoricalData = recentData.reduce((acc, record) => {
          if (record.first_name && record.last_name) {
            const key = `${record.first_name.toLowerCase()} ${record.last_name.toLowerCase()}`;
            if (!acc[key]) {
              acc[key] = record;
            }
          }
          return acc;
        }, {});
        setHistoricalData(recentHistoricalData);
      }

      const { data: draftPicks, error: draftPicksError } = await supabase
        .from("Dynasty-historical-data")
        .select("full_name, value")
        .order("date", { ascending: false });

      if (draftPicksError) {
        console.error("Error fetching draft pick values:", draftPicksError);
      } else {
        const draftPickValuesMap = draftPicks.reduce((acc, pick) => {
          if (!acc[pick.full_name]) {
            acc[pick.full_name] = pick.value;
          }
          return acc;
        }, {});
        setDraftPickValues(draftPickValuesMap);
      }
    };

    fetchHistoricalData();
  }, []);

  useEffect(() => {
    const formattedTradeDate = new Date(trade.status_updated)
      .toISOString()
      .split("T")[0];

    const fetchTradeDayData = async () => {
      const { data: tradeDayData, error: tradeDayError } = await supabase
        .from("Dynasty-historical-data")
        .select("first_name, last_name, value, date")
        .eq("date", formattedTradeDate);

      if (tradeDayError) {
        console.error("Error fetching trade day data:", tradeDayError);
      } else {
        const tradeDayHistoricalData = tradeDayData.reduce((acc, record) => {
          if (record.first_name && record.last_name) {
            const key = `${record.first_name.toLowerCase()} ${record.last_name.toLowerCase()}`;
            acc[key] = record;
          }
          return acc;
        }, {});
        setTradeDayData(tradeDayHistoricalData);
      }

      const { data: tradeDayPicks, error: tradeDayPicksError } = await supabase
        .from("Dynasty-historical-data")
        .select("full_name, value")
        .eq("date", formattedTradeDate);

      if (tradeDayPicksError) {
        console.error(
          "Error fetching trade day pick values:",
          tradeDayPicksError
        );
      } else {
        const tradeDayPickValuesMap = tradeDayPicks.reduce((acc, pick) => {
          acc[pick.full_name] = pick.value;
          return acc;
        }, {});
        setTradeDayPickValues(tradeDayPickValuesMap);
      }
    };

    fetchTradeDayData();
  }, [trade]);

  const findHistoricalData = (firstName, lastName, data) => {
    const key = `${firstName.toLowerCase()} ${lastName.toLowerCase()}`;
    return data[key] ? data[key].value : 0;
  };

  const getPlayerName = (playerId) => {
    const player = players[playerId];
    return player ? player.full_name : `Player ID: ${playerId}`;
  };

  const getRoundSuffix = (round) => {
    if (round === 1) return "st";
    if (round === 2) return "nd";
    if (round === 3) return "rd";
    return "th";
  };

  const getTeamName = (rosterId) => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    return roster ? roster.owner : `Roster ID: ${rosterId}`;
  };

  const getDraftPickValue = (pick, data) => {
    const pickName = `${pick.season} Mid ${pick.round}${getRoundSuffix(
      pick.round
    )}`;
    const value = data[pickName] || 0;
    return value;
  };

  const calculateTotals = (teamId, data) => {
    let totalValueAdded = 0;
    let totalValueTraded = 0;

    const draftPicksReceived = trade.draft_picks.filter(
      (pick) => pick.owner_id === teamId
    );
    const draftPicksTraded = trade.draft_picks.filter(
      (pick) => pick.previous_owner_id === teamId
    );
    const playersAdded = trade.adds
      ? Object.entries(trade.adds).filter(([, rosterId]) => rosterId === teamId)
      : [];
    const playersTraded = trade.drops
      ? Object.entries(trade.drops).filter(
          ([, rosterId]) => rosterId === teamId
        )
      : [];

    playersAdded.forEach(([playerId]) => {
      const playerName = getPlayerName(playerId);
      const [firstName, lastName] = playerName.split(" ");
      const value = findHistoricalData(firstName, lastName, data);
      totalValueAdded += value;
    });

    draftPicksReceived.forEach((pick) => {
      const value = getDraftPickValue(pick, data);
      totalValueAdded += value;
    });

    playersTraded.forEach(([playerId]) => {
      const playerName = getPlayerName(playerId);
      const [firstName, lastName] = playerName.split(" ");
      const value = findHistoricalData(firstName, lastName, data);
      totalValueTraded += value;
    });

    draftPicksTraded.forEach((pick) => {
      const value = getDraftPickValue(pick, data);
      totalValueTraded += value;
    });

    return { totalValueAdded, totalValueTraded };
  };

  useEffect(() => {
    const {
      totalValueAdded: totalAddedCurrent,
      totalValueTraded: totalTradedCurrent,
    } = calculateTotals(trade.roster_ids[0], historicalData);
    const {
      totalValueAdded: totalAddedTradeDay,
      totalValueTraded: totalTradedTradeDay,
    } = calculateTotals(trade.roster_ids[0], tradeDayData);

    setTotals({
      totalAddedCurrent,
      totalTradedCurrent,
      totalAddedTradeDay,
      totalTradedTradeDay,
    });
  }, [historicalData, tradeDayData, trade]);

  const renderTeamDetails = (teamId) => {
    const draftPicksReceived = trade.draft_picks.filter(
      (pick) => pick.owner_id === teamId
    );
    const playersAdded = trade.adds
      ? Object.entries(trade.adds).filter(([, rosterId]) => rosterId === teamId)
      : [];

    return (
      <div key={teamId} className="w-full md:w-1/2 p-2">
        <h5 className="text-lg font-semibold text-center ">
          {getTeamName(teamId)}
        </h5>
        {playersAdded.length > 0 && (
          <div className="mt-2">
            {playersAdded.map(([playerId], index) => {
              const playerName = getPlayerName(playerId);
              const [firstName, lastName] = playerName.split(" ");
              const currentPlayerValue = findHistoricalData(
                firstName,
                lastName,
                historicalData
              );
              const tradeDayPlayerValue = findHistoricalData(
                firstName,
                lastName,
                tradeDayData
              );
              return (
                <div
                  key={`${playerId}-${index}`}
                  className="text-sm mt-2 items-center flex flex-col"
                >
                  <p>{playerName}</p>
                  <div className="text-xs mt-1">
                    Current Value: {currentPlayerValue}
                  </div>
                  <div className="text-xs mt-1">
                    Trade Day Value: {tradeDayPlayerValue}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {draftPicksReceived.length > 0 && (
          <div className="mt-2 flex flex-col">
            {draftPicksReceived.map((pick, index) => (
              <div
                key={`${pick.season}-${pick.round}-${index}`}
                className="text-xs items-center flex flex-col"
              >
                {pick.season} {pick.round}
                {getRoundSuffix(pick.round)} - {getTeamName(pick.roster_id)}{" "}
                <div className="text-xs mt-1">
                  Current Value: {getDraftPickValue(pick, draftPickValues)}
                </div>
                <div className="text-xs mt-1">
                  Trade Day Value: {getDraftPickValue(pick, tradeDayPickValues)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const formattedDate = formatDate(trade.status_updated);

  return (
    <div className="card bg-base-200 w-full md:w-96 overflow-x-auto mb-4">
      <div className="card-body">
        <p className="text-sm">{formattedDate}</p>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {renderTeamDetails(trade.roster_ids[0])}
          {trade.roster_ids.length === 2 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-switch-horizontal"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M16 3l4 4l-4 4" />
              <path d="M10 7l10 0" />
              <path d="M8 13l-4 4l4 4" />
              <path d="M4 17l9 0" />
            </svg>
          )}
          {trade.roster_ids.length === 2 &&
            renderTeamDetails(trade.roster_ids[1])}
        </div>
      </div>
    </div>
  );
};

export default IndividualTrade;
