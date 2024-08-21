"use client";
import { fetchTop200Adp } from "@/app/api/adp/route";
import React, { useEffect, useState } from "react";

const AdpTool = () => {
  const [adpData, setAdpData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPositions, setFilterPositions] = useState([]);
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

  const sortedData = [...adpData].sort((a, b) => {
    if (sortConfig.key) {
      let aValue, bValue;

      if (sortConfig.key === "nfc_rank") {
        aValue = a.nfc_playerrank;
        bValue = b.nfc_playerrank;
      } else {
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
      }

      if (sortConfig.direction === "ascending") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
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

  return (
    <div className="overflow-x-auto">
      <h1 className="text-3xl font-bold mb-20 text-center">
        Top 200 ADP Players
      </h1>

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
      </div>

      {/* ADP Table */}
      <table className="table table-pin-rows">
        <thead>
          <tr>
            <th
              className="cursor-pointer"
              onClick={() => handleSort("nfc_rank")}
            >
              NFC Rank
            </th>
            <th className="">Full Name</th>
            {visiblePlatforms.NFC && (
              <>
                <th>NFC Position Rank</th>
                <th className="border-r-2 border-gray-700 p-2">NFC ADP</th>
              </>
            )}
            <th className="">Consensus</th>
            <th
              className="border-r-2 border-gray-700 p-2 cursor-pointer"
              onClick={() => handleSort("nfcValue")}
            >
              NFC Value
            </th>
            {visiblePlatforms.ESPN && (
              <>
                <th className="">ESPN Rank</th>
                <th className="">ESPN Position Rank</th>
                <th
                  className="border-r-2 border-gray-700 p-2 cursor-pointer"
                  onClick={() => handleSort("espnValue")}
                >
                  ESPN Value
                </th>
              </>
            )}
            {visiblePlatforms.Sleeper && (
              <>
                <th className="">Sleeper Rank</th>
                <th className="">Sleeper Position Rank</th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("sleeperValue")}
                >
                  Sleeper Value
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

            return (
              <tr key={`${player.full_name}-${index}`} className="text-center">
                <td className="">{player.nfc_playerrank}</td>
                <td className="">{player.full_name}</td>
                {visiblePlatforms.NFC && (
                  <>
                    <td>{player.nfc_positionrank}</td>
                    <td className="border-r-2 border-gray-700 p-2">
                      {player.nfc_adp}
                    </td>
                  </>
                )}
                <td className="">{player.avg_playerrank}</td>
                <td
                  className={`border-r-2 border-gray-700 p-2 font-bold ${getValueClass(
                    nfcValue
                  )}`}
                >
                  {nfcValue}
                </td>
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
