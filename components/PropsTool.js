"use client";
import { fetchPropData } from "@/app/api/props/route";
import { useEffect, useState } from "react";

const PropTools = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchPropData();
        // Sort by position, then by player name or stats
        result.sort(
          (a, b) =>
            a.position.localeCompare(b.position) ||
            a.player_name.localeCompare(b.player_name)
        );
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getProgressColor = (progress) => {
    if (progress >= 0.8) return "progress-success";
    if (progress >= 0.5) return "progress-warning";
    return "progress-error";
  };

  const calculatePerGame = (total) => (total / 17).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((player, index) => (
        <div
          key={index}
          className="card bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl p-6 rounded-lg text-white"
        >
          <div className="card-body">
            <h2 className="card-title text-xl font-extrabold mb-4 flex items-center justify-between">
              {player.player_name}
              <span className="text-sm text-gray-400">
                ({player.position} - {player.team})
              </span>
            </h2>

            {player.passing_yards_progress !== null && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                  <span className="mr-2">🏈</span> Passing Yards
                </h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Season: {player.passing_yards}
                  </span>
                  <span className="text-gray-400">
                    O/U: {player.passing_yards_over_under}
                  </span>
                </div>
                <progress
                  className={`progress ${getProgressColor(
                    player.passing_yards_progress
                  )} w-full h-2 rounded-full`}
                  value={player.passing_yards_progress * 100}
                  max="100"
                ></progress>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Avg: {calculatePerGame(player.passing_yards)}</span>
                  <span>
                    Avg: {calculatePerGame(player.passing_yards_over_under)}
                  </span>
                </div>
              </div>
            )}

            {player.passing_tds_progress !== null && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                  <span className="mr-2">🎯</span> Passing TDs
                </h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Season: {player.passing_tds}
                  </span>
                  <span className="text-gray-400">
                    O/U: {player.passing_tds_over_under}
                  </span>
                </div>
                <progress
                  className={`progress ${getProgressColor(
                    player.passing_tds_progress
                  )} w-full h-2 rounded-full`}
                  value={player.passing_tds_progress * 100}
                  max="100"
                ></progress>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Avg: {calculatePerGame(player.passing_tds)}</span>
                  <span>
                    Avg: {calculatePerGame(player.passing_tds_over_under)}
                  </span>
                </div>
              </div>
            )}

            {player.receiving_yards_progress !== null && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                  <span className="mr-2">🎽</span> Receiving Yards
                </h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Season: {player.receiving_yards}
                  </span>
                  <span className="text-gray-400">
                    O/U: {player.receiving_yards_over_under}
                  </span>
                </div>
                <progress
                  className={`progress ${getProgressColor(
                    player.receiving_yards_progress
                  )} w-full h-2 rounded-full`}
                  value={player.receiving_yards_progress * 100}
                  max="100"
                ></progress>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Avg: {calculatePerGame(player.receiving_yards)}</span>
                  <span>
                    Avg: {calculatePerGame(player.receiving_yards_over_under)}
                  </span>
                </div>
              </div>
            )}

            {player.receiving_tds_progress !== null && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                  <span className="mr-2">🎯</span> Receiving TDs
                </h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Season: {player.receiving_tds}
                  </span>
                  <span className="text-gray-400">
                    O/U: {player.receiving_tds_over_under}
                  </span>
                </div>
                <progress
                  className={`progress ${getProgressColor(
                    player.receiving_tds_progress
                  )} w-full h-2 rounded-full`}
                  value={player.receiving_tds_progress * 100}
                  max="100"
                ></progress>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Avg: {calculatePerGame(player.receiving_tds)}</span>
                  <span>
                    Avg: {calculatePerGame(player.receiving_tds_over_under)}
                  </span>
                </div>
              </div>
            )}

            {player.rushing_yards_progress !== null && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                  <span className="mr-2">🏃‍♂️</span> Rushing Yards
                </h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Season: {player.rushing_yards}
                  </span>
                  <span className="text-gray-400">
                    O/U: {player.rushing_yards_over_under}
                  </span>
                </div>
                <progress
                  className={`progress ${getProgressColor(
                    player.rushing_yards_progress
                  )} w-full h-2 rounded-full`}
                  value={player.rushing_yards_progress * 100}
                  max="100"
                ></progress>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Avg: {calculatePerGame(player.rushing_yards)}</span>
                  <span>
                    Avg: {calculatePerGame(player.rushing_yards_over_under)}
                  </span>
                </div>
              </div>
            )}

            {player.rushing_tds_progress !== null && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                  <span className="mr-2">🏈</span> Rushing TDs
                </h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Season: {player.rushing_tds}
                  </span>
                  <span className="text-gray-400">
                    O/U: {player.rushing_tds_over_under}
                  </span>
                </div>
                <progress
                  className={`progress ${getProgressColor(
                    player.rushing_tds_progress
                  )} w-full h-2 rounded-full`}
                  value={player.rushing_tds_progress * 100}
                  max="100"
                ></progress>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Avg: {calculatePerGame(player.rushing_tds)}</span>
                  <span>
                    Avg: {calculatePerGame(player.rushing_tds_over_under)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropTools;
