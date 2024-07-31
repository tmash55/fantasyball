import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import classNames from "classnames"; // Import classnames for conditional styling

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TradeSummary = ({ trades, players, rosters, roster_id }) => {
  const [historicalData, setHistoricalData] = useState({});
  const [draftPickValues, setDraftPickValues] = useState({});

  useEffect(() => {
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
    };

    const fetchDraftPickValues = async () => {
      // Query to get the most recent pick values
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
    fetchDraftPickValues();
  }, []);

  const getPlayerName = (playerId) => {
    const player = players[playerId];
    return player ? player.full_name : `Player ID: ${playerId}`;
  };

  const getTeamName = (rosterId) => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    return roster ? roster.owner : `Roster ID: ${rosterId}`;
  };

  const getRoundSuffix = (round) => {
    if (round === 1) return "st";
    if (round === 2) return "nd";
    if (round === 3) return "rd";
    return "th";
  };

  const getDraftPickValue = (pick) => {
    const pickName = `${pick.season} Mid ${pick.round}${getRoundSuffix(
      pick.round
    )}`;
    return draftPickValues[pickName] || 0;
  };

  const findHistoricalData = (firstName, lastName) => {
    const key = `${firstName.toLowerCase()} ${lastName.toLowerCase()}`;
    return historicalData[key] ? historicalData[key].value : 0;
  };

  const renderTeamDetails = (teamId) => {
    const summary = {
      playersAdded: [],
      playersDropped: [],
      picksReceived: [],
      picksDropped: [],
      totalAdded: 0,
      totalDropped: 0,
    };

    trades.forEach((trade) => {
      const draftPicksReceived = trade.draft_picks.filter(
        (pick) => pick.owner_id === teamId
      );
      const draftPicksDropped = trade.draft_picks.filter(
        (pick) => pick.previous_owner_id === teamId
      );
      const playersAdded = trade.adds
        ? Object.entries(trade.adds).filter(
            ([, rosterId]) => rosterId === teamId
          )
        : [];
      const playersDropped = trade.drops
        ? Object.entries(trade.drops).filter(
            ([, rosterId]) => rosterId === teamId
          )
        : [];

      summary.playersAdded.push(
        ...playersAdded.map(([playerId]) => {
          const playerName = getPlayerName(playerId);
          const [firstName, lastName] = playerName.split(" ");
          const value = findHistoricalData(firstName, lastName);
          summary.totalAdded += value;
          return { playerName, value };
        })
      );

      summary.playersDropped.push(
        ...playersDropped.map(([playerId]) => {
          const playerName = getPlayerName(playerId);
          const [firstName, lastName] = playerName.split(" ");
          const value = findHistoricalData(firstName, lastName);
          summary.totalDropped += value;
          return { playerName, value };
        })
      );

      summary.picksReceived.push(
        ...draftPicksReceived.map((pick) => {
          const value = getDraftPickValue(pick);
          summary.totalAdded += value;
          return {
            season: pick.season,
            round: pick.round,
            previousOwner: getTeamName(pick.roster_id),
            suffix: getRoundSuffix(pick.round),
            value,
          };
        })
      );

      summary.picksDropped.push(
        ...draftPicksDropped.map((pick) => {
          const value = getDraftPickValue(pick);
          summary.totalDropped += value;
          return {
            season: pick.season,
            round: pick.round,
            newOwner: getTeamName(pick.roster_id),
            suffix: getRoundSuffix(pick.round),
            value,
          };
        })
      );
    });

    // Sort picks by round
    summary.picksReceived.sort((a, b) => a.round - b.round);
    summary.picksDropped.sort((a, b) => a.round - b.round);

    return summary;
  };

  const currentRoster = rosters.find(
    (roster) => roster.roster_id === roster_id
  );
  if (!currentRoster) return <p>Roster not found</p>;

  const teamSummary = renderTeamDetails(roster_id);
  const valueDifference = teamSummary.totalAdded - teamSummary.totalDropped;

  return (
    <div className="card bg-base-200 w-full md:w-full overflow-x-auto mb-4 md:mx-auto">
      <div className="card-body">
        <h1 className="card-title ">
          Trade Summary for {getTeamName(roster_id)}
        </h1>
        <div
          key={roster_id}
          className="mb-4 flex flex-col md:flex-row items-center gap-4 justify-center "
        >
          <h2 className="text-lg font-semibold"></h2>
          <div className="mt-2">
            <p className="text-sm">Assets Added:</p>
            <ul className="text-xs">
              {teamSummary.playersAdded.map(({ playerName, value }, index) => (
                <li key={index}>
                  {playerName} - Value: {value}
                </li>
              ))}
            </ul>
            <ul className="text-xs">
              {teamSummary.picksReceived.map((pick, index) => (
                <li key={index}>
                  {pick.season} {pick.round}
                  {pick.suffix} - {pick.previousOwner} - Value: {pick.value}
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold">
              Total Added Value: {teamSummary.totalAdded}
            </p>
          </div>

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
          <div className="mt-2">
            <p className="text-sm">Assets Traded:</p>
            <ul className="text-xs">
              {teamSummary.playersDropped.map(
                ({ playerName, value }, index) => (
                  <li key={index}>
                    {playerName} - Value: {value}
                  </li>
                )
              )}
            </ul>
            <ul className="text-xs">
              {teamSummary.picksDropped.map((pick, index) => (
                <li key={index}>
                  {pick.season} {pick.round}
                  {pick.suffix} - {pick.newOwner} - Value: {pick.value}
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold">
              Total Traded Away Value: {teamSummary.totalDropped}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p
            className={classNames("text-sm font-semibold", {
              "text-green-500": valueDifference > 0,
              "text-red-500": valueDifference < 0,
            })}
          >
            Value Difference: {valueDifference}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradeSummary;
