const PropCard = ({ player, selectedTab }) => {
  const getProgressColor = (progress) => {
    if (progress >= 0.8) return "progress-success";
    if (progress >= 0.5) return "progress-warning";
    return "progress-error";
  };

  const calculatePerGame = (total) => (total / 17).toFixed(1);

  return (
    <div className="card bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl p-6 rounded-lg text-white">
      <div className="card-body">
        <h2 className="card-title text-xl font-extrabold mb-4 flex items-center justify-between">
          {player.player_name}
          <span className="text-sm text-gray-400">
            ({player.position} - {player.team})
          </span>
        </h2>

        {/* Display Props dynamically for the selected tab */}
        {selectedTab === "Season Long" ? (
          <>
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
                  <span>Avg: {player.passing_yards}</span>
                  <span>
                    Req Avg: {calculatePerGame(player.passing_yards_over_under)}
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
                  <span>Avg: {player.passing_tds}</span>
                  <span>
                    Req Avg: {calculatePerGame(player.passing_tds_over_under)}
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
                  <span>Avg: {player.receiving_yards}</span>
                  <span>
                    Req Avg:{" "}
                    {calculatePerGame(player.receiving_yards_over_under)}
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
                  <span>Avg: {player.receiving_tds}</span>
                  <span>
                    Req Avg: {calculatePerGame(player.receiving_tds_over_under)}
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
                  <span>Avg: {player.rushing_yards}</span>
                  <span>
                    Req Avg: {calculatePerGame(player.rushing_yards_over_under)}
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
                  <span> Avg: {player.rushing_tds}</span>
                  <span>
                    Req Avg: {calculatePerGame(player.rushing_tds_over_under)}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Render weekly props by category */}
            {player.weekly_passing_props && (
              <div className="mb-4">
                {/* Display weekly passing data */}
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Passing Props
                </h3>
                {/* Render passing props here */}
              </div>
            )}
            {player.weekly_receiving_props && (
              <div className="mb-4">
                {/* Display weekly receiving data */}
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Receiving Props
                </h3>
                {/* Render receiving props here */}
              </div>
            )}
            {player.weekly_rushing_props && (
              <div className="mb-4">
                {/* Display weekly rushing data */}
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Rushing Props
                </h3>
                {/* Render rushing props here */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropCard;
