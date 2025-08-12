import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const StatsRadarChart = ({ stats }: { stats: any }) => {
  if (!stats)
    return (
      <div className="text-gray-500 text-center py-4">No stats available</div>
    );

  const data = {
    labels: Object.keys(stats),
    datasets: [
      {
        label: "Performance",
        data: Object.values(stats),
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        borderColor: "rgba(234, 179, 8, 0.8)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(234, 179, 8)",
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { color: "rgba(255,255,255,0.1)" },
        grid: { color: "rgba(255,255,255,0.1)" },
        pointLabels: { color: "white" },
        ticks: {
          backdropColor: "transparent",
          color: "rgba(255,255,255,0.5)",
          stepSize: 20,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return <Radar data={data} options={options} />;
};
