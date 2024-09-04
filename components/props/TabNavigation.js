const TabNavigation = ({ selectedTab, onTabChange }) => {
  return (
    <div className="tabs">
      <button
        className={`tab tab-lifted ${
          selectedTab === "Season Long" ? "tab-active" : ""
        }`}
        onClick={() => onTabChange("Season Long")}
      >
        Season Long
      </button>
      <button
        className={`tab tab-lifted ${
          selectedTab === "Weekly" ? "tab-active" : ""
        }`}
        onClick={() => onTabChange("Weekly")}
      >
        Weekly
      </button>
    </div>
  );
};

export default TabNavigation;
