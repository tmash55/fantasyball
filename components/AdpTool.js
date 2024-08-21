"use client";
import { fetchTop200Adp } from "@/app/api/adp/route";
import React, { useEffect, useState } from "react";

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

  const calculateConsensusPick = (rank) => {
    if (!rank) return "N/A";
    const round = Math.ceil(rank / 12);
    const pick = rank % 12 === 0 ? 12 : rank % 12;
    return `${round}.${pick.toString().padStart(2, "0")}`;
  };

  const sortedData = [...adpData].sort((a, b) => {
    if (sortConfig.key) {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "consensus_pick":
          aValue = calculateConsensusPick(a.consensus_playerrank);
          bValue = calculateConsensusPick(b.consensus_playerrank);
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
          aValue = a.consensus_playerrank;
          bValue = b.consensus_playerrank;
          break;
        case "nfcValue":
        case "espnValue":
        case "sleeperValue":
          aValue = parseFloat(
            sortConfig.key === "nfcValue"
              ? a.consensus_playerrank - a.nfc_adp
              : sortConfig.key === "espnValue"
              ? a.espn_playerrank - a.nfc_adp
              : sortConfig.key === "sleeperValue"
              ? a.sleeper_playerrank - a.nfc_adp
              : 0
          );
          bValue = parseFloat(
            sortConfig.key === "nfcValue"
              ? b.consensus_playerrank - b.nfc_adp
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
    <div className="overflow-x-auto">
      <h1 className="text-3xl font-bold mb-20 text-center">ADP Value Tool</h1>

      {/* Search Bar and Filters */}
      <div className="flex items-center justify-between mb-4">
        <label className="input input-bordered flex items-center gap-2 mb-2 w-60">
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
          <input
            type="text"
            className="grow"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

        {/* Position Filters */}
        <div className="flex space-x-4">
          {["QB", "RB", "WR", "TE"].map((position) => (
            <label key={position} className="inline-flex items-center">
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
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="ml-2">{position}</span>
            </label>
          ))}
        </div>

        {/* Platform Visibility Filters */}
        <div className="flex space-x-4">
          {Object.keys(visiblePlatforms).map((platform) => (
            <label key={platform} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={visiblePlatforms[platform]}
                onChange={(e) =>
                  setVisiblePlatforms({
                    ...visiblePlatforms,
                    [platform]: e.target.checked,
                  })
                }
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="ml-2">{platform}</span>
            </label>
          ))}
        </div>

        {/* Reset Button */}
        <button onClick={handleReset} className="btn btn-ghost text-white ml-4">
          Reset Filters
        </button>
      </div>

      {/* ADP Table */}
      <table className="table table-pin-rows table-zebra">
        <thead>
          <tr className="text-center">
            <th
              className="cursor-pointer hover:bg-base-300"
              onClick={() => handleSort("consensus_pick")}
            >
              Consensus Pick
              {renderSortIcon("consensus_pick")}
            </th>
            <th
              className="cursor-pointer hover:bg-base-300"
              onClick={() => handleSort("consensus_rank")}
            >
              Consensus Rank
              {renderSortIcon("consensus_rank")}
            </th>
            <th>Consensus Position Rank</th>
            <th className="border-r-2 border-gray-700 p-2">Full Name</th>

            {visiblePlatforms.NFC && (
              <>
                <th>NFC Position Rank</th>
                <th className="">NFC ADP</th>
                <th
                  className="border-r-2 border-gray-700 p-2 cursor-pointer hover:bg-base-300"
                  onClick={() => handleSort("nfcValue")}
                >
                  NFC Value
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
                  ESPN Rank
                  {renderSortIcon("espn_rank")}
                </th>
                <th className="">ESPN Position Rank</th>
                <th
                  className="border-r-2 border-gray-700 p-2 cursor-pointer hover:bg-base-300"
                  onClick={() => handleSort("espnValue")}
                >
                  ESPN Value
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
                  Sleeper Rank
                  {renderSortIcon("sleeper_rank")}
                </th>
                <th className="">Sleeper Position Rank</th>
                <th
                  className="p-2 cursor-pointer hover:bg-base-300"
                  onClick={() => handleSort("sleeperValue")}
                >
                  Sleeper Value
                  {renderSortIcon("sleeperValue")}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((player, index) => {
            const nfcValue = player.nfc_playerrank
              ? (player.consensus_playerrank - player.nfc_adp).toFixed(2)
              : "N/A";
            const espnValue = player.espn_playerrank
              ? (player.espn_playerrank - player.nfc_adp).toFixed(2)
              : "N/A";
            const sleeperValue = player.sleeper_playerrank
              ? (player.sleeper_playerrank - player.nfc_adp).toFixed(2)
              : "N/A";
            const consensusPick = calculateConsensusPick(
              player.consensus_playerrank
            );

            return (
              <tr key={`${player.full_name}-${index}`} className="text-center">
                <td className="">{consensusPick}</td>
                <td className="">{player.consensus_playerrank}</td>
                <td className="">{player.consensus_positionrank}</td>
                <td className="border-r-2 border-gray-700 p-2">
                  {player.full_name}
                </td>

                {visiblePlatforms.NFC && (
                  <>
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
                      className={`p-2 font-bold ${getValueClass(sleeperValue)}`}
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
  );
};

export default AdpTool;
