import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function PlayerDetailsRow({
  player,
  scoringSettings,
  calculateImpliedProbability,
  calculateTouchdownPoints,
}) {
  const fantasyPoints = [
    {
      label: "Passing Yards",
      value: ((player.passyardsou / 25) * 1).toFixed(2),
      prop: player.passyardsou,
    },
    {
      label: "Passing TD",
      value: (() => {
        const impliedProb = calculateImpliedProbability(player.passtdsoverodds);
        const expectedTDs =
          player.passtdsnumber * impliedProb +
          (player.passtdsnumber - 0.5) * (1 - impliedProb);
        return (expectedTDs * scoringSettings.passingTDPts).toFixed(2);
      })(),
      prop: player.passtdsnumber,
    },
    {
      label: "Interception",
      value: (() => {
        const impliedProb = calculateImpliedProbability(
          player.interceptionsoverodds
        );
        const expectedInts =
          player.interceptions * impliedProb +
          (player.interceptions - 0.5) * (1 - impliedProb);
        return (expectedInts * -2).toFixed(2);
      })(),
      prop: player.interceptions,
    },
    {
      label: "Rushing Yards",
      value: ((player.rushyardsou / 10) * 1).toFixed(2),
      prop: player.rushyardsou,
    },
    {
      label: "Receiving Yards",
      value: ((player.receivingyardsou / 10) * 1).toFixed(2),
      prop: player.receivingyardsou,
    },
    {
      label: "Receptions (PPR)",
      value: (player.receptionsou * scoringSettings.ppr).toFixed(2),
      prop: player.receptionsou,
    },
    {
      label: "Anytime Touchdown",
      value:
        player.anytime_td_odds && player.anytime_td_odds !== "N/A"
          ? calculateTouchdownPoints(player.anytime_td_odds)
          : "0.00",
      prop: player.anytime_td_odds,
    },
  ];

  const totalPoints = fantasyPoints
    .reduce((sum, item) => sum + parseFloat(item.value), 0)
    .toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg"
    >
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center text-xl text-gray-100">
            <span>Fantasy Points Breakdown</span>
            <span className="text-2xl font-bold text-orange-400">
              {totalPoints}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {fantasyPoints.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center text-sm text-gray-200"
              >
                <span className="text-gray-400">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl text-gray-100">
            Player Props
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 ml-2 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Props from Draftkings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {fantasyPoints.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center text-sm text-gray-200"
              >
                <span className="text-gray-400">{item.label} O/U:</span>
                <span className="font-medium">{item.prop || "N/A"}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
