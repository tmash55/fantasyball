"use client";

import React, { useState, useEffect } from "react";
import { fetchWeekPropData } from "@/app/api/props/weeklyprops";

// Function to calculate fantasy points using PPR settings
const calculateFantasyPoints = (player) => {
  let {
    passyardsou = 0,
    passtdsnumber = 0,
    interceptions = 0,
    rushyardsou = 0,
    receivingyardsou = 0,
    receptions = 0,
    rushtds = 0,
    receivingtds = 0,
  } = player;

  // Define PPR scoring settings
  const scoring = {
    passingYardsPointsPerYard: 0.04, // 1 point per 25 passing yards
    passingTouchdownsPoints: 4,
    interceptionsPoints: -2,
    rushingYardsPointsPerYard: 0.1, // 1 point per 10 rushing yards
    rushingTouchdownsPoints: 6,
    receivingYardsPointsPerYard: 0.1, // 1 point per 10 receiving yards
    receptionsPoints: 1, // 1 point per reception
    receivingTouchdownsPoints: 6,
  };

  // Logic to set receptions to 1.5 if receiving yards > 0 and receptions is N/A or 0
  if (
    receivingyardsou > 0 &&
    (isNaN(Number(receptions)) || Number(receptions) === 0)
  ) {
    receptions = 1.5;
  }

  // Ensure all values are numbers before calculating fantasy points
  let points = 0;
  points += isNaN(Number(passyardsou))
    ? 0
    : Number(passyardsou) * scoring.passingYardsPointsPerYard;
  points += isNaN(Number(passtdsnumber))
    ? 0
    : Number(passtdsnumber) * scoring.passingTouchdownsPoints;
  points += isNaN(Number(interceptions))
    ? 0
    : Number(interceptions) * scoring.interceptionsPoints;
  points += isNaN(Number(rushyardsou))
    ? 0
    : Number(rushyardsou) * scoring.rushingYardsPointsPerYard;
  points += isNaN(Number(rushtds))
    ? 0
    : Number(rushtds) * scoring.rushingTouchdownsPoints;
  points += isNaN(Number(receivingyardsou))
    ? 0
    : Number(receivingyardsou) * scoring.receivingYardsPointsPerYard;
  points += isNaN(Number(receptions))
    ? 0
    : Number(receptions) * scoring.receptionsPoints;
  points += isNaN(Number(receivingtds))
    ? 0
    : Number(receivingtds) * scoring.receivingTouchdownsPoints;

  return points.toFixed(2); // Return points rounded to 2 decimal places
};

const FantasyProjectionsPPR = () => {
  const [weekData, setWeekData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchWeekPropData("1"); // Fetch data for week 1
        // Calculate fantasy points for each player
        const playersWithPoints = data.map((player) => ({
          ...player,
          fantasyPoints: calculateFantasyPoints(player),
        }));
        setWeekData(playersWithPoints);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Toggle the expansion of a row
  const handleRowClick = (index) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [index]: !prevState[index], // Toggle the current row's expanded state
    }));
  };

  return (
    <div className="p-6">
      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="text-[15px] bg-gray-800">
              <th>Player</th>
              <th>Team</th>
              <th>Position</th>
              <th>Game</th>
              <th>Date</th>
              <th>Fantasy Points</th>
            </tr>
          </thead>
          <tbody>
            {weekData.map((player, index) => (
              <React.Fragment key={index}>
                {/* Main Row */}
                <tr
                  onClick={() => handleRowClick(index)}
                  className="cursor-pointer hover:bg-gray-700"
                >
                  <td>{player.player}</td>
                  <td>{player.team}</td>
                  <td>{player.position}</td>
                  <td>{player.game}</td>
                  <td>
                    {player.new_datetime
                      ? new Date(player.new_datetime).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>{player.fantasyPoints}</td>
                </tr>

                {/* Expandable Row */}
                {/* Expandable Row */}
                {expandedRows[index] && (
                  <tr>
                    <td
                      colSpan="6"
                      className={`bg-gray-900 text-white p-4 overflow-hidden transition-max-height duration-500 ease-in-out ${
                        expandedRows[index] ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      {/* Additional Player Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        {player.passyardsou && (
                          <div>Passing Yards O/U: {player.passyardsou}</div>
                        )}
                        {player.passtdsnumber && (
                          <div>Passing TDs: {player.passtdsnumber}</div>
                        )}
                        {player.interceptions && (
                          <div>Interceptions: {player.interceptions}</div>
                        )}
                        {player.rushyardsou && (
                          <div>Rushing Yards O/U: {player.rushyardsou}</div>
                        )}
                        {player.receivingyardsou && (
                          <div>
                            Receiving Yards O/U: {player.receivingyardsou}
                          </div>
                        )}
                        {player.receptions && (
                          <div>Receptions: {player.receptions}</div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FantasyProjectionsPPR;
