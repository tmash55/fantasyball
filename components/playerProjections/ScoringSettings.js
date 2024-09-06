"use client";

import React from "react";

const ScoringSettings = ({ settings, onChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...settings,
      [name]: Number(value),
    });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg w-60">
      <h3 className="text-lg font-semibold mb-4 text-white">
        Scoring Settings
      </h3>
      <div className="space-y-2">
        {Object.keys(settings).map((key) => (
          <div key={key} className="flex justify-between items-center">
            <label className="text-white">
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              :
            </label>
            <input
              type="number"
              name={key}
              value={settings[key]}
              onChange={handleInputChange}
              className="input input-bordered w-24 text-black"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoringSettings;
