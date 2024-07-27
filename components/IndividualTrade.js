import React from "react";

const IndividualTrade = ({ trade, players, rosters }) => {
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
        <h5 className="text-lg font-semibold">{getTeamName(teamId)}</h5>
        {playersAdded.length > 0 && (
          <div className="mt-2">
            {playersAdded.map(([playerId]) => (
              <p key={playerId} className="text-sm">
                {getPlayerName(playerId)}
              </p>
            ))}
          </div>
        )}
        {draftPicksReceived.length > 0 && (
          <div className="mt-2">
            {draftPicksReceived.map((pick) => (
              <p key={`${pick.season}-${pick.round}`} className="text-sm">
                {pick.season} {pick.round}
                {getRoundSuffix(pick.round)} -{" "}
                {getTeamName(pick.previous_owner_id)}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card bg-base-200 w-full md:w-96 overflow-x-auto mb-4">
      <div className="card-body">
        <h1 className="card-title mb-4">Trade {trade.transaction_id}</h1>
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
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-switch-horizontal"
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
