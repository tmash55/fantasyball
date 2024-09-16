import PropCard from "./PropCard";

const PropList = ({ data, selectedTab }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {data.map((player) => (
        <PropCard
          key={player.player_id}
          player={player}
          selectedTab={selectedTab}
        />
      ))}
    </div>
  );
};

export default PropList;
