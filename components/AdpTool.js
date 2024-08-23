"use client";
import { fetchTop200Adp } from "@/app/api/adp/route";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";

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
    Yahoo: true, // Added Yahoo here
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
    //if (value > 0 && value <= 5) return "bg-[#55a630]";
    //if (value > 5 && value <= 10) return "bg-[#2b9348]";
    //if (value < 0 && value >= -5) return "bg-[#c92517]";
    //if (value < -5 && value >= -10) return "bg-[#FA3C48] text-base-300 bg-opacity-95";
    if (value < -10) return "bg-red-500 text-base-300";
    if (value > 10) return "bg-[#7ADF61] text-base-300 bg-opacity-95";
    if (value) return "";
  };
  const handleDownloadCSV = () => {
    const headers = [
      "Consensus Pick",
      "Full Name",
      "Consensus Rank",
      ...(visiblePlatforms.NFC
        ? ["NFC Rank", "Position Rank", "ADP", "Value"]
        : []),
      ...(visiblePlatforms.ESPN ? ["ESPN Rank", "Position Rank", "Value"] : []),
      ...(visiblePlatforms.Sleeper
        ? ["Sleeper Rank", "Position Rank", "Value"]
        : []),
      ...(visiblePlatforms.Yahoo
        ? ["Yahoo Rank", "Position Rank", "Value"]
        : []),
    ];

    const csvData = filteredData.map((player, index) => {
      const consensusValue = player.nfc_playerrank
        ? (player.avg_playerrank - player.nfc_adp).toFixed(2)
        : "N/A";
      const espnValue = player.espn_playerrank
        ? (player.espn_playerrank - player.nfc_adp).toFixed(2)
        : "N/A";
      const sleeperValue = player.sleeper_playerrank
        ? (player.sleeper_playerrank - player.nfc_adp).toFixed(2)
        : "N/A";
      const yahooValue = player.yahoo_playerrank
        ? (player.yahoo_playerrank - player.nfc_adp).toFixed(2)
        : "N/A";
      const consensusPick = calculateConsensusPick(
        player.avg_playerrank,
        index
      );

      return {
        "Consensus Pick": consensusPick,
        "Full Name": player.full_name,
        "Consensus Rank": player.avg_playerrank,
        ...(visiblePlatforms.NFC
          ? {
              "NFC Rank": player.nfc_playerrank || "N/A",
              "Position Rank": player.nfc_positionrank || "N/A",
              ADP: player.nfc_adp || "N/A",
              Value: consensusValue !== "N/A" ? consensusValue : "",
            }
          : {}),
        ...(visiblePlatforms.ESPN
          ? {
              "ESPN Rank": player.espn_playerrank || "N/A",
              "Position Rank": player.espn_positionrank || "N/A",
              Value: espnValue !== "N/A" ? espnValue : "",
            }
          : {}),
        ...(visiblePlatforms.Sleeper
          ? {
              "Sleeper Rank": player.sleeper_playerrank || "N/A",
              "Position Rank": player.sleeper_positionrank || "N/A",
              Value: sleeperValue !== "N/A" ? sleeperValue : "",
            }
          : {}),
        ...(visiblePlatforms.Yahoo
          ? {
              "Yahoo Rank": player.yahoo_playerrank || "N/A",
              "Position Rank": player.yahoo_positionrank || "N/A",
              Value: yahooValue !== "N/A" ? yahooValue : "",
            }
          : {}),
      };
    });

    const csv = Papa.unparse({
      fields: headers,
      data: csvData,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "adp_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  const getValue = (rank, adp) => {
    if (!rank || !adp) return "N/A";
    return (rank - adp).toFixed(2);
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
      Yahoo: true, // Added Yahoo here
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
        case "consensus_pick": {
          // Split the consensus_pick into round and pick parts
          const [aRound, aPick] = a.consensus_pick.split(".").map(Number);
          const [bRound, bPick] = b.consensus_pick.split(".").map(Number);

          // Compare by round first, then by pick
          if (aRound !== bRound) {
            aValue = aRound;
            bValue = bRound;
          } else {
            aValue = aPick;
            bValue = bPick;
          }
          break;
        }

        case "nfc_rank":
          aValue = a.nfc_playerrank;
          bValue = b.nfc_playerrank;
          break;
        case "nfc_adp":
          aValue = a.nfc_adp;
          bValue = b.nfc_adp;
          break;
        case "espn_rank":
          aValue = a.espn_playerrank;
          bValue = b.espn_playerrank;
          break;
        case "sleeper_rank":
          aValue = a.sleeper_playerrank;
          bValue = b.sleeper_playerrank;
          break;
        case "yahoo_rank":
          aValue = a.yahoo_playerrank;
          bValue = b.yahoo_playerrank;
          break;
        case "consensus_rank":
          aValue = a.avg_playerrank;
          bValue = b.avg_playerrank;
          if (aValue === bValue) {
            // Secondary sort by full_name to ensure stable sorting
            return a.full_name.localeCompare(b.full_name);
          }
          break;
        case "consensusValue":
        case "espnValue":
        case "sleeperValue":
        case "yahooValue":
          aValue = parseFloat(
            sortConfig.key === "consensusValue"
              ? a.avg_playerrank - a.nfc_adp
              : sortConfig.key === "espnValue"
              ? a.espn_playerrank - a.nfc_adp
              : sortConfig.key === "sleeperValue"
              ? a.sleeper_playerrank - a.nfc_adp
              : sortConfig.key === "yahooValue"
              ? a.yahoo_playerrank - a.nfc_adp
              : 0
          );
          bValue = parseFloat(
            sortConfig.key === "consensusValue"
              ? b.avg_playerrank - b.nfc_adp
              : sortConfig.key === "espnValue"
              ? b.espn_playerrank - b.nfc_adp
              : sortConfig.key === "sleeperValue"
              ? b.sleeper_playerrank - b.nfc_adp
              : sortConfig.key === "yahooValue"
              ? b.yahoo_playerrank - b.nfc_adp
              : 0
          );
          break;
        default:
          return 0;
      }

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
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-4 md:space-y-0 bg-gray-800 p-4 rounded-lg">
        {/* Search Bar */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="input input-bordered flex items-center gap-2 w-full md:w-72">
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
        <div className="dropdown w-full md:w-auto">
          <label
            tabIndex={0}
            className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB]"
          >
            Position Filters
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full md:w-52 z-50"
          >
            {["QB", "RB", "WR", "TE"].map((position) => (
              <li key={position}>
                <label className="flex items-center space-x-2">
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
                    className="form-checkbox h-5 w-5 text-orange-400 rounded-full focus:ring-2 focus:ring-orange-400"
                  />
                  <span>{position}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform Filters */}
        <div className="dropdown w-full md:w-auto">
          <label
            tabIndex={0}
            className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB]"
          >
            Platform Filters
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full md:w-52 z-50"
          >
            {Object.keys(visiblePlatforms).map((platform) => (
              <li key={platform}>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={visiblePlatforms[platform]}
                    onChange={(e) =>
                      setVisiblePlatforms({
                        ...visiblePlatforms,
                        [platform]: e.target.checked,
                      })
                    }
                    className="form-checkbox h-5 w-5 text-orange-400 rounded-full focus:ring-2 focus:ring-orange-400"
                  />
                  <span>{platform}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Reset Button */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleReset}
            className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB]"
          >
            Reset Filters
          </button>
        </div>

        {/* CSV Download Button */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleDownloadCSV}
            className="btn m-1 w-full md:w-auto btn-outline border-orange-400 text-orange-400 hover:bg-orange-400 hover:border-orange-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="icon icon-tabler icons-tabler-outline icon-tabler-download"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
              <path d="M7 11l5 5l5 -5" />
              <path d="M12 4l0 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[800px] ">
        {/* ADP Table */}
        <table className="table table-pin-rows table-zebra ">
          <thead className="sticky top-0 bg-gray-800 z-20">
            <tr className="text-center  relative">
              <th colSpan="1" className=" w-[12rem] bg-gray-900"></th>
              <th
                colSpan="2"
                className="border-r-2 border-gray-700 min-w-[12rem] bg-gray-900"
              ></th>
              {visiblePlatforms.NFC && (
                <th
                  colSpan="2"
                  className="border-r-2 border-gray-700 bg-gray-900"
                >
                  <span className="text-lg">NFC ADP</span>
                  <br />
                  (High Stakes)
                </th>
              )}
              <th
                colSpan="2"
                className="border-r-2 border-gray-700 bg-gray-900"
              >
                <span className="text-lg">Consensus</span>
                <br />
                (ESPN/Sleeper/Yahoo AVG)
              </th>

              {visiblePlatforms.ESPN && (
                <th
                  colSpan="3"
                  className="border-r-2 border-gray-700 text-lg bg-gray-900"
                >
                  ESPN
                </th>
              )}
              {visiblePlatforms.Sleeper && (
                <th
                  colSpan="3"
                  className="border-r-2 border-gray-700 text-lg bg-gray-900"
                >
                  Sleeper
                </th>
              )}
              {visiblePlatforms.Yahoo && (
                <th colSpan="3" className="text-lg bg-gray-900">
                  Yahoo
                </th>
              )}
            </tr>

            <tr className="text-center bg-gray-800 z-20">
              <th
                className="cursor-pointer hover:bg-base-300"
                onClick={() => handleSort("consensus_pick")}
              >
                Consensus Pick
                {renderSortIcon("consensus_pick")}
              </th>
              <th
                className="sticky top-0 left-0 bg-gray-800 border-r-2 border-gray-700 z-50 "
                colSpan="2"
                style={{ boxShadow: "2px 0 5px -2px rgba(0, 0, 0, 0.75)" }}
              >
                Full Name
              </th>

              {visiblePlatforms.NFC && (
                <>
                  <th>NFC Pos. Rank</th>
                  <th
                    className="border-r-2 border-gray-700 cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("nfc_adp")}
                  >
                    NFC ADP
                  </th>
                </>
              )}
              <th
                className="cursor-pointer hover:bg-base-300  p-2"
                onClick={() => handleSort("consensus_rank")}
              >
                Consensus Rank
                {renderSortIcon("consensus_rank")}
              </th>
              <th
                className="border-r-2 border-gray-700 p-2 cursor-pointer hover:bg-base-300"
                onClick={() => handleSort("consensusValue")}
              >
                Consensus Value
                {renderSortIcon("consensusValue")}
              </th>

              {visiblePlatforms.ESPN && (
                <>
                  <th
                    className="cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("espn_rank")}
                  >
                    Rank
                    {renderSortIcon("espn_rank")}
                  </th>
                  <th className=""> Pos. Rank</th>
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
                  <th className="">Pos. Rank</th>
                  <th
                    className="border-r-2 border-gray-700 p-2 cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("sleeperValue")}
                  >
                    Value
                    {renderSortIcon("sleeperValue")}
                  </th>
                </>
              )}
              {visiblePlatforms.Yahoo && (
                <>
                  <th
                    className="cursor-pointer hover:bg-base-300 border-l-2 border-gray-700"
                    onClick={() => handleSort("yahoo_rank")}
                  >
                    Rank
                    {renderSortIcon("yahoo_rank")}
                  </th>
                  <th className="">Pos. Rank</th>
                  <th
                    className="p-2 cursor-pointer hover:bg-base-300"
                    onClick={() => handleSort("yahooValue")}
                  >
                    Value
                    {renderSortIcon("yahooValue")}
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((player, index) => {
              const consensusValue = player.nfc_playerrank
                ? (player.avg_playerrank - player.nfc_adp).toFixed(2)
                : "N/A";
              const espnValue = player.espn_playerrank
                ? (player.espn_playerrank - player.nfc_adp).toFixed(2)
                : "N/A";
              const sleeperValue = player.sleeper_playerrank
                ? (player.sleeper_playerrank - player.nfc_adp).toFixed(2)
                : "N/A";
              const yahooValue = player.yahoo_playerrank
                ? (player.yahoo_playerrank - player.nfc_adp).toFixed(2)
                : "N/A";
              const consensusPick = calculateConsensusPick(
                player.avg_playerrank,
                index
              );

              return (
                <tr
                  key={`${player.full_name}-${index}`}
                  className="text-center font-sans"
                >
                  <td className="">{player.consensus_pick}</td>
                  <td
                    colSpan="2"
                    className="sticky left-0 bg-gray-900 border-r-2 border-gray-700 z-10"
                    style={{ boxShadow: "2px 0 5px -2px rgba(0, 0, 0, 0.75)" }}
                  >
                    {player.full_name}
                  </td>
                  {visiblePlatforms.NFC && (
                    <>
                      <td>{player.nfc_positionrank}</td>
                      <td className="border-r-2 border-gray-700">
                        {player.nfc_adp}
                      </td>
                    </>
                  )}

                  <td className="">{player.avg_playerrank}</td>
                  <td
                    className={` p-2 font-bold border-r-2 border-gray-700 ${getValueClass(
                      consensusValue
                    )}`}
                  >
                    {consensusValue}
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
                        className={`p-2 font-bold border-r-2 border-gray-700 ${getValueClass(
                          sleeperValue
                        )}`}
                      >
                        {sleeperValue}
                      </td>
                    </>
                  )}
                  {visiblePlatforms.Yahoo && (
                    <>
                      <td className="">{player.yahoo_playerrank}</td>
                      <td className="">{player.yahoo_positionrank}</td>
                      <td
                        className={`p-2 font-bold ${getValueClass(yahooValue)}`}
                      >
                        {yahooValue}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end p-10">
        <p className="italic">
          *** PPR Scoring <span>***</span>
        </p>
      </div>
    </div>
  );
};

export default AdpTool;
