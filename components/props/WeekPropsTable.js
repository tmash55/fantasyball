import React, { useState } from "react";

const WeekPropsTable = ({ weekData, activePropType }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...weekData].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = parseFloat(a[sortConfig.key]) || 0; // Ensure it's a number
      const bValue = parseFloat(b[sortConfig.key]) || 0; // Ensure it's a number

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    }
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        // Ascending icon
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 inline-block ml-1"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M8 9l4 -4l4 4" />
          </svg>
        );
      } else {
        // Descending icon
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 inline-block ml-1"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M16 15l-4 4l-4 -4" />
          </svg>
        );
      }
    }

    // Default unsorted icon
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 inline-block ml-1"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 9l4 -4l4 4" />
        <path d="M16 15l-4 4l-4 -4" />
      </svg>
    );
  };

  const renderRows = () => {
    return sortedData.map((player, index) => {
      switch (activePropType) {
        case "passing":
          return (
            <>
              <tr key={`${index}-over`} className="border-b border-gray-700">
                <td className="p-2" rowSpan="2">
                  <div>
                    <span className="font-bold">{player.player}</span>
                    <div className="text-sm text-gray-400">
                      {player.position} - {player.team}
                    </div>
                    <div className="text-xs text-gray-400">{player.game}</div>
                  </div>
                </td>
                <td className="p-2" rowSpan="2">
                  {player.passyardsou}
                </td>
                <td className="p-2">
                  O {player.passtdsnumber} {player.passtdsoverodds}
                </td>
                <td className="p-2" rowSpan="2">
                  {player.passattempts}
                </td>
                <td className="p-2" rowSpan="2">
                  {player.passcompletions}
                </td>
              </tr>
              <tr key={`${index}-under`} className="border-b border-gray-700">
                <td className="p-2">
                  U {player.passtdsnumber} {player.passtdsunderodds}
                </td>
              </tr>
            </>
          );

        case "receiving":
          return (
            <tr key={index} className="border-b border-gray-700">
              <td className="p-2">
                <div>
                  <span className="font-bold">{player.player}</span>
                  <div className="text-sm text-gray-400">
                    {player.position} - {player.team}
                  </div>
                </div>
              </td>
              <td className="p-2">{player.receivingyardsou}</td>
              <td className="p-2">{player.receptions}</td>
            </tr>
          );

        case "rushing":
          return (
            <tr key={index} className="border-b border-gray-700">
              <td className="p-2">
                <div>
                  <span className="font-bold">{player.player}</span>
                  <div className="text-sm text-gray-400">
                    {player.position} - {player.team}
                  </div>
                </div>
              </td>
              <td className="p-2">{player.rushyardsou}</td>
              <td className="p-2">{player.rushattempts}</td>
            </tr>
          );

        default:
          return null;
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2">Player</th>
            {activePropType === "passing" && (
              <>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("passyardsou")}
                >
                  Passing Yards O/U {renderSortIcon("passyardsou")}
                </th>
                <th className="p-2">TDs</th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("passattempts")}
                >
                  Attempts {renderSortIcon("passattempts")}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("passcompletions")}
                >
                  Completions {renderSortIcon("passcompletions")}
                </th>
              </>
            )}
            {activePropType === "receiving" && (
              <>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("receivingyardsou")}
                >
                  Receiving Yards O/U {renderSortIcon("receivingyardsou")}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("receptions")}
                >
                  Receptions {renderSortIcon("receptions")}
                </th>
              </>
            )}
            {activePropType === "rushing" && (
              <>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("rushyardsou")}
                >
                  Rushing Yards O/U {renderSortIcon("rushyardsou")}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("rushattempts")}
                >
                  Attempts {renderSortIcon("rushattempts")}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    </div>
  );
};

export default WeekPropsTable;
