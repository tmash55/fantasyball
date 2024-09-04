"use client";
import React, { useState, useEffect } from "react";

import { fetchPropData } from "@/app/api/props/route";
import { fetchWeekPropData } from "@/app/api/props/weeklyprops";
import TabNavigation from "./TabNavigation";
import SearchBar from "./SearchBar";
import WeekSelector from "./WeekSelector";
import PropList from "./PropList";
import WeekPropsTable from "./WeekPropsTable";

const PropTools = () => {
  const [data, setData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Season Long");
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Safely handle undefined values for player_name and matchup
  const filteredData = data.filter((player) => {
    const playerName = player.player_name
      ? player.player_name.toLowerCase()
      : "";
    const matchup = player.matchup ? player.matchup.toLowerCase() : "";
    return (
      playerName.includes(searchQuery.toLowerCase()) ||
      matchup.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      <TabNavigation selectedTab={selectedTab} onTabChange={setSelectedTab} />
      {selectedTab === "Weekly" && (
        <div className="mt-4 flex items-center space-x-4">
          <WeekSelector
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
          />
          <SearchBar searchQuery={searchQuery} onSearch={setSearchQuery} />
        </div>
      )}
      {selectedTab === "Season Long" ? (
        <PropList data={filteredData} selectedTab={selectedTab} />
      ) : (
        <WeekPropsTable weekData={weekData} />
      )}
    </div>
  );
};

export default PropTools;
