import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
        const newData = accumulatedData.concat(data);
        if (offset + limit < count) {
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
      } else {
        setAdditionalData(data[0]); // Assuming you only need the most recent entry
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

  const optionsAllTime = useMemo(
    () => ({
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
          beginAtZero: true,
          title: {
            display: true,
            text: "Dynasty Value",
          },
          ticks: {
            callback: function (value) {
              return value.toFixed(0);
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: (context) => `Value: ${context.raw}`,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    }),
    []
  );

  const optionsSixMonth = useMemo(
    () => ({
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
            callback: function (value) {
              return value.toFixed(0);
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: (context) => `Value: ${context.raw}`,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    }),
    []
  );

  if (loading) return <div>Loading...</div>;
  if (!playerData.length) return <div>No data available for this player.</div>;

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">
          {additionalData.first_name} {additionalData.last_name}
        </h2>
        <p className="text-gray-500">
          {additionalData.position} - {additionalData.team}
        </p>
      </div>
      <div className="text-left">
        <h3 className="text-lg font-semibold">Stats:</h3>
        <ul className="list-disc list-inside">
          {maxValue !== null && (
            <li>
              Max Dynasty Value of <span className="font-bold">{maxValue}</span>{" "}
              on {new Date(maxValueDate).toLocaleDateString()}
            </li>
          )}
          {additionalData && (
            <>
              <li>
                SF Value:{" "}
                <span className="font-bold">{additionalData.sf_value}</span>
              </li>
              <li>
                Age: <span className="font-bold">{additionalData.age}</span>
              </li>
              <li>
                SF Position Rank:{" "}
                <span className="font-bold">
                  {additionalData.sf_position_rank}
                </span>
              </li>
            </>
          )}
        </ul>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-center">
            All Time Dynasty Value
          </h3>
          <div className="relative h-64">
            {chartLoading ? (
              <div className="skeleton h-full w-full" />
            ) : (
              <Line
                data={{
                  labels: validData.map((entry) => new Date(entry.date)),
                  datasets: [
                    {
                      label: "Value (All Time)",
                      data: validData.map((entry) => entry.value),
                      fill: false,
                      backgroundColor: "rgba(75,192,192,0.4)",
                      borderColor: "rgba(75,192,192,1)",
                      borderWidth: 2,
                      lineTension: 0.1,
                      pointBackgroundColor: validData.map((entry) =>
                        entry.date === maxValueDate
                          ? "red"
                          : "rgba(75,192,192,1)"
                      ),
                      pointRadius: validData.map((entry) =>
                        entry.date === maxValueDate ? 8 : 3
                      ),
                    },
                  ],
                }}
                options={optionsAllTime}
              />
            )}
          </div>
          <h3 className="text-lg font-semibold mt-6 text-center">
            Dynasty Value Last 6 Months
          </h3>
          <div className="relative h-64">
            {chartLoading ? (
              <div className="skeleton h-full w-full" />
            ) : (
              <Line
                data={{
                  labels: recentData.map((entry) => new Date(entry.date)),
                  datasets: [
                    {
                      label: "Value (Last 6 Months)",
                      data: recentData.map((entry) => entry.value),
                      fill: false,
                      backgroundColor: "rgba(255,99,132,0.4)",
                      borderColor: "rgba(255,99,132,1)",
                      borderWidth: 2,
                      lineTension: 0.1,
                    },
                  ],
                }}
                options={optionsSixMonth}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
