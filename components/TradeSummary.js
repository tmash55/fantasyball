import React from "react";

const TradeSummary = ({ trades, players, rosters, roster_id }) => {
  const getPlayerName = (playerId) => {
    const player = players[playerId];
    return player ? player.full_name : `Player ID: ${playerId}`;
  };

  const getTeamName = (rosterId) => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    console.log(
      `getTeamName - Roster ID: ${rosterId}, Owner: ${
        roster ? roster.owner : "Not Found"
      }`
    );
    return roster ? roster.owner : `Roster ID: ${rosterId}`;
  };

  const getRoundSuffix = (round) => {
    if (round === 1) return "st";
    if (round === 2) return "nd";
    if (round === 3) return "rd";
    return "th";
  };

  const renderTeamDetails = (teamId) => {
    const summary = {
      playersAdded: [],
      playersDropped: [],
      picksReceived: [],
      picksDropped: [],
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
        ...playersAdded.map(([playerId]) => getPlayerName(playerId))
      );
      summary.playersDropped.push(
        ...playersDropped.map(([playerId]) => getPlayerName(playerId))
      );
      summary.picksReceived.push(
        ...draftPicksReceived.map((pick) => ({
          season: pick.season,
          round: pick.round,
          previousOwner: getTeamName(pick.roster_id),
          suffix: getRoundSuffix(pick.round),
        }))
      );
      summary.picksDropped.push(
        ...draftPicksDropped.map((pick) => ({
          season: pick.season,
          round: pick.round,
          newOwner: getTeamName(pick.roster_id),
          suffix: getRoundSuffix(pick.round),
        }))
      );
    });

    // Sort picks by round
    summary.picksReceived.sort((a, b) => a.round - b.round);
    summary.picksDropped.sort((a, b) => a.round - b.round);

    console.log(`renderTeamDetails - Summary for team ${teamId}:`, summary);
    return summary;
  };

  console.log(`TradeSummary - roster_id: ${roster_id}`);
  console.log(`TradeSummary - rosters: `, rosters);

  const currentRoster = rosters.find(
    (roster) => roster.roster_id === roster_id
  );
  if (!currentRoster) return <p>Roster not found</p>;

  const teamSummary = renderTeamDetails(roster_id);

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
              {teamSummary.playersAdded.map((playerName, index) => (
                <li key={index}>{playerName}</li>
              ))}
            </ul>
            <ul className="text-xs">
              {teamSummary.picksReceived.map((pick, index) => (
                <li key={index}>
                  {pick.season} {pick.round}
                  {pick.suffix} - {pick.previousOwner}
                </li>
              ))}
            </ul>
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
              {teamSummary.playersDropped.map((playerName, index) => (
                <li key={index}>{playerName}</li>
              ))}
            </ul>
            <ul className="text-xs">
              {teamSummary.picksDropped.map((pick, index) => (
                <li key={index}>
                  {pick.season} {pick.round}
                  {pick.suffix} - {pick.newOwner}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSummary;
