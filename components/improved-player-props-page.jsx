"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Search, XCircle } from "lucide-react"
import { fetchPropData } from "@/app/api/props/route"
import { fetchWeekData } from "@/app/api/props/weeklyprops2"

const propTypes = ["Passing", "Rushing", "Receiving"]
const positions = ["QB", "RB", "WR", "TE"]
const weeks = Array.from({ length: 18 }, (_, i) => `Week ${i + 1}`)

export function ImprovedPlayerPropsPageComponent() {
  const [selectedTab, setSelectedTab] = useState("Weekly")
  const [selectedPropType, setSelectedPropType] = useState("Passing")
  const [selectedWeek, setSelectedWeek] = useState("Week 2")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPositions, setSelectedPositions] = useState([])
  const [seasonData, setSeasonData] = useState([])
  const [weekData, setWeekData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (selectedTab === "Season Long") {
          const data = await fetchPropData()
          setSeasonData(data)
        } else {
          const weekNumber = selectedWeek.split(" ")[1]
          const data = await fetchWeekData(weekNumber)
          setWeekData(data)
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again.")
        console.error("Error fetching data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedTab, selectedWeek])

  const filteredData = useMemo(() => {
    const dataToFilter = selectedTab === "Season Long" ? seasonData : weekData
    return dataToFilter.filter((player) => {
      const matchesSearch = player.nfl_players?.player_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPosition = selectedPositions.length === 0 || selectedPositions.includes(player.nfl_players?.position)
      const matchesPropType = selectedTab === "Season Long" || (
        (selectedPropType === "Passing" && (player.passyardsou !== null || player.passtdsnumber !== null)) ||
        (selectedPropType === "Rushing" && (player.rushyardsou !== null || player.rushattempts !== null)) ||
        (selectedPropType === "Receiving" && (player.receivingyardsou !== null || player.receptionsou !== null))
      )
      return matchesSearch && matchesPosition && matchesPropType
    });
  }, [selectedTab, seasonData, weekData, searchQuery, selectedPositions, selectedPropType])

  const handleReset = () => {
    setSearchQuery("")
    setSelectedPositions([])
    // Reset other filters here
  }

  const renderTableContent = () => {
    if (isLoading) {
      return (
        (<TableRow>
          <TableCell colSpan={5} className="text-center">Loading...</TableCell>
        </TableRow>)
      );
    }

    if (error) {
      return (
        (<TableRow>
          <TableCell colSpan={5} className="text-center text-red-500">{error}</TableCell>
        </TableRow>)
      );
    }

    if (filteredData.length === 0) {
      return (
        (<TableRow>
          <TableCell colSpan={5} className="text-center">No data available</TableCell>
        </TableRow>)
      );
    }

    return filteredData.map((player) => (
      <TableRow key={player.playerID}>
        <TableCell className="font-medium">
          {player.nfl_players?.player_name}
          <div className="text-sm text-muted-foreground">{player.nfl_players?.position} - {player.nfl_players?.team}</div>
          <div className="text-xs text-muted-foreground">{player.game}</div>
        </TableCell>
        <TableCell>{player.passyardsou || player.rushyardsou || player.receivingyardsou || "N/A"}</TableCell>
        <TableCell>
          {player.passtdsnumber ? (
            <>
              O {player.passtdsnumber} {player.passtdsodds}
              <br />
              U {player.passtdsnumber} {player.passtdsodds}
            </>
          ) : "N/A"}
        </TableCell>
        <TableCell>{player.passattempts || player.rushattempts || "N/A"}</TableCell>
        <TableCell>{player.passcompletions || player.receptionsou || "N/A"}</TableCell>
      </TableRow>
    ));
  }

  return (
    (<div className="container mx-auto p-4 space-y-6">
      <h1 className="text-4xl font-bold text-center mb-8">Player Props</h1>
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Weekly">Weekly</TabsTrigger>
          <TabsTrigger value="Season Long">Season Long</TabsTrigger>
        </TabsList>

        <TabsContent value="Weekly" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((week) => (
                  <SelectItem key={week} value={week}>
                    {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {propTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedPropType === type ? "default" : "outline"}
                  onClick={() => setSelectedPropType(type)}>
                  {type} Props
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{selectedPropType} Over/Under Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8" />
                </div>
                <Select
                  value={selectedPositions.join(",")}
                  onValueChange={(value) => setSelectedPositions(value.split(",").filter(Boolean))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select positions" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Passing Yards", "Passing Attempts", "Passing Completions"].map((filter) => (
                  <div key={filter} className="space-y-2">
                    <label className="text-sm font-medium">{filter}</label>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Over" />
                      <Input type="number" placeholder="Under" />
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleReset} variant="outline" className="w-full">
                <XCircle className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Player</TableHead>
                    <TableHead>
                      {selectedPropType} Yards O/U
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </TableHead>
                    <TableHead>
                      TDs
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </TableHead>
                    <TableHead>
                      {selectedPropType === "Receiving" ? "Receptions" : "Attempts"}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </TableHead>
                    <TableHead>
                      {selectedPropType === "Passing" ? "Completions" : ""}
                      {selectedPropType === "Passing" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Season Long">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Player</TableHead>
                    <TableHead>Stat</TableHead>
                    <TableHead>Over/Under</TableHead>
                    <TableHead>Current</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>)
  );
}