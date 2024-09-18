import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const PlayerDetailsRow = ({
  player,
  scoringSettings,
  calculateImpliedProbability,
  calculateTouchdownPoints,
}) => {
  const calculateFantasyPoints = () => {
    const passingYards = parseFloat(player.passyardsou) || 0;
    const rushingYards = parseFloat(player.rushyardsou) || 0;
    const receivingYards = parseFloat(player.receivingyardsou) || 0;
    const receptions = parseFloat(player.receptionsou) || 0;

    let points = 0;

    // Passing Yards
    points += (passingYards / 25) * 1;

    // Rushing Yards
    points += (rushingYards / 10) * 1;

    // Receiving Yards
    points += (receivingYards / 10) * 1;

    // Receptions (PPR)
    points += receptions * scoringSettings.ppr;

    // Passing TDs
    if (player.passtdsoverodds) {
      const passingTDs = parseFloat(player.passtdsnumber) || 0;
      const passingTDImpliedProbability = calculateImpliedProbability(
        player.passtdsoverodds
      );
      const expectedPassingTDs =
        passingTDs * passingTDImpliedProbability +
        (passingTDs - 0.5) * (1 - passingTDImpliedProbability);
      points += expectedPassingTDs * scoringSettings.passingTDPts;
    }

    // Interceptions (subtract points)
    if (player.interceptionsoverodds) {
      const interceptions = parseFloat(player.interceptions) || 0;
      const interceptionImpliedProbability = calculateImpliedProbability(
        player.interceptionsoverodds
      );
      const expectedInterceptions =
        interceptions * interceptionImpliedProbability +
        (interceptions - 0.5) * (1 - interceptionImpliedProbability);
      points += expectedInterceptions * 2; // Subtract 2 points per expected interception
    }

    // Anytime Touchdown
    if (player.anytime_td_odds) {
      const touchdownImpliedProbability = calculateImpliedProbability(
        player.anytime_td_odds
      );
      points += touchdownImpliedProbability * 6;
    }

    return points.toFixed(2);
  };

  const fantasyPoints = calculateFantasyPoints();

  const renderStatRow = (label, value, tooltipContent) => (
    <div className="flex justify-between items-center py-1">
      <div className="flex items-center">
        {label}
        {tooltipContent && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="ml-1 h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span>{value}</span>
    </div>
  );

  const calculateInterceptionPoints = () => {
    if (player.interceptionsoverodds) {
      const interceptions = parseFloat(player.interceptions) || 0;
      const interceptionImpliedProbability = calculateImpliedProbability(
        player.interceptionsoverodds
      );
      const expectedInterceptions =
        interceptions * interceptionImpliedProbability +
        (interceptions - 0.5) * (1 - interceptionImpliedProbability);
      return (-expectedInterceptions * 2).toFixed(2);
    }
    return "0.00";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
            Fantasy Points Breakdown
            <Badge variant="secondary" className="text-lg">
              {fantasyPoints}
            </Badge>
          </h3>
          {renderStatRow(
            "Passing Yards:",
            ((parseFloat(player.passyardsou) || 0) / 25).toFixed(2)
          )}
          {renderStatRow(
            "Passing TD:",
            player.passtdsoverodds
              ? (
                  (parseFloat(player.passtdsnumber) || 0) *
                  calculateImpliedProbability(player.passtdsoverodds) *
                  scoringSettings.passingTDPts
                ).toFixed(2)
              : "0.00"
          )}
          {renderStatRow("Interception:", calculateInterceptionPoints())}
          {renderStatRow(
            "Rushing Yards:",
            ((parseFloat(player.rushyardsou) || 0) / 10).toFixed(2)
          )}
          {renderStatRow(
            "Receiving Yards:",
            ((parseFloat(player.receivingyardsou) || 0) / 10).toFixed(2)
          )}
          {renderStatRow(
            "Receptions (PPR):",
            (
              (parseFloat(player.receptionsou) || 0) * scoringSettings.ppr
            ).toFixed(2)
          )}
          {renderStatRow(
            "Anytime Touchdown:",
            calculateTouchdownPoints(player.anytime_td_odds)
          )}
        </CardContent>
      </Card>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            Player Props
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>O/U: Over/Under</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          {renderStatRow("Passing Yards O/U:", player.passyardsou || "N/A")}
          {renderStatRow("Passing TD O/U:", player.passtdsnumber || "N/A")}
          {renderStatRow("Interception O/U:", player.interceptions || "N/A")}
          {renderStatRow("Rushing Yards O/U:", player.rushyardsou || "N/A")}
          {renderStatRow(
            "Receiving Yards O/U:",
            player.receivingyardsou || "N/A"
          )}
          {renderStatRow("Receptions (PPR) O/U:", player.receptionsou || "N/A")}
          {renderStatRow(
            "Anytime Touchdown O/U:",
            player.anytime_td_odds || "N/A"
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerDetailsRow;
