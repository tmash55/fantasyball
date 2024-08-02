// PlayerChart.js
import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";

const PlayerChart = ({ data, maxValueDate, label, options }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((entry) => new Date(entry.date)),
      datasets: [
        {
          label: label,
          data: data.map((entry) => entry.value),
          fill: false,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 2,
          lineTension: 0.1,
          pointBackgroundColor: data.map((entry) =>
            entry.date === maxValueDate ? "red" : "rgba(75,192,192,1)"
          ),
          pointRadius: data.map((entry) =>
            entry.date === maxValueDate ? 8 : 3
          ),
        },
      ],
    }),
    [data, maxValueDate, label]
  );

  return <Line data={chartData} options={options} />;
};

export default PlayerChart;
