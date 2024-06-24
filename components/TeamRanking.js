import React, { useEffect, useState } from "react";

const TeamRanking = ({ teams }) => {
  const [sortedTeams, setSortedTeams] = useState([]);

  useEffect(() => {
    // Sort teams based on total ADP in ascending order
    const sorted = [...teams].sort((a, b) => a.totalADP - b.totalADP);
    setSortedTeams(sorted);
  }, [teams]);

  return (
    <div>
      <h2>Teams Ranked by ADP</h2>
      <ul>
        {sortedTeams.map((team, index) => (
          <li key={index}>
            <h3>{team.owner}</h3>
            <p>Total ADP: {team.totalADP}</p>
            {/* Add additional team details here if needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamRanking;
