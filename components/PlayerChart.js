import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";
import { format } from "date-fns";

const PlayerChart = ({ data, maxValueDate, label, timeRange }) => {
  const chartData = useMemo(() => {
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return {
      labels: sortedData.map((entry) => new Date(entry.date)),
      datasets: [
        {
          label: label,
          data: sortedData.map((entry) => entry.value),
          fill: true,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, "rgba(75,192,192,0.4)");
            gradient.addColorStop(1, "rgba(75,192,192,0.05)");
            return gradient;
          },
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 2,
          pointBackgroundColor: sortedData.map((entry) =>
            entry.date === maxValueDate ? "red" : "rgba(75,192,192,1)"
          ),
          pointRadius: sortedData.map((entry) =>
            entry.date === maxValueDate ? 6 : 3
          ),
          pointHoverRadius: 8,
          tension: 0.3,
        },
      ],
    };
  }, [data, maxValueDate, label]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: timeRange === "allTime" ? "month" : "week",
            displayFormats: {
              week: "MMM d",
              month: "MMM yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
            color: "rgba(255,255,255,0.8)",
          },
          ticks: {
            color: "rgba(255,255,255,0.6)",
          },
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Dynasty Value",
            color: "rgba(255,255,255,0.8)",
          },
          ticks: {
            color: "rgba(255,255,255,0.6)",
            callback: (value) => value.toFixed(0),
          },
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(0,0,0,0.8)",
          titleColor: "rgba(255,255,255,1)",
          bodyColor: "rgba(255,255,255,0.8)",
          callbacks: {
            title: (tooltipItems) => {
              return format(new Date(tooltipItems[0].raw.x), "MMMM d, yyyy");
            },
            label: (context) => `Value: ${context.parsed.y.toFixed(2)}`,
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
      elements: {
        point: {
          hitRadius: 10,
        },
      },
    }),
    [timeRange]
  );

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PlayerChart;
