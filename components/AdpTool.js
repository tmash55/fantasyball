"use client";
import { fetchTop200Adp } from "@/app/api/adp/route";
import React, { useEffect, useState } from "react";
import AdpToolWithPopup from "./AdpToolWithPopup";

const AdpTool = () => {
  const [adpData, setAdpData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPositions, setFilterPositions] = useState([
    "QB",
    "RB",
    "WR",
    "TE",
  ]);
  const [visiblePlatforms, setVisiblePlatforms] = useState({
    NFC: true,
    ESPN: true,
    Sleeper: true,
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTop200Adp();
        setAdpData(data);
      } catch (error) {
        console.error("Error fetching ADP data:", error);
      }
    };

    fetchData();
  }, []);

  const getValueClass = (value) => {
    if (value > 0 && value <= 5) return "bg-[#55a630]";
    if (value > 5 && value <= 10) return "bg-[#2b9348]";
    if (value < 0 && value >= -5) return "bg-[#c92517]";
    if (value < -5 && value >= -10) return "bg-[#b30f00]";
    if (value < -10) return "bg-[#990d00]";
    if (value > 10) return "bg-[#007f5f]";
    return "";
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterPositions(["QB", "RB", "WR", "TE"]);
    setVisiblePlatforms({
      NFC: true,
      ESPN: true,
      Sleeper: true,
    });
    setSortConfig({
      key: null,
      direction: "ascending",
    });
  };

  const calculateConsensusPick = (rank, index) => {
    if (!rank) return "N/A";
    const pick = (index % 12) + 1; // Ensure picks go from 1-12
    const round = Math.floor(index / 12) + 1; // Ensure the round increments properly
    return `${round}.${pick.toString().padStart(2, "0")}`;
  };

  const sortedData = [...adpData].sort((a, b) => {
    if (sortConfig.key) {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "consensus_pick":
          aValue = calculateConsensusPick(a.avg_playerrank);
          bValue = calculateConsensusPick(b.avg_playerrank);
          break;
        case "nfc_rank":
          aValue = a.nfc_playerrank;
          bValue = b.nfc_playerrank;
          break;
        case "espn_rank":
          aValue = a.espn_playerrank;
          bValue = b.espn_playerrank;
          break;
        case "sleeper_rank":
          aValue = a.sleeper_playerrank;
          bValue = b.sleeper_playerrank;
          break;
        case "consensus_rank":
          aValue = a.avg_playerrank;
          bValue = b.avg_playerrank;
          break;
        case "nfcValue":
        case "espnValue":
        case "sleeperValue":
          aValue = parseFloat(
            sortConfig.key === "nfcValue"
              ? a.avg_playerrank - a.nfc_adp
              : sortConfig.key === "espnValue"
              ? a.espn_playerrank - a.nfc_adp
              : sortConfig.key === "sleeperValue"
              ? a.sleeper_playerrank - a.nfc_adp
              : 0
          );
          bValue = parseFloat(
            sortConfig.key === "nfcValue"
              ? b.avg_playerrank - b.nfc_adp
              : sortConfig.key === "espnValue"
              ? b.espn_playerrank - b.nfc_adp
              : sortConfig.key === "sleeperValue"
              ? b.sleeper_playerrank - b.nfc_adp
              : 0
          );
          break;
        default:
          return 0;
      }

      // Handling null/undefined values
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortConfig.direction === "ascending") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    }
    return 0;
  });

  const filteredData = sortedData.filter((player) => {
    const matchesSearch = player.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesPosition =
      filterPositions.length === 0 ||
      filterPositions.some(
        (position) =>
          player.nfc_positionrank &&
          player.nfc_positionrank.startsWith(position)
      );

    return matchesSearch && matchesPosition;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 inline-block ml-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        );
      } else {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 inline-block ml-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        );
      }
    }
    return null;
  };

  return (
    <div className="">
      {/* Search Bar and Filters */}
      <div className="flex flex-wrap items-center justify-between mb-4 space-x-4 bg-gray-800 p-4 rounded-lg">
        {/* Search Bar */}
        <div className="flex items-center gap-2 ">
          <label className="input input-bordered flex items-center gap-2 w-72">
            <input
              type="text"
              className="grow"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="flex space-x-4">
          {["QB", "RB", "WR", "TE"].map((position) => (
            <label key={position} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={position}
                checked={filterPositions.includes(position)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilterPositions([...filterPositions, position]);
                  } else {
                    setFilterPositions(
                      filterPositions.filter((pos) => pos !== position)
                    );
                  }
                }}
                className="form-checkbox h-5 w-5 text-orange-500 rounded-full focus:ring-2 focus:ring-orange-400"
              />
              <span className="text-white">{position}</span>
            </label>
          ))}
        </div>

        {/* Platform Visibility Filters */}
        <div className="flex space-x-4">
          {Object.keys(visiblePlatforms).map((platform) => (
            <label key={platform} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visiblePlatforms[platform]}
                onChange={(e) =>
                  setVisiblePlatforms({
                    ...visiblePlatforms,
                    [platform]: e.target.checked,
                  })
                }
                className="form-checkbox h-5 w-5 text-orange-500 rounded-full focus:ring-2 focus:ring-orange-400"
              />
              <span className="text-white">{platform}</span>
            </label>
          ))}
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="overflow-x-auto pt-2">
        {/* ADP Table */}
        <table className="table table-pin-rows table-zebra table-xs ">
          <thead>
            <tr className="text-center text-lg">
              <th colSpan="3">
                Consensus
                <div
                  className="lg:tooltip"
                  data-tip="Data taken from ESPN and Sleeper"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-info-octagon inline-block ml-2"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z" />
                    <path d="M12 9h.01" />
                    <path d="M11 12h1v4h1" />
                  </svg>
                </div>
              </th>
              {visiblePlatforms.NFC && <th colSpan="4">NFC</th>}
              {visiblePlatforms.ESPN && <th colSpan="3">ESPN</th>}
              {visiblePlatforms.Sleeper && <th colSpan="3">Sleeper</th>}
            </tr>

            <tr className="text-center">
              <th
                className="cursor-pointer hover:bg-base-300"
                onClick={() => handleSort("consensus_pick")}
              >
                Consensus Pick
                {renderSortIcon("consensus_pick")}
              </th>
              <th className="">Full Name</th>
              <th
                className="cursor-pointer hover:bg-base-300 border-r-2 border-gray-700 p-2"
                onClick={() => handleSort("consensus_rank")}
              >
                Consensus Rank
                {renderSortIcon("consensus_rank")}
              </th>

              {visiblePlatforms.NFC && (
                <>
                  <th
                    className="cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("nfc_rank")}
                  >
                    NFC Rank
                    {renderSortIcon("nfc_rank")}
                  </th>
                  <th>Position Rank</th>
                  <th className="">ADP</th>
                  <th
                    className="border-r-2 border-gray-700 p-2 cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("nfcValue")}
                  >
                    Value
                    {renderSortIcon("nfcValue")}
                  </th>
                </>
              )}

              {visiblePlatforms.ESPN && (
                <>
                  <th
                    className="cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("espn_rank")}
                  >
                    Rank
                    {renderSortIcon("espn_rank")}
                  </th>
                  <th className="">Position Rank</th>
                  <th
                    className="border-r-2 border-gray-700 p-2 cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("espnValue")}
                  >
                    Value
                    {renderSortIcon("espnValue")}
                  </th>
                </>
              )}
              {visiblePlatforms.Sleeper && (
                <>
                  <th
                    className="cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("sleeper_rank")}
                  >
                    Rank
                    {renderSortIcon("sleeper_rank")}
                  </th>
                  <th className="">Position Rank</th>
                  <th
                    className="p-2 cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("sleeperValue")}
                  >
                    Value
                    {renderSortIcon("sleeperValue")}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((player, index) => {
              const nfcValue = player.nfc_playerrank
                ? (player.avg_playerrank - player.nfc_adp).toFixed(2)
                : "N/A";
              const espnValue = player.espn_playerrank
                ? (player.espn_playerrank - player.nfc_adp).toFixed(2)
                : "N/A";
              const sleeperValue = player.sleeper_playerrank
                ? (player.sleeper_playerrank - player.nfc_adp).toFixed(2)
                : "N/A";
              const consensusPick = calculateConsensusPick(
                player.avg_playerrank,
                index
              );

              return (
                <tr
                  key={`${player.full_name}-${index}`}
                  className="text-center"
                >
                  <td className="">{player.consensus_pick}</td>
                  <td>{player.full_name}</td>
                  <td className="border-r-2 border-gray-700">
                    {player.avg_playerrank}
                  </td>

                  {visiblePlatforms.NFC && (
                    <>
                      <td>{player.nfc_playerrank}</td>
                      <td>{player.nfc_positionrank}</td>
                      <td className="">{player.nfc_adp}</td>
                      <td
                        className={`border-r-2 border-gray-700 p-2 font-bold ${getValueClass(
                          nfcValue
                        )}`}
                      >
                        {nfcValue}
                      </td>
                    </>
                  )}

                  {visiblePlatforms.ESPN && (
                    <>
                      <td className="">{player.espn_playerrank}</td>
                      <td className="">{player.espn_positionrank}</td>
                      <td
                        className={`border-r-2 border-gray-700 p-2 font-bold ${getValueClass(
                          espnValue
                        )}`}
                      >
                        {espnValue}
                      </td>
                    </>
                  )}
                  {visiblePlatforms.Sleeper && (
                    <>
                      <td className="">{player.sleeper_playerrank}</td>
                      <td className="">{player.sleeper_positionrank}</td>
                      <td
                        className={`p-2 font-bold ${getValueClass(
                          sleeperValue
                        )}`}
                      >
                        {sleeperValue}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdpTool;
