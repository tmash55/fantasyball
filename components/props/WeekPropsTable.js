import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, ArrowUpDown, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WeekPropsTable = ({
  weekData,
  activePropType,
  selectedWeek,
  onActivePropTypeChange,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");

  useEffect(() => {
    setSortConfig({ key: null, direction: "ascending" });
  }, [weekData, activePropType]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let filteredData = weekData.filter(
      (player) =>
        (player.nfl_players?.player_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          player.nfl_players?.team
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
        (selectedPosition === "All" ||
          player.nfl_players?.position === selectedPosition)
    );

    return filteredData.sort((a, b) => {
      if (sortConfig.key) {
        const aValue = parseFloat(a[sortConfig.key]) || 0;
        const bValue = parseFloat(b[sortConfig.key]) || 0;

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
      }
      return 0;
    });
  }, [weekData, sortConfig, searchQuery, selectedPosition]);

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? (
        <ChevronUp className="w-4 h-4 inline-block ml-1" />
      ) : (
        <ChevronDown className="w-4 h-4 inline-block ml-1" />
      );
    }
    return <ArrowUpDown className="w-4 h-4 inline-block ml-1" />;
  };

  const getColumns = () => {
    switch (activePropType) {
      case "passing":
        return [
          { key: "cmp", label: "Cmp" },
          { key: "att", label: "Att" },
          { key: "passyardsou", label: "Yds" },
          { key: "passtdsnumber", label: "TD" },
          { key: "int", label: "INT" },
          { key: "airyards", label: "AirY" },
          { key: "yac", label: "YAC" },
          { key: "firstdowns", label: "1D" },
          { key: "epa", label: "EPA" },
        ];
      case "rushing":
        return [
          { key: "rushattempts", label: "Att" },
          { key: "rushyardsou", label: "Yds" },
          { key: "rushtdsnumber", label: "TD" },
          { key: "firstdowns", label: "1D" },
          { key: "epa", label: "EPA" },
        ];
      case "receiving":
        return [
          { key: "receptionsou", label: "Rec" },
          { key: "targets", label: "Tgt" },
          { key: "receivingyardsou", label: "Yds" },
          { key: "receivingtdsnumber", label: "TD" },
          { key: "airyards", label: "AirY" },
          { key: "yac", label: "YAC" },
          { key: "firstdowns", label: "1D" },
          { key: "epa", label: "EPA" },
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-between">
          <span>Weekly Stats</span>
          <div className="flex items-center space-x-4">
            <Select
              value={activePropType}
              onValueChange={onActivePropTypeChange}
            >
              <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Stat Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="passing">Passing</SelectItem>
                <SelectItem value="rushing">Rushing</SelectItem>
                <SelectItem value="receiving">Receiving</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
            <Select
              value={selectedPosition}
              onValueChange={setSelectedPosition}
            >
              <SelectTrigger className="w-[100px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="QB">QB</SelectItem>
                <SelectItem value="RB">RB</SelectItem>
                <SelectItem value="WR">WR</SelectItem>
                <SelectItem value="TE">TE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
        <p className="text-gray-400 mt-2">
          Dive into comprehensive NFL player statistics. Use the filters and
          sorting options to customize your view and gain valuable insights for
          your fantasy team or analysis.
        </p>
        <div className="flex items-center text-sm text-gray-400 mt-2">
          <Info className="w-4 h-4 mr-2" />
          <span>Pro Tip: Click on column headers to sort the data.</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800 text-gray-300">
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Pos</TableHead>
                {getColumns().map((column) => (
                  <TableHead
                    key={column.key}
                    className="cursor-pointer"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label} {renderSortIcon(column.key)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((player, index) => (
                <TableRow
                  key={player.playerID}
                  className="border-b border-gray-800"
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            player.nfl_players?.headshot_url ||
                            "/placeholder.svg"
                          }
                          alt={player.nfl_players?.player_name}
                        />
                        <AvatarFallback>
                          {player.nfl_players?.player_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold">
                          {player.nfl_players?.player_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {player.nfl_players?.team}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-gray-800 text-gray-300"
                    >
                      {player.nfl_players?.position}
                    </Badge>
                  </TableCell>
                  {getColumns().map((column) => (
                    <TableCell key={column.key}>
                      {player[column.key] !== undefined
                        ? player[column.key]
                        : "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekPropsTable;
