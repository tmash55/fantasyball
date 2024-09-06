"use client";

import React, { useState, useEffect } from "react";
import ScoringSettings from "./ScoringSettings";
import PlayerTable from "./PlayerTable";
import Filters from "./playerProjectionsFilter";

const FantasyProjections = ({ weekOneData = [] }) => {
  const [players, setPlayers] = useState(weekOneData);
  const [activeTab, setActiveTab] = useState("PPR"); // Tabs for PPR, Standard, Custom
  const [scoringSettings, setScoringSettings] = useState({
    passingYardsPointsPerYard: 0.04, // Points per yard instead of per 25 yards
    passingTouchdownsPoints: 4,
    interceptionsPoints: -2,
    rushingYardsPointsPerYard: 0.1, // Assuming 1 point for every 10 rushing yards
    rushingTouchdownsPoints: 6,
    receivingYardsPointsPerYard: 0.1, // Assuming 1 point for every 10 receiving yards
    receptionsPoints: 1, // PPR
    receivingTouchdownsPoints: 6,
  });

  const [filters, setFilters] = useState({
    searchQuery: "",
    position: [],
  });

  const defaultScoringSettings = {
    passingYardsPointsPerYard: 0.04,
    passingTouchdownsPoints: 4,
    interceptionsPoints: -2,
    rushingYardsPointsPerYard: 0.1,
    rushingTouchdownsPoints: 6,
    receivingYardsPointsPerYard: 0.1,
    receptionsPoints: 1,
    receivingTouchdownsPoints: 6,
  };

  const calculateFantasyPoints = (player, scoring) => {
    const {
      passingYards = 0,
      passingTouchdowns = 0,
      interceptions = 0,
      rushingYards = 0,
      rushingTouchdowns = 0,
      receivingYards = 0,
      receptions = 0,
      receivingTouchdowns = 0,
    } = player;

    const {
      passingYardsPointsPerYard,
      passingTouchdownsPoints,
      interceptionsPoints,
      rushingYardsPointsPerYard,
      rushingTouchdownsPoints,
      receivingYardsPointsPerYard,
      receptionsPoints,
      receivingTouchdownsPoints,
    } = scoring;

    let points = 0;
    points += passingYards * passingYardsPointsPerYard;
    points += passingTouchdowns * passingTouchdownsPoints;
    points += interceptions * interceptionsPoints;
    points += rushingYards * rushingYardsPointsPerYard;
    points += rushingTouchdowns * rushingTouchdownsPoints;
    points += receivingYards * receivingYardsPointsPerYard;
    points += receptions * receptionsPoints;
    points += receivingTouchdowns * receivingTouchdownsPoints;

    return points;
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleScoringChange = (newSettings) => {
    setScoringSettings(newSettings);
  };

  const applyScoringSettings = () => {
    let scoring;
    if (activeTab === "PPR") {
      scoring = defaultScoringSettings;
    } else if (activeTab === "Standard") {
      scoring = {
        ...defaultScoringSettings,
        receptionsPoints: 0, // No points for receptions in Standard scoring
      };
    } else {
      scoring = scoringSettings;
    }

    const filteredPlayers = weekOneData
      .filter((player) =>
        player.name?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
      .filter(
        (player) =>
          filters.position.length === 0 ||
          filters.position.includes(player.position)
      )
      .map((player) => ({
        ...player,
        fantasyPoints: calculateFantasyPoints(player, scoring),
      }));

    setPlayers(filteredPlayers);
  };

  useEffect(() => {
    applyScoringSettings();
  }, [filters, scoringSettings, activeTab]);

  return (
    <div className="p-6">
      {/* Tabs for Switching Scoring Format */}
      <div className="flex justify-center mb-4">
        {["PPR", "Standard", "Custom"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg mx-2 ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex justify-between mb-4">
        <Filters filters={filters} onChange={handleFilterChange} />
        {activeTab === "Custom" && (
          <ScoringSettings
            settings={scoringSettings}
            onChange={handleScoringChange}
          />
        )}
      </div>
      <PlayerTable players={players} />
    </div>
  );
};

export default FantasyProjections;
