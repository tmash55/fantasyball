"use client";

import { fetchTdPropsWeekData } from "@/app/api/props/td-props-week-1/route";
import { MostRecentDateTD } from "@/utils/MostRecentDateTD";
import React, { useEffect, useState } from "react";

const WeekTds = () => {
  const [tdPropsData, setTdPropsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [mostRecentDate, setMostRecentDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [selectedWeek, setSelectedWeek] = useState("1"); // Added state for selected week
  const [showCompletedGames, setShowCompletedGames] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState([]);
  const [selectedGame, setSelectedGame] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading state to true at the start
      try {
        const data = await fetchTdPropsWeekData(selectedWeek); // Fetch data using dynamic week

        if (!data || data.length === 0) {
          console.error("No data fetched or data is empty.");
          return; // Exit early if no data is fetched
        }

        // Sort the fetched data: completed games move to the bottom, and then sort by new_datetime in ascending order
        const sortedData = data
          .filter((player) => player.new_datetime) // Ensure the new_datetime exists
          .sort((a, b) => {
            // First, sort by the completed status
            if (a.is_completed === 1 && b.is_completed !== 1) return 1; // 'a' completed, 'b' not completed -> 'a' after 'b'
            if (a.is_completed !== 1 && b.is_completed === 1) return -1; // 'a' not completed, 'b' completed -> 'a' before 'b'

            // If both are completed or not, sort by new_datetime in ascending order
            return new Date(a.new_datetime) - new Date(b.new_datetime);
          });

        setTdPropsData(sortedData); // Correctly set the sorted data to state
        setFilteredData(sortedData); // Also set filtered data for sorting or filtering later
        setSortConfig({ key: "new_datetime", direction: "asc" }); // Initialize sort config to date field
      } catch (err) {
        setError(err.message); // Set error state
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false); // Set loading state to false once the fetch is complete
      }
    };

    fetchData();
  }, [selectedWeek]); // Dependency array includes selectedWeek to re-fetch when it changes
  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        // Ascending icon (up arrow)
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
            <path d="M12 4l-4 4h8z" /> {/* Up arrow path */}
          </svg>
        );
      } else {
        // Descending icon (down arrow)
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
            <path d="M12 20l4 -4h-8z" /> {/* Down arrow path */}
          </svg>
        );
      }
    }

    // Default unsorted icon (both arrows)
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
        <path d="M12 4l-4 4h8z" /> {/* Up arrow path */}
        <path d="M12 20l4 -4h-8z" /> {/* Down arrow path */}
      </svg>
    );
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData]
      .filter((player) => player[key] !== "N/A") // Exclude "N/A" values
      .sort((a, b) => {
        if (a[key] === null) return 1;
        if (b[key] === null) return -1;
        if (a[key] === b[key]) return 0;

        // Check if the values are numeric
        const aNum = parseFloat(a[key]);
        const bNum = parseFloat(b[key]);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return direction === "asc" ? aNum - bNum : bNum - aNum; // Numeric sort
        }

        // Handle sorting by date for new_datetime field
        if (key === "new_datetime") {
          const aDate = new Date(a[key]);
          const bDate = new Date(b[key]);
          return direction === "asc" ? aDate - bDate : bDate - aDate; // Date sort
        }

        // Fallback to string comparison if not numeric or date
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      });

    setFilteredData(sortedData);
  };

  useEffect(() => {
    const fetchMostRecentDate = async () => {
      const date = await MostRecentDateTD();
      setMostRecentDate(date);
    };
    fetchMostRecentDate();
  }, []);

  // Handle filter logic
  useEffect(() => {
    const filtered = tdPropsData.filter((player) => {
      const matchesSearchQuery =
        searchQuery === "" ||
        player.player?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition =
        selectedPosition.length === 0 ||
        selectedPosition.includes(player.position);
      const matchesGame =
        selectedGame.length === 0 || selectedGame.includes(player.game);
      const matchesTeam =
        selectedTeam.length === 0 || selectedTeam.includes(player.team);
      const matchesCompleted = !showCompletedGames || player.is_completed === 1;

      return (
        matchesSearchQuery &&
        matchesPosition &&
        matchesGame &&
        matchesTeam &&
        matchesCompleted
      );
    });
    setFilteredData(filtered);
  }, [
    searchQuery,
    selectedPosition,
    selectedGame,
    selectedTeam,
    tdPropsData,
    showCompletedGames,
  ]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedPosition([]);
    setSelectedGame([]);
    setSelectedTeam([]);
    setSortConfig({ key: "", direction: "asc" }); // Reset the sortConfig state
    setShowCompletedGames(false);
  };

  // Handle week change
  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const weekOptions = Array.from({ length: 18 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`,
    disabled: i > 0, // Disable all weeks except week 1 for now
  }));

  // If loading, display a loading message or spinner
  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  // If there is an error, display the error message
  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex p-4 text-sm">
        <p className="italic">last updated: {mostRecentDate}</p>
      </div>

      {/* Week Selector */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="w-full md:w-auto">
          <select
            value={selectedWeek}
            onChange={handleWeekChange}
            className="select select-bordered w-full md:w-auto"
          >
            {weekOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* Toggle for Completed Games */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="completedGames"
            className="form-checkbox"
            checked={showCompletedGames}
            onChange={(e) => setShowCompletedGames(e.target.checked)}
          />
          <label htmlFor="completedGames" className="ml-2">
            Show Completed Games Only
          </label>
        </div>
      </div>

      {/* Search Bar and Filters */}
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2 md:space-y-0 bg-gray-800 p-2 md:p-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="input input-bordered flex items-center gap-2 w-full md:w-60">
            <input
              type="text"
              className="grow"
              placeholder="Search"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
        </div>

        {/* Position Filters */}
        <div className="dropdown w-full md:w-auto">
          <label
            tabIndex={0}
            className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB] hover:text-gray-800"
          >
            Position Filters
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full md:w-52 z-50"
          >
            {["QB", "RB", "WR", "TE", "DEF"].map((position) => (
              <li key={position}>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={position}
                    checked={selectedPosition.includes(position)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosition([...selectedPosition, position]);
                      } else {
                        setSelectedPosition(
                          selectedPosition.filter((pos) => pos !== position)
                        );
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-orange-400 rounded-full focus:ring-2 focus:ring-orange-400"
                  />
                  <span>{position}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Game Filters */}
        <div className="dropdown w-full md:w-auto">
          <label
            tabIndex={0}
            className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB]  hover:text-gray-800"
          >
            Game Filters
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full md:w-[17rem] z-50 max-h-[24rem] overflow-y-auto"
          >
            {Array.from(
              new Map(
                tdPropsData
                  .filter((player) => player.game && player.new_datetime)
                  .map((player) => [
                    player.game,
                    { game: player.game, date: new Date(player.new_datetime) },
                  ])
              ).values()
            )
              .sort((a, b) => a.date - b.date)
              .map(({ game }, index) => (
                <li key={index}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={game}
                      checked={selectedGame.includes(game)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGame([...selectedGame, game]);
                        } else {
                          setSelectedGame(
                            selectedGame.filter((g) => g !== game)
                          );
                        }
                      }}
                      className="form-checkbox h-5 w-5 text-orange-400 rounded-full focus:ring-2 focus:ring-orange-400"
                    />
                    <span>{game}</span>
                  </label>
                </li>
              ))}
          </ul>
        </div>

        {/* Team Filters */}
        <div className="dropdown w-full md:w-auto">
          <label
            tabIndex={0}
            className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB]  hover:text-gray-800"
          >
            Team Filters
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full md:w-[17rem] z-50 max-h-[24rem] overflow-y-auto"
          >
            {Array.from(new Set(tdPropsData.map((player) => player.team)))
              .filter(Boolean) // Remove any null or undefined values
              .sort() // Sort teams alphabetically
              .map((team, index) => (
                <li key={index}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={team || ""}
                      checked={selectedTeam.includes(team)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeam([...selectedTeam, team]);
                        } else {
                          setSelectedTeam(
                            selectedTeam.filter((t) => t !== team)
                          );
                        }
                      }}
                      className="form-checkbox h-5 w-5 text-orange-400 rounded-full focus:ring-2 focus:ring-orange-400"
                    />
                    <span>{team}</span>
                  </label>
                </li>
              ))}
          </ul>
        </div>

        {/* Reset Button */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleReset}
            className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB]  hover:text-gray-800"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="text-[15px] bg-gray-800">
              <th
                onClick={() => handleSort("player")}
                className="cursor-pointer hover:bg-base-300"
              >
                Player {renderSortIcon("player")}
              </th>
              <th>Team</th>
              <th>Position</th>
              <th
                onClick={() => handleSort("game")}
                className="cursor-pointer hover:bg-base-300"
              >
                Game {renderSortIcon("game")}
              </th>
              <th>Date</th>
              <th
                onClick={() => handleSort("first_td_odds")}
                className="cursor-pointer hover:bg-base-300"
              >
                First TD Odds {renderSortIcon("first_td_odds")}
              </th>
              <th
                onClick={() => handleSort("anytime_td_odds")}
                className="cursor-pointer hover:bg-base-300"
              >
                Anytime TD Odds {renderSortIcon("anytime_td_odds")}
              </th>
              <th
                onClick={() => handleSort("two_plus_td_odds")}
                className="cursor-pointer hover:bg-base-300"
              >
                2+ TD Odds {renderSortIcon("two_plus_td_odds")}
              </th>
              <th>Game Completed</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((player, index) => {
              const isCompleted = player.is_completed === 1;
              const hasScoredTD =
                player.first_td === 1 ||
                player.anytime_td === 1 ||
                player.two_plus_td === 1;

              // Apply opacity if game is completed and player has not scored any TD
              const rowOpacity =
                isCompleted && !hasScoredTD ? "opacity-50" : "";

              return (
                <tr key={index} className={`${rowOpacity}`}>
                  <td>{player.player}</td>
                  <td>{player.team}</td>
                  <td>{player.position}</td>
                  <td>{player.game}</td>
                  <td>{new Date(player.new_datetime).toLocaleString()}</td>
                  <td
                    className={`${
                      player.first_td === 1
                        ? "text-green-500"
                        : isCompleted
                        ? "text-gray-600"
                        : ""
                    }`}
                  >
                    {player.first_td_odds}
                  </td>
                  <td
                    className={`${
                      player.anytime_td === 1
                        ? "text-green-500"
                        : isCompleted
                        ? "text-gray-600"
                        : ""
                    }`}
                  >
                    {player.anytime_td_odds}
                  </td>
                  <td
                    className={`${
                      player.two_plus_tds === 1
                        ? "text-green-500"
                        : isCompleted
                        ? "text-gray-600"
                        : ""
                    }`}
                  >
                    {player.two_plus_td_odds}
                  </td>
                  <td>{isCompleted ? "Yes" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeekTds;
