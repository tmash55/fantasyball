"use client";
import React, { useState, useEffect } from "react";

const PlayerTable = ({ players = [] }) => {
  // State to store sort configuration
  const [sortConfig, setSortConfig] = useState({
    key: "name", // Default sorting key
    direction: "ascending", // Default sorting direction
  });

  // Ensure players is initialized as an array
  const sortedPlayers = [...players].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Function to handle sorting
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th onClick={() => handleSort("name")} className="cursor-pointer">
            Name
          </th>
          <th
            onClick={() => handleSort("passingYards")}
            className="cursor-pointer"
          >
            Passing Yards
          </th>
          {/* Add more columns here as needed */}
        </tr>
      </thead>
      <tbody>
        {sortedPlayers.map((player) => (
          <tr key={player.id}>
            <td>{player.name}</td>
            <td>{player.passingYards}</td>
            {/* Add more player data here */}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlayerTable;
