import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { formatDate } from "../utils/dateUtils"; // Import the utility function

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const IndividualTrade = ({ trade, players, rosters }) => {
  const [historicalData, setHistoricalData] = useState({});
  const [tradeDayData, setTradeDayData] = useState({});
  const [draftPickValues, setDraftPickValues] = useState({});
  const [tradeDayPickValues, setTradeDayPickValues] = useState({});

  useEffect(() => {
    const formattedTradeDate = new Date(trade.status_updated)
      .toISOString()
      .split("T")[0];

    const fetchHistoricalData = async () => {
      // Query to get the most recent historical data for each player
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

      // Query to get the historical data for the trade day date
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
    };

    const fetchDraftPickValues = async () => {
      // Query to get the most recent pick values
      const { data: draftPicks, error: draftPicksError } = await supabase
        .from("Dynasty-historical-data") // Replace with your actual table name
        .select("full_name, value")
        .order("date", { ascending: false });

      if (draftPicksError) {
        console.error("Error fetching draft pick values:", draftPicksError);
      } else {
        console.log("Fetched draft pick values:", draftPicks); // Debug: log the fetched draft pick values
        const draftPickValuesMap = draftPicks.reduce((acc, pick) => {
          if (!acc[pick.full_name]) {
            acc[pick.full_name] = pick.value;
          }
          return acc;
        }, {});
        setDraftPickValues(draftPickValuesMap);
        console.log("Draft pick values map:", draftPickValuesMap); // Debug: log the draft pick values map
      }

      // Query to get the pick values on the trade day date
      const { data: tradeDayPicks, error: tradeDayPicksError } = await supabase
        .from("Dynasty-historical-data") // Replace with your actual table name
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
        console.log("Trade day pick values map:", tradeDayPickValuesMap); // Debug: log the trade day pick values map
      }
    };

    fetchHistoricalData();
    fetchDraftPickValues();
  }, [trade.status_updated]);

  const findHistoricalData = (firstName, lastName, data) => {
    const key = `${firstName.toLowerCase()} ${lastName.toLowerCase()}`;
    return data[key];
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
    console.log("Formatted pick name:", pickName); // Debug: log the formatted pick name
    const value = data[pickName] || "N/A";
    console.log(`Value for ${pickName}:`, value); // Debug: log the value for the formatted pick name
    return value;
  };

  const renderTeamDetails = (teamId) => {
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
      <div key={teamId} className="w-full md:w-1/2 p-2">
        <h5 className="text-lg font-semibold text-center ">
          {getTeamName(teamId)}
        </h5>
        {playersAdded.length > 0 && (
          <div className="mt-2">
            {playersAdded.map(([playerId]) => {
              const playerName = getPlayerName(playerId);
              const [firstName, lastName] = playerName.split(" ");
              const currentPlayerData = findHistoricalData(
                firstName,
                lastName,
                historicalData
              );
              const tradeDayPlayerData = findHistoricalData(
                firstName,
                lastName,
                tradeDayData
              );
              return (
                <div
                  key={playerId}
                  className="text-sm mt-2 items-center flex flex-col"
                >
                  <p>{playerName}</p>
                  {currentPlayerData && (
                    <div className="text-xs mt-1">
                      Current Value: {currentPlayerData.value}
                    </div>
                  )}
                  {tradeDayPlayerData && (
                    <div className="text-xs mt-1">
                      Trade Day Value: {tradeDayPlayerData.value}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {draftPicksReceived.length > 0 && (
          <div className="mt-2 flex flex-col">
            {draftPicksReceived.map((pick) => (
              <div
                key={`${pick.season}-${pick.round}`}
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
        <p className="text-sm">{formattedDate}</p>{" "}
        {/* Display the formatted date */}
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
              className="icon icon-tabler icons-tabler-outline icon-tabler-switch-horizontal "
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
