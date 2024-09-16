import React, { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";
import supabase from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stripSuffix = (name) => {
  return name.replace(/( Jr\.| Sr\.)$/, "");
};

const PlayerCard = ({ player }) => {
  const [playerData, setPlayerData] = useState([]);
  const [additionalData, setAdditionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(null);
  const [maxValueDate, setMaxValueDate] = useState(null);

  const fetchPlayerData = async (
    offset = 0,
    limit = 1000,
    accumulatedData = []
  ) => {
    try {
      const { first_name, last_name } = player;
      const { data, error, count } = await supabase
        .from("Dynasty-historical-data")
        .select("value, date", { count: "exact" })
        .eq("first_name", first_name)
        .eq("last_name", last_name)
        .order("date", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching player data:", error);
        return accumulatedData;
      } else {
        const newData = accumulatedData.concat(data || []);
        if (count && offset + limit < count) {
          return fetchPlayerData(offset + limit, limit, newData);
        } else {
          return newData;
        }
      }
    } catch (error) {
      console.error("Error fetching player data:", error);
      return accumulatedData;
    }
  };

  const fetchAdditionalData = async () => {
    try {
      const { first_name, last_name } = player;
      const strippedLastName = stripSuffix(last_name);
      const { data, error } = await supabase
        .from("ktc_test")
        .select(
          "first_name, last_name, sf_value, age, sf_position_rank, date, position, team"
        )
        .eq("first_name", first_name)
        .ilike("last_name", `%${strippedLastName}%`)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching additional data:", error);
      } else if (data) {
        setAdditionalData(data[0]);
      }
    } catch (error) {
      console.error("Error fetching additional data:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setChartLoading(true);
      const data = await fetchPlayerData();
      setPlayerData(data);
      await fetchAdditionalData();
      setLoading(false);
      setChartLoading(false);
    };

    loadData();
  }, [player]);

  useEffect(() => {
    if (playerData.length > 0) {
      const validData = playerData.filter((entry) => entry.value !== null);
      const maxEntry = validData.reduce(
        (max, entry) => (entry.value > max.value ? entry : max),
        validData[0]
      );
      setMaxValue(maxEntry.value);
      setMaxValueDate(maxEntry.date);
    }
  }, [playerData]);

  const validData = useMemo(
    () => playerData.filter((entry) => entry.value !== null),
    [playerData]
  );

  const sixMonthsAgo = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  }, []);

  const recentData = useMemo(
    () => validData.filter((entry) => new Date(entry.date) >= sixMonthsAgo),
    [validData, sixMonthsAgo]
  );

  const chartOptions = {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
          displayFormats: {
            month: "MMM yyyy",
          },
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Dynasty Value",
        },
        ticks: {
          callback: (value) => value.toFixed(0),
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Value: ${context.raw}`,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  if (loading) return <Skeleton className="w-full h-96 rounded-lg" />;
  if (!playerData.length) return <div>No data available for this player.</div>;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold text-center">
          {additionalData?.first_name} {additionalData?.last_name}
        </CardTitle>
        <div className="flex justify-center space-x-2">
          <Badge variant="secondary">{additionalData?.position}</Badge>
          <Badge variant="outline">{additionalData?.team}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">SF Value</p>
            <p className="text-2xl font-bold">{additionalData?.sf_value}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Age</p>
            <p className="text-2xl font-bold">{additionalData?.age}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">SF Position Rank</p>
            <p className="text-2xl font-bold">
              {additionalData?.sf_position_rank}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Max Value</p>
            <p className="text-2xl font-bold">{maxValue}</p>
            <p className="text-xs text-gray-400">
              {maxValueDate && new Date(maxValueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Tabs defaultValue="allTime" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="allTime">All Time</TabsTrigger>
            <TabsTrigger value="sixMonths">Last 6 Months</TabsTrigger>
          </TabsList>
          <TabsContent value="allTime">
            <div className="h-64">
              {chartLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Line
                  data={{
                    labels: validData.map((entry) => new Date(entry.date)),
                    datasets: [
                      {
                        label: "Value (All Time)",
                        data: validData.map((entry) => entry.value),
                        borderColor: "rgba(75,192,192,1)",
                        backgroundColor: "rgba(75,192,192,0.4)",
                        pointBackgroundColor: validData.map((entry) =>
                          entry.date === maxValueDate
                            ? "red"
                            : "rgba(75,192,192,1)"
                        ),
                        pointRadius: validData.map((entry) =>
                          entry.date === maxValueDate ? 6 : 2
                        ),
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              )}
            </div>
          </TabsContent>
          <TabsContent value="sixMonths">
            <div className="h-64">
              {chartLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Line
                  data={{
                    labels: recentData.map((entry) => new Date(entry.date)),
                    datasets: [
                      {
                        label: "Value (Last 6 Months)",
                        data: recentData.map((entry) => entry.value),
                        borderColor: "rgba(255,99,132,1)",
                        backgroundColor: "rgba(255,99,132,0.4)",
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
