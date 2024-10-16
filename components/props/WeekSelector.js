import React from "react";

const WeekSelector = ({ selectedWeek, onWeekChange }) => {
  const weeks = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
  ];

  return (
    <div className="flex items-center space-x-2">
      <select
        className="select select-bordered  bg-gray-800 text-white  w-full max-w-xs"
        value={selectedWeek}
        onChange={(e) => onWeekChange(e.target.value)}
      >
        {weeks.map((week) => (
          <option
            key={week}
            value={week}
            disabled={week !== "1" && week !== "2"}
          >
            Week {week}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WeekSelector;
