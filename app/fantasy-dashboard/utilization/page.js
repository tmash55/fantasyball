import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import PlayerUtilizationReport from "@/components/fantasy-dashboard/PlayerUtilizationReport";

const PlayerComparisonPage = () => {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center sm:text-left">
            Utilization Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            Explore comprehensive NFL player projections for each week. Use the
            filters and sorting options to customize your view and gain valuable
            insights for your fantasy team.
          </p>
          <div className="flex items-center text-sm text-gray-400">
            <Info className="mr-2 h-4 w-4" />
            <span>Pro Tip: Click on a player to see detailed projections.</span>
          </div>
        </CardContent>
      </Card>
      <PlayerUtilizationReport />
    </div>
  );
};

export default PlayerComparisonPage;
