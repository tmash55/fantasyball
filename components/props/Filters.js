import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const positions = ["QB", "RB", "WR", "TE"];

export default function EnhancedFilters({
  searchQuery,
  setSearchQuery,
  filterPositions,
  setFilterPositions,
  overFilters,
  setOverFilters,
  underFilters,
  setUnderFilters,
  activeWeeklyPropType,
  setActiveWeeklyPropType,
  selectedTab,
  setSelectedTab,
  selectedWeek,
  setSelectedWeek,
  handleReset,
}) {
  const getFilters = () => {
    switch (activeWeeklyPropType) {
      case "passing":
        return ["Passing Yards", "Passing Attempts", "Passing Completions"];
      case "rushing":
        return ["Rushing Yards", "Rushing Attempts"];
      case "receiving":
        return ["Receiving Yards", "Receptions"];
      default:
        return [];
    }
  };

  const handleOverUnderChange = (filter, type, value) => {
    if (type === "over") {
      setOverFilters((prev) => ({ ...prev, [filter]: value }));
    } else {
      setUnderFilters((prev) => ({ ...prev, [filter]: value }));
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-auto"
          >
            <TabsList className="bg-gray-800">
              <TabsTrigger
                value="Weekly"
                className="data-[state=active]:bg-teal-500"
              >
                Weekly
              </TabsTrigger>
              <TabsTrigger
                value="Season Long"
                className="data-[state=active]:bg-teal-500"
              >
                Season Long
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex space-x-2">
            {["passing", "rushing", "receiving"].map((type) => (
              <Button
                key={type}
                variant={
                  activeWeeklyPropType === type ? "secondary" : "outline"
                }
                onClick={() => setActiveWeeklyPropType(type)}
                className={`${
                  activeWeeklyPropType === type
                    ? "bg-teal-500 text-white"
                    : "bg-gray-800 text-gray-300"
                } hover:bg-teal-600`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Props
              </Button>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {Array.from({ length: 18 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Week {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-teal-400">
          {activeWeeklyPropType.charAt(0).toUpperCase() +
            activeWeeklyPropType.slice(1)}{" "}
          Over/Under Filters
        </h2>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <Select
            value={filterPositions.join(",")}
            onValueChange={(value) =>
              setFilterPositions(value.split(",").filter(Boolean))
            }
          >
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select Positions" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {positions.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilters().map((filter) => (
              <div key={filter} className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {filter}
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Over"
                    value={
                      overFilters[filter.toLowerCase().replace(/ /g, "")] || ""
                    }
                    onChange={(e) =>
                      handleOverUnderChange(
                        filter.toLowerCase().replace(/ /g, ""),
                        "over",
                        e.target.value
                      )
                    }
                    className="w-full bg-gray-800 border-gray-700 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Under"
                    value={
                      underFilters[filter.toLowerCase().replace(/ /g, "")] || ""
                    }
                    onChange={(e) =>
                      handleOverUnderChange(
                        filter.toLowerCase().replace(/ /g, ""),
                        "under",
                        e.target.value
                      )
                    }
                    className="w-full bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleReset}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
          >
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
