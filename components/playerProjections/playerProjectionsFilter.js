"use client";

import React from "react";

const Filters = ({ filters, onChange }) => {
  const handleSearchChange = (e) => {
    onChange({ ...filters, searchQuery: e.target.value });
  };

  const handlePositionChange = (position) => {
    const newPositions = filters.position.includes(position)
      ? filters.position.filter((p) => p !== position)
      : [...filters.position, position];
    onChange({ ...filters, position: newPositions });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg w-60">
      <h3 className="text-lg font-semibold mb-4 text-white">Filters</h3>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search by player name..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="input input-bordered w-full text-black mb-2"
        />
        <div>
          <h4 className="font-semibold text-white">Positions:</h4>
          {["QB", "RB", "WR", "TE"].map((position) => (
            <label
              key={position}
              className="flex items-center space-x-2 text-white"
            >
              <input
                type="checkbox"
                checked={filters.position.includes(position)}
                onChange={() => handlePositionChange(position)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>{position}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
