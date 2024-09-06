import React from "react";

const Filters = ({
  searchQuery,
  setSearchQuery,
  filterPositions,
  setFilterPositions,
  overFilters,
  setOverFilters,
  underFilters,
  setUnderFilters,
  activeWeeklyPropType,
  handleReset,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between mb-4 space-y-4 md:space-y-0 bg-gray-800 p-4 rounded-lg shadow-lg">
      {/* Search Bar */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <label className="input input-bordered flex items-center gap-2 w-full md:w-60 bg-gray-700 text-white rounded-md">
          <input
            type="text"
            className="grow bg-transparent focus:outline-none"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 text-gray-300"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>
      </div>

      {/* Position Filters */}
      <div className="dropdown w-full md:w-auto">
        <label
          tabIndex={0}
          className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB] hover:text-white"
        >
          Position Filters
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-md w-full md:w-52 z-50"
        >
          {["QB", "RB", "WR", "TE"].map((position) => (
            <li key={position}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={position}
                  checked={filterPositions.includes(position)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilterPositions([...filterPositions, position]);
                    } else {
                      setFilterPositions(
                        filterPositions.filter((pos) => pos !== position)
                      );
                    }
                  }}
                  className="form-checkbox h-5 w-5 text-orange-400 rounded-full focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-white">{position}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Over/Under Filters Based on Active Prop Type */}
      {activeWeeklyPropType && (
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Over/Under Filters */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-[#41ADBB] mb-2 text-center">
              {activeWeeklyPropType.charAt(0).toUpperCase() +
                activeWeeklyPropType.slice(1)}{" "}
              Over/Under Filters
            </span>
            {activeWeeklyPropType === "passing" && (
              <>
                {[
                  "Passing Yards",
                  "Passing Attempts",
                  "Passing Completions",
                ].map((filter, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    {/* Over Input */}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={filter}
                        value={
                          overFilters[filter.toLowerCase().replace(/ /g, "")]
                        }
                        onChange={(e) =>
                          setOverFilters({
                            ...overFilters,
                            [filter.toLowerCase().replace(/ /g, "")]:
                              e.target.value,
                          })
                        }
                        className="input input-bordered bg-gray-700 text-white w-full md:w-auto pr-8"
                      />
                      {/* Up Arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M18 11l-6 -6" />
                        <path d="M6 11l6 -6" />
                      </svg>
                    </div>
                    {/* Under Input */}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={filter}
                        value={
                          underFilters[filter.toLowerCase().replace(/ /g, "")]
                        }
                        onChange={(e) =>
                          setUnderFilters({
                            ...underFilters,
                            [filter.toLowerCase().replace(/ /g, "")]:
                              e.target.value,
                          })
                        }
                        className="input input-bordered bg-gray-700 text-white w-full md:w-auto pr-8"
                      />
                      {/* Down Arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M18 13l-6 6" />
                        <path d="M6 13l6 6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </>
            )}
            {activeWeeklyPropType === "rushing" && (
              <>
                {["Rushing Yards", "Rushing Attempts"].map((filter, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    {/* Over Input */}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={filter}
                        value={
                          overFilters[filter.toLowerCase().replace(/ /g, "")]
                        }
                        onChange={(e) =>
                          setOverFilters({
                            ...overFilters,
                            [filter.toLowerCase().replace(/ /g, "")]:
                              e.target.value,
                          })
                        }
                        className="input input-bordered bg-gray-700 text-white w-full md:w-auto pr-8"
                      />
                      {/* Up Arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M18 11l-6 -6" />
                        <path d="M6 11l6 -6" />
                      </svg>
                    </div>
                    {/* Under Input */}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={filter}
                        value={
                          underFilters[filter.toLowerCase().replace(/ /g, "")]
                        }
                        onChange={(e) =>
                          setUnderFilters({
                            ...underFilters,
                            [filter.toLowerCase().replace(/ /g, "")]:
                              e.target.value,
                          })
                        }
                        className="input input-bordered bg-gray-700 text-white w-full md:w-auto pr-8"
                      />
                      {/* Down Arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M18 13l-6 6" />
                        <path d="M6 13l6 6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </>
            )}
            {activeWeeklyPropType === "receiving" && (
              <>
                {["Receiving Yards", "Receptions"].map((filter, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    {/* Over Input */}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={filter}
                        value={
                          overFilters[filter.toLowerCase().replace(/ /g, "")]
                        }
                        onChange={(e) =>
                          setOverFilters({
                            ...overFilters,
                            [filter.toLowerCase().replace(/ /g, "")]:
                              e.target.value,
                          })
                        }
                        className="input input-bordered bg-gray-700 text-white w-full md:w-auto pr-8"
                      />
                      {/* Up Arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M18 11l-6 -6" />
                        <path d="M6 11l6 -6" />
                      </svg>
                    </div>
                    {/* Under Input */}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={filter}
                        value={
                          underFilters[filter.toLowerCase().replace(/ /g, "")]
                        }
                        onChange={(e) =>
                          setUnderFilters({
                            ...underFilters,
                            [filter.toLowerCase().replace(/ /g, "")]:
                              e.target.value,
                          })
                        }
                        className="input input-bordered bg-gray-700 text-white w-full md:w-auto pr-8"
                      />
                      {/* Down Arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M18 13l-6 6" />
                        <path d="M6 13l6 6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="w-full md:w-auto">
        <button
          onClick={handleReset}
          className="btn m-1 w-full md:w-auto btn-outline border-[#41ADBB] text-[#41ADBB] hover:bg-[#41ADBB] hover:border-[#41ADBB] hover:text-white"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;
