"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  Search,
  TrendingUp,
  Settings,
  Home,
  Gamepad2,
  Crown,
  List,
} from "lucide-react";
import LeagueSettings from "./LeagueSettings";
import LeagueRankings from "./LeagueRankings";
import UserRoster from "./UserRoster";
import WaiverWire from "./WaiverWire";
import ExpandedLeagueOverview from "./ExpandedLeagueOverview";
import WeeklyMatchups from "./WeeklyMatchups";

import { getCurrentNFLWeek } from "@/libs/sleeper";
import RosterRank from "./RosterRank";

export default function ExpandedLeagueView({ league, onBackClick, username }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const componentRef = useRef(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const fetchCurrentWeek = async () => {
      try {
        const week = await getCurrentNFLWeek();
        setCurrentWeek(week);
      } catch (error) {
        console.error("Error in fetchCurrentWeek:", error);
        setCurrentWeek(1); // Default to week 1 if there's an error
      }
    };

    checkIsMobile();
    fetchCurrentWeek();

    window.addEventListener("resize", checkIsMobile);

    if (componentRef.current) {
      componentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const tabVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 },
  };

  const contentVariants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const tabOptions = [
    {
      value: "overview",
      label: "Overview",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      value: "lineup",
      label: "Your Lineup",
      icon: <List className="mr-2 h-4 w-4" />,
    },
    {
      value: "matchups",
      label: "Matchups",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      value: "waiver",
      label: "Waiver Wire",
      icon: <Crown className="mr-2 h-4 w-4" />,
    },
    {
      value: "rankings",
      label: "Standings",
      icon: <TrendingUp className="mr-2 h-4 w-4" />,
    },
    {
      value: "rosterRank",
      label: "Roster Rank",
      icon: <Gamepad2 className="mr-2 h-4 w-4" />,
    },
    {
      value: "settings",
      label: "League Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ];

  const renderTabNavigation = () => {
    if (isMobile) {
      return (
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            {tabOptions.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                <div className="flex items-center">
                  {tab.icon}
                  {tab.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <TabsList className="grid w-full grid-cols-7 bg-gray-800">
        {tabOptions.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center justify-center transition-all duration-200 ease-in-out"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === tab.value ? "active" : "inactive"}
              whileHover="active"
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              {tab.icon}
              {tab.label}
            </motion.div>
          </TabsTrigger>
        ))}
      </TabsList>
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-900 text-gray-100 p-6"
      ref={componentRef}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={onBackClick}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Leagues
            </Button>
            <h1 className="text-3xl font-bold">
              {league.name || "Unnamed League"}
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              {renderTabNavigation()}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === "overview" && (
                      <ExpandedLeagueOverview league={league} />
                    )}
                    {activeTab === "lineup" && <UserRoster league={league} />}
                    {activeTab === "matchups" && (
                      <WeeklyMatchups
                        leagueId={league.league_id}
                        currentWeek={currentWeek}
                        totalWeeks={league.settings.playoff_week_start - 1}
                        currentUsername={username}
                      />
                    )}
                    {activeTab === "waiver" && (
                      <WaiverWire leagueId={league.league_id} />
                    )}
                    {activeTab === "rankings" && (
                      <LeagueRankings league={league} />
                    )}
                    {activeTab === "rosterRank" && (
                      <RosterRank
                        leagueId={league.league_id}
                        userId={league.userRoster?.owner_id}
                      />
                    )}
                    {activeTab === "settings" && (
                      <LeagueSettings league={league} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
