import React from "react";

const PlayerPropCard = ({ player, propsData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {player.first_name} {player.last_name} - {player.position} -{" "}
        {player.team}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {propsData.passing_yards && (
          <div>
            <h3>Passing Yards: {propsData.passing_yards}</h3>
            <progress
              className="progress progress-primary"
              value={player.passing_yards_progress * 100}
              max="100"
            ></progress>
          </div>
        )}
        {propsData.passing_tds && (
          <div>
            <h3>Passing TDs: {propsData.passing_tds}</h3>
            <progress
              className="progress progress-primary"
              value={player.passing_tds_progress * 100}
              max="100"
            ></progress>
          </div>
        )}
        {propsData.receiving_yards && (
          <div>
            <h3>Receiving Yards: {propsData.receiving_yards}</h3>
            <progress
              className="progress progress-secondary"
              value={player.receiving_yards_progress * 100}
              max="100"
            ></progress>
          </div>
        )}
        {propsData.receiving_tds && (
          <div>
            <h3>Receiving TDs: {propsData.receiving_tds}</h3>
            <progress
              className="progress progress-secondary"
              value={player.receiving_tds_progress * 100}
              max="100"
            ></progress>
          </div>
        )}
        {propsData.rushing_yards && (
          <div>
            <h3>Rushing Yards: {propsData.rushing_yards}</h3>
            <progress
              className="progress progress-accent"
              value={player.rushing_yards_progress * 100}
              max="100"
            ></progress>
          </div>
        )}
        {propsData.rushing_tds && (
          <div>
            <h3>Rushing TDs: {propsData.rushing_tds}</h3>
            <progress
              className="progress progress-accent"
              value={player.rushing_tds_progress * 100}
              max="100"
            ></progress>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerPropCard;
