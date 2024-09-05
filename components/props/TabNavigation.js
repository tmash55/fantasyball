const TabNavigation = ({ selectedTab, onTabChange }) => {
  return (
    <div className="flex justify-start mb-4 space-x-4 ">
      <button
        onClick={() => onTabChange("Weekly")}
        className={`btn ${
          selectedTab === "Weekly"
            ? "bg-[#41ADBB] text-white font-bold shadow-lg"
            : "btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:text-white"
        } rounded-lg px-4 py-2 transition-colors duration-200`}
      >
        Weekly
      </button>
      <button
        onClick={() => onTabChange("Season Long")}
        className={`btn ${
          selectedTab === "Season Long"
            ? "bg-[#41ADBB] text-white font-bold shadow-lg"
            : "btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:text-white"
        } rounded-lg px-4 py-2 transition-colors duration-200`}
      >
        Season Long
      </button>
    </div>
  );
};

export default TabNavigation;
