const WeekSelector = ({ selectedWeek, onWeekChange }) => {
  return (
    <select
      className="select select-bordered w-full max-w-xs"
      value={selectedWeek}
      onChange={(e) => onWeekChange(e.target.value)}
    >
      {[...Array(17).keys()].map((week) => (
        <option key={week} value={week + 1}>
          Week {week + 1}
        </option>
      ))}
    </select>
  );
};

export default WeekSelector;
