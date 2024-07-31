import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns"; // Import the date adapter

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PlayerCard = ({ player }) => {
  const [playerData, setPlayerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(null);
  const [maxValueDate, setMaxValueDate] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const { first_name, last_name } = player;
        const { data, error } = await supabase
          .from("Dynasty-historical-data")
          .select("first_name, last_name, value, date")
          .eq("first_name", first_name)
          .ilike("last_name", `%${last_name}%`)
          .order("date", { ascending: false });

        if (error) {
          console.error("Error fetching player data:", error);
        } else {
          setPlayerData(data);
        }
      } catch (error) {
        console.error("Error fetching player data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
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

  if (loading) return <div>Loading...</div>;
  if (!playerData.length) return <div>No data available for this player.</div>;

  // Filter out entries with no values
  const validData = playerData.filter((entry) => entry.value !== null);

  // Prepare data for the chart
  const chartData = {
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
      },
    ],
  };

  // Filter data for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentData = validData.filter(
    (entry) => new Date(entry.date) >= sixMonthsAgo
  );

  const recentChartData = {
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
  };

  const optionsAllTime = {
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
            return value.toFixed(0); // Remove decimal points
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
  };
  const optionsSixMonth = {
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
            return value.toFixed(0); // Remove decimal points
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
  };

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">
          {player.first_name} {player.last_name}
        </h2>
        <p className="text-gray-500">
          {player.position} - {player.team}
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
        </ul>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-center">
            All Time Dynasty Value
          </h3>
          <div className="relative h-64">
            <Line data={chartData} options={optionsAllTime} />
          </div>
          <h3 className="text-lg font-semibold mt-6 text-center">
            Dynasty Value Last 6 Months
          </h3>
          <div className="relative h-64">
            <Line data={recentChartData} options={optionsSixMonth} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
