import { useState, useEffect } from "react";
import PlayerCard from "./PlayerCard"; // Import the PlayerCard component

const TeamTable = ({ players, position, playerAdps }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const filteredPlayers = players
    .filter((player) => player.position === position)
    .sort((a, b) => {
      const rankA = parseFloat(playerAdps[a.id]?.adp) || Infinity;
      const rankB = parseFloat(playerAdps[b.id]?.adp) || Infinity;
      return rankA - rankB;
    });

  const displayedPlayers = expanded
    ? filteredPlayers
    : filteredPlayers.slice(0, 6);

  const getRowClass = (rankNumber) => {
    if (rankNumber >= 1 && rankNumber <= 12) {
      return "bg-[#007f5f]";
    } else if (rankNumber >= 13 && rankNumber <= 24) {
      return " bg-[#2b9348]";
    } else if (rankNumber >= 25 && rankNumber <= 36) {
      return " bg-[#55a630]";
    } else if (rankNumber >= 37 && rankNumber <= 48) {
      return "bg-[#80b918]";
    } else if (rankNumber >= 49 && rankNumber <= 60) {
      return "bg-[#2A3439]";
    } else if (rankNumber >= 61 && rankNumber <= 72) {
      return "bg-[#ea9c00]";
    } else {
      return "bg-[#333533]";
    }
  };

  const handlePlayerClick = (player) => {
    const [firstName, ...rest] = player.name.split(" ");
    const lastName = rest.join(" ");
    setSelectedPlayer({
      ...player,
      first_name: firstName,
      last_name: lastName,
    });
  };

  useEffect(() => {
    if (selectedPlayer) {
      document.getElementById("player_modal").showModal();
    }
  }, [selectedPlayer]);

  return (
    <div className="mb-4 overflow-auto h-full">
      <h2 className="text-2xl font-extrabold mb-4 text-center text-white">
        {position}
      </h2>
      <table className="min-w-full bg-gradient-to-br from-gray-800 to-gray-900 text-slate-50 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-gray-700 text-gray-300 text-xs sm:text-sm uppercase tracking-wide">
            <th className="py-3 px-2 sm:px-4 text-left">Player</th>
            <th className="py-3 px-2 sm:px-4 text-center">Position Rank</th>
            <th className="py-3 px-2 sm:px-4 text-center">UD ADP</th>
            <th className="py-3 px-2 sm:px-4 text-center">Dynasty Value</th>
          </tr>
        </thead>
        <tbody>
          {displayedPlayers.map((player) => {
            const positionRank = playerAdps[player.id]?.positionRank || "-";
            const rankNumber =
              parseFloat(positionRank.replace(/^[A-Z]+/, "")) || Infinity;

            return (
              <tr
                key={player.id}
                className={`${getRowClass(
                  rankNumber
                )} hover:bg-gray-700 hover:bg-opacity-60 cursor-pointer transition duration-200 ease-in-out`}
                onClick={() => handlePlayerClick(player)}
              >
                <td className="py-3 px-2 sm:px-4 border-b border-gray-700 text-xs sm:text-sm text-left font-semibold">
                  {player.name}
                </td>
                <td className="py-3 px-2 sm:px-4 border-b border-gray-700 text-xs sm:text-sm text-center">
                  {positionRank}
                </td>
                <td className="py-3 px-2 sm:px-4 border-b border-gray-700 text-xs sm:text-sm text-center">
                  {playerAdps[player.id]?.adp || "-"}
                </td>
                <td className="py-3 px-2 sm:px-4 border-b border-gray-700 text-xs sm:text-sm text-center">
                  {playerAdps[player.id]?.dynastyValue || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filteredPlayers.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-semibold text-gray-400 hover:text-white transition"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}

      {selectedPlayer && (
        <dialog id="player_modal" className="modal bg-transparent p-0">
          <div className="modal-box bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-lg p-6 max-w-xl">
            <PlayerCard player={selectedPlayer} />
            <div className="modal-action justify-center mt-4">
              <button
                className="btn btn-outline text-white border-gray-500 hover:bg-gray-700 hover:border-gray-500"
                onClick={() => {
                  document.getElementById("player_modal").close();
                  setSelectedPlayer(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default TeamTable;
