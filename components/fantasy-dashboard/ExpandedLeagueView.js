import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import LeagueSettings from "./LeagueSettings";
import LeagueRankings from "./LeagueRankings";
import UserRoster from "./UserRoster";
import WaiverWire from "./WaiverWire";
import ExpandedLeagueOverview from "./ExpandedLeagueOverview";
import WeeklyMatchups from "./WeeklyMatchups";
import { getCurrentNFLWeek } from "@/libs/sleeper";

const ExpandedLeagueView = ({ league, onBackClick, username }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const fetchCurrentWeek = async () => {
      try {
        const week = await getCurrentNFLWeek();
        console.log("Fetched current week:", week);
        setCurrentWeek(week);
      } catch (error) {
        console.error("Error in fetchCurrentWeek:", error);
        setCurrentWeek(1); // Default to week 1 if there's an error
      }
    };

    checkIsMobile();
    fetchCurrentWeek();

    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const tabVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 },
  };

  const contentVariants = {
    enter: { opacity: 0, y: 10, position: "absolute" },
    center: { opacity: 1, y: 0, position: "absolute" },
    exit: { opacity: 0, y: -10, position: "absolute" },
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
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      value: "matchups",
      label: "Matchups",
      icon: <Gamepad2 className="mr-2 h-4 w-4" />,
    },
    {
      value: "waiver",
      label: "Waiver Wire",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      value: "rankings",
      label: "Standings",
      icon: <TrendingUp className="mr-2 h-4 w-4" />,
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
          <SelectContent className="bg-base-100">
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
      <TabsList className="grid w-full grid-cols-6 mb-8">
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
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Button onClick={onBackClick} className="mb-4" variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Leagues
      </Button>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {league.name || "Unnamed League"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            {renderTabNavigation()}
            <div
              className="relative"
              style={{
                height: isMobile ? "auto" : "calc(100vh - 300px)",
                minHeight: isMobile ? "400px" : "600px",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="w-full h-full overflow-auto"
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
                  {activeTab === "waiver" && <WaiverWire league={league} />}
                  {activeTab === "rankings" && (
                    <LeagueRankings league={league} />
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
  );
};

export default ExpandedLeagueView;
