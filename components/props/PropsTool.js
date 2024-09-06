"use client";
import React, { useState, useEffect } from "react";

import { fetchPropData } from "@/app/api/props/route";
import { fetchWeekPropData } from "@/app/api/props/weeklyprops";
import TabNavigation from "./TabNavigation";
import WeekSelector from "./WeekSelector";
import PropList from "./PropList";
import WeekPropsTable from "./WeekPropsTable";
import Filters from "./Filters";
import SearchBar from "./SearchBar";

const PropsTool = () => {
  const [data, setData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Weekly");
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWeeklyPropType, setActiveWeeklyPropType] = useState("passing");
  const [filterPositions, setFilterPositions] = useState([]);
  const [overFilters, setOverFilters] = useState({});
  const [underFilters, setUnderFilters] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (selectedTab === "Season Long") {
        try {
          const result = await fetchPropData();
          result.sort(
            (a, b) =>
              a.position.localeCompare(b.position) ||
              a.player_name.localeCompare(b.player_name)
          );
          setData(result);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else if (selectedTab === "Weekly") {
        try {
          const weekProps = await fetchWeekPropData(selectedWeek);
          setWeekData(weekProps);
        } catch (error) {
          console.error("Error fetching weekly data:", error);
        }
      }
    };

    fetchData();
  }, [selectedTab, selectedWeek]);

  const handleWeeklyPropTypeChange = (type) => {
    setActiveWeeklyPropType(type);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilterPositions([]);
    setOverFilters({
      passingyards: "",
      passingattempts: "",
      passingcompletions: "",
      rushingyards: "",
      rushingattempts: "",
      receivingyards: "",
      receptions: "",
    });
    setUnderFilters({
      passingyards: "",
      passingattempts: "",
      passingcompletions: "",
      rushingyards: "",
      rushingattempts: "",
      receivingyards: "",
      receptions: "",
    });
  };

  const filteredSeasonLongData = data.filter((player) => {
    const playerName = player.player_name
      ? player.player_name.toLowerCase()
      : "";
    const matchup = player.matchup ? player.matchup.toLowerCase() : "";
    const matchesPosition =
      filterPositions.length === 0 || filterPositions.includes(player.position);
    return (
      (playerName.includes(searchQuery.toLowerCase()) ||
        matchup.includes(searchQuery.toLowerCase())) &&
      matchesPosition
    );
  });

  const filteredWeeklyData = weekData
    .filter((player) => {
      const playerName = player.player ? player.player.toLowerCase() : "";
      const game = player.game ? player.game.toLowerCase() : "";
      const matchesPosition =
        filterPositions.length === 0 ||
        filterPositions.includes(player.position);
      return (
        (playerName.includes(searchQuery.toLowerCase()) ||
          game.includes(searchQuery.toLowerCase())) &&
        matchesPosition
      );
    })
    .filter((player) => {
      switch (activeWeeklyPropType) {
        case "passing":
          // Ensure that only players with valid passing props are included
          return (
            (player.passyardsou !== null && player.passyardsou !== "") ||
            (player.passtdsnumber !== null && player.passtdsnumber !== "") ||
            (player.passattempts !== null && player.passattempts !== "") ||
            (player.passcompletions !== null && player.passcompletions !== "")
          );
        case "rushing":
          return (
            (player.rushyardsou !== null && player.rushyardsou !== "") ||
            (player.rushattempts !== null && player.rushattempts !== "")
          );
        case "receiving":
          return (
            (player.receivingyardsou !== null &&
              player.receivingyardsou !== "") ||
            (player.receptions !== null && player.receptions !== "")
          );
        default:
          return false;
      }
    })
    .filter((player) => {
      // Apply the over/under filters
      switch (activeWeeklyPropType) {
        case "passing":
          return (
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
                  parseFloat(underFilters.passingcompletions)))
          );
        case "rushing":
          return (
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
                  parseFloat(underFilters.rushingattempts)))
          );
        case "receiving":
          return (
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
                  parseFloat(underFilters.receptions)))
          );
        default:
          return false;
      }
    });

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const weekOptions = Array.from({ length: 18 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`,
    disabled: i > 0, // Disable all weeks except week 1 for now
  }));

  return (
    <div className="p-6">
      {selectedTab === "Weekly" && (
        <div className="flex justify-between">
          <div className="">
            {" "}
            <TabNavigation
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
            />
          </div>

          <div className=" mb-4 space-x-4">
            <button
              className={`btn btn-outline ${
                activeWeeklyPropType === "passing" ? "btn-active" : ""
              }`}
              onClick={() => handleWeeklyPropTypeChange("passing")}
            >
              Passing Props
            </button>
            <button
              className={`btn btn-outline ${
                activeWeeklyPropType === "rushing" ? "btn-active" : ""
              }`}
              onClick={() => handleWeeklyPropTypeChange("rushing")}
            >
              Rushing Props
            </button>
            <button
              className={`btn btn-outline ${
                activeWeeklyPropType === "receiving" ? "btn-active" : ""
              }`}
              onClick={() => handleWeeklyPropTypeChange("receiving")}
            >
              Receiving Props
            </button>
          </div>
        </div>
      )}

      {selectedTab === "Weekly" && (
        <WeekSelector
          selectedWeek={selectedWeek}
          onWeekChange={handleWeekChange}
          weekOptions={weekOptions}
        />
      )}

      {selectedTab === "Weekly" && (
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
      )}

      {/* Display Data */}
      {selectedTab === "Season Long" ? (
        <div>
          <TabNavigation
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
          />
          <p>
            This season long props will update each week to keep track of the
            players progress!
          </p>
          <PropList data={filteredSeasonLongData} selectedTab={selectedTab} />
        </div>
      ) : (
        <>
          {/*Add new filter here from word doc */}
          <WeekPropsTable
            weekData={filteredWeeklyData}
            activePropType={activeWeeklyPropType}
          />
        </>
      )}
    </div>
  );
};

export default PropsTool;
