const WeekPropsTable = ({ weekData }) => {
  // Ensure data is defined before mapping over it
  const data = weekData || [];

  return (
    <div className="overflow-x-auto mt-4">
      <table className="table table-auto w-full text-left border-collapse bg-gray-800 text-white">
        <thead>
          <tr>
            <th className="border-b border-gray-700 p-2">Player</th>
            <th className="border-b border-gray-700 p-2">Team</th>
            <th className="border-b border-gray-700 p-2">Passing Yards O/U</th>
            <th className="border-b border-gray-700 p-2">Passing TDs</th>
            <th className="border-b border-gray-700 p-2">Pass Attempts</th>
            <th className="border-b border-gray-700 p-2">Pass Completions</th>
            <th className="border-b border-gray-700 p-2">Interceptions</th>
            <th className="border-b border-gray-700 p-2">
              Receiving Yards O/U
            </th>
            <th className="border-b border-gray-700 p-2">Receptions</th>
            <th className="border-b border-gray-700 p-2">Rushing Yards O/U</th>
            <th className="border-b border-gray-700 p-2">Rush Attempts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="p-2">{player.player}</td>
              <td className="p-2">{player.game}</td>
              <td className="p-2">{player.passyardsou || "-"}</td>
              <td className="p-2">{player.passtdsnumber || "-"}</td>
              <td className="p-2">{player.passattempts || "-"}</td>
              <td className="p-2">{player.passcompletions || "-"}</td>
              <td className="p-2">{player.interceptions || "-"}</td>
              <td className="p-2">{player.receivingyardsou || "-"}</td>
              <td className="p-2">{player.receptions || "-"}</td>
              <td className="p-2">{player.rushyardsou || "-"}</td>
              <td className="p-2">{player.rushattempts || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeekPropsTable;
