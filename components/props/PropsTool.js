"use client";

import React, { useState, useEffect, useCallback } from "react";
import { fetchPropData } from "@/app/api/props/route";
import { fetchWeekData } from "@/app/api/props/weeklyprops2";
import TabNavigation from "./TabNavigation";
import WeekSelector from "./WeekSelector";
import PropList from "./PropList";
import WeekPropsTable from "./WeekPropsTable";
import Filters from "./Filters";

const PropsTool = () => {
  const [data, setData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Weekly");
  const [selectedWeek, setSelectedWeek] = useState("2");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWeeklyPropType, setActiveWeeklyPropType] = useState("passing");
  const [filterPositions, setFilterPositions] = useState([]);
  const [overFilters, setOverFilters] = useState({});
  const [underFilters, setUnderFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const filterWeekDataByPropType = useCallback((data, propType) => {
    return data.filter((player) => {
      switch (propType) {
        case "passing":
          return (
            player.passyardsou !== null ||
            player.passtdsnumber !== null ||
            player.passattempts !== null ||
            player.passcompletions !== null
          );
        case "rushing":
          return player.rushyardsou !== null || player.rushattempts !== null;
        case "receiving":
          return (
            player.receivingyardsou !== null || player.receptionsou !== null
          );
        default:
          return false;
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (selectedTab === "Season Long") {
        const result = await fetchPropData();
        result.sort(
          (a, b) =>
            a.position.localeCompare(b.position) ||
            a.player_name.localeCompare(b.player_name)
        );
        setData(result);
      } else if (selectedTab === "Weekly") {
        const weekProps = await fetchWeekData(selectedWeek);
        const filteredData = filterWeekDataByPropType(
          weekProps,
          activeWeeklyPropType
        );
        setWeekData(filteredData);
      }
    } catch (error) {
      console.error(`Error fetching ${selectedTab} data:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedTab,
    selectedWeek,
    activeWeeklyPropType,
    filterWeekDataByPropType,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleWeeklyPropTypeChange = (type) => {
    setActiveWeeklyPropType(type);
    const filteredData = filterWeekDataByPropType(weekData, type);
    setWeekData(filteredData);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilterPositions([]);
    setOverFilters({});
    setUnderFilters({});
  };

  const filterData = useCallback(
    (dataToFilter, isWeekly = false) => {
      return dataToFilter.filter((player) => {
        const playerName =
          (isWeekly
            ? player.nfl_players?.player_name
            : player.player_name
          )?.toLowerCase() || "";
        const game = isWeekly ? player.game?.toLowerCase() || "" : "";
        const matchesPosition =
          filterPositions.length === 0 ||
          filterPositions.includes(player.position);
        const matchesSearch =
          playerName.includes(searchQuery.toLowerCase()) ||
          (isWeekly && game.includes(searchQuery.toLowerCase()));

        if (!matchesSearch || !matchesPosition) return false;

        if (isWeekly) {
          const propTypeCheck = {
            passing: () =>
              player.passyardsou !== null ||
              player.passtdsnumber !== null ||
              player.passattempts !== null ||
              player.passcompletions !== null,
            rushing: () =>
              player.rushyardsou !== null || player.rushattempts !== null,
            receiving: () =>
              player.receivingyardsou !== null || player.receptionsou !== null,
          };

          if (!propTypeCheck[activeWeeklyPropType]()) return false;

          const filterCheck = {
            passing: () =>
              (!overFilters.passingyards ||
                (player.passyardsou &&
                  parseFloat(player.passyardsou) >=
                    parseFloat(overFilters.passingyards))) &&
              (!underFilters.passingyards ||
                (player.passyardsou &&
                  parseFloat(player.passyardsou) <=
                    parseFloat(underFilters.passingyards))) &&
              (!overFilters.passingattempts ||
                (player.passattempts &&
                  parseFloat(player.passattempts) >=
                    parseFloat(overFilters.passingattempts))) &&
              (!underFilters.passingattempts ||
                (player.passattempts &&
                  parseFloat(player.passattempts) <=
                    parseFloat(underFilters.passingattempts))) &&
              (!overFilters.passingcompletions ||
                (player.passcompletions &&
                  parseFloat(player.passcompletions) >=
                    parseFloat(overFilters.passingcompletions))) &&
              (!underFilters.passingcompletions ||
                (player.passcompletions &&
                  parseFloat(player.passcompletions) <=
                    parseFloat(underFilters.passingcompletions))),
            rushing: () =>
              (!overFilters.rushingyards ||
                (player.rushyardsou &&
                  parseFloat(player.rushyardsou) >=
                    parseFloat(overFilters.rushingyards))) &&
              (!underFilters.rushingyards ||
                (player.rushyardsou &&
                  parseFloat(player.rushyardsou) <=
                    parseFloat(underFilters.rushingyards))) &&
              (!overFilters.rushingattempts ||
                (player.rushattempts &&
                  parseFloat(player.rushattempts) >=
                    parseFloat(overFilters.rushingattempts))) &&
              (!underFilters.rushingattempts ||
                (player.rushattempts &&
                  parseFloat(player.rushattempts) <=
                    parseFloat(underFilters.rushingattempts))),
            receiving: () =>
              (!overFilters.receivingyards ||
                (player.receivingyardsou &&
                  parseFloat(player.receivingyardsou) >=
                    parseFloat(overFilters.receivingyards))) &&
              (!underFilters.receivingyards ||
                (player.receivingyardsou &&
                  parseFloat(player.receivingyardsou) <=
                    parseFloat(underFilters.receivingyards))) &&
              (!overFilters.receptions ||
                (player.receptions &&
                  parseFloat(player.receptions) >=
                    parseFloat(overFilters.receptions))) &&
              (!underFilters.receptions ||
                (player.receptions &&
                  parseFloat(player.receptions) <=
                    parseFloat(underFilters.receptions))),
          };

          return filterCheck[activeWeeklyPropType]();
        }

        return true;
      });
    },
    [
      searchQuery,
      filterPositions,
      overFilters,
      underFilters,
      activeWeeklyPropType,
    ]
  );

  const filteredSeasonLongData = filterData(data);
  const filteredWeeklyData = filterData(weekData, true);

  const handleWeekChange = (selectedWeek) => {
    setSelectedWeek(selectedWeek);
  };

  const weekOptions = Array.from({ length: 18 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`,
  }));

  return (
    <div className="p-6">
      <div className="pt-20">
        <h1 className="text-5xl font-bold mb-8 text-center">
          <span className="text-orange-400 font-extrabold">Player Props!</span>
        </h1>
      </div>

      {selectedTab === "Weekly" && (
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 p-4">
          <div className="w-full md:w-auto mb-4 md:mb-0 flex justify-center md:justify-start">
            <TabNavigation
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
            />
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4">
            {["passing", "rushing", "receiving"].map((type) => (
              <button
                key={type}
                className={`btn btn-outline rounded-lg ${
                  activeWeeklyPropType === type ? "btn-active" : ""
                }`}
                onClick={() => handleWeeklyPropTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Props
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "Weekly" && (
        <>
          <div className="mt-4 flex justify-center md:justify-start">
            <WeekSelector
              selectedWeek={selectedWeek}
              onWeekChange={handleWeekChange}
              weekOptions={weekOptions}
            />
          </div>
          <div className="mt-4">
            <Filters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterPositions={filterPositions}
              setFilterPositions={setFilterPositions}
              overFilters={overFilters}
              setOverFilters={setOverFilters}
              underFilters={underFilters}
              setUnderFilters={setUnderFilters}
              activeWeeklyPropType={activeWeeklyPropType}
              handleReset={handleReset}
            />
          </div>
        </>
      )}

      {isLoading ? (
        <div className="text-center mt-8">Loading...</div>
      ) : (
        <div className="mt-6">
          {selectedTab === "Season Long" ? (
            <>
              <TabNavigation
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
              />
              <p className="mt-4 text-center md:text-left">
                This season-long props will update each week to keep track of
                the players progress!
              </p>
              <PropList
                data={filteredSeasonLongData}
                selectedTab={selectedTab}
              />
            </>
          ) : (
            <WeekPropsTable
              weekData={filteredWeeklyData}
              activePropType={activeWeeklyPropType}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PropsTool;
