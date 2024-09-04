const SearchBar = ({ searchQuery, onSearch }) => {
  return (
    <input
      type="text"
      placeholder="Search by player or matchup..."
      className="input input-bordered w-full max-w-xs"
      value={searchQuery}
      onChange={(e) => onSearch(e.target.value)}
    />
  );
};

export default SearchBar;
