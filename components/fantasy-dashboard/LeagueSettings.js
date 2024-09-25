import React from "react";
import { Users, Settings, Trophy, Target, Zap, Clipboard } from "lucide-react";

const LeagueSettings = ({ league }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">League Details</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>League Size: {league.total_rosters}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              <span>
                Type:{" "}
                {league.settings.type === 0
                  ? "Redraft"
                  : league.settings.type === 1
                  ? "Keeper"
                  : "Dynasty"}
              </span>
            </div>
            <div className="flex items-center">
              <Clipboard className="h-5 w-5 mr-2" />
              <span>
                Format:{" "}
                {league.settings.best_ball === 1 ? "Best Ball" : "Standard"}
              </span>
            </div>
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              <span>Scoring: {getScoringFormat(league.scoring_settings)}</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              <span>Passing TD: {league.scoring_settings.pass_td} points</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Team</h3>
          <div className="space-y-2">
            <div>Record: {getUserRecord(league)}</div>
            <div>Playoff Chance: {calculatePlayoffChance(league)}%</div>
            <div>
              Current Rank: {getCurrentRank(league)} / {league.total_rosters}
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-primary/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-primary/60" />
                <span className="text-sm font-medium">Playoff Chance:</span>
              </div>
              <span className="text-sm font-bold">
                {calculatePlayoffChance(league)}%
              </span>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${calculatePlayoffChance(league)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getScoringFormat = (scoringSettings) => {
  if (!scoringSettings) return "Unknown";
  const rec = scoringSettings.rec || 0;
  const bonusRecTe = scoringSettings.bonus_rec_te || 0;
  if (rec === 1) {
    return bonusRecTe > 0 ? `PPR TEP (+${bonusRecTe})` : "PPR";
  } else if (rec === 0.5) {
    return bonusRecTe > 0 ? `Half PPR TEP (+${bonusRecTe})` : "Half PPR";
  } else if (rec === 0) {
    return bonusRecTe > 0 ? `Standard TEP (+${bonusRecTe})` : "Standard";
  }
  return "Custom";
};

const getUserRecord = (league) => {
  if (league.userRoster && league.userRoster.settings) {
    const wins = league.userRoster.settings.wins || 0;
    const losses = league.userRoster.settings.losses || 0;
    const ties = league.userRoster.settings.ties || 0;
    return `${wins}-${losses}${ties ? `-${ties}` : ""}`;
  }
  return "N/A";
};

const getCurrentRank = (league) => {
  return (
    league.rosters
      .sort((a, b) => (b.settings?.wins || 0) - (a.settings?.wins || 0))
      .findIndex((roster) => roster.roster_id === league.userRoster.roster_id) +
    1
  );
};

const calculatePlayoffChance = (league) => {
  if (!league.userRoster || !league.userRoster.settings) return 0;

  const totalTeams = league.total_rosters;
  const playoffSpots = Math.max(4, Math.floor(totalTeams / 3));
  const currentRank = getCurrentRank(league);
  const totalGames =
    (league.userRoster.settings.wins || 0) +
    (league.userRoster.settings.losses || 0) +
    (league.userRoster.settings.ties || 0);
  const remainingWeeks = 14 - totalGames;

  // Calculate win percentage
  const winPercentage = league.userRoster.settings.wins / totalGames || 0;

  // Calculate points for ranking
  const sortedRosters = league.rosters.sort(
    (a, b) => (b.settings?.fpts || 0) - (a.settings?.fpts || 0)
  );
  const pointsRank =
    sortedRosters.findIndex(
      (roster) => roster.roster_id === league.userRoster.roster_id
    ) + 1;

  // Calculate average points per game
  const avgPointsPerGame = league.userRoster.settings.fpts / totalGames || 0;
  const leagueAvgPointsPerGame =
    league.rosters.reduce(
      (sum, roster) => sum + (roster.settings?.fpts || 0),
      0
    ) /
    (totalTeams * totalGames);

  // Factors for playoff chance calculation
  const rankFactor = 1 - (currentRank - 1) / (totalTeams - 1);
  const winPercentageFactor = winPercentage;
  const pointsRankFactor = 1 - (pointsRank - 1) / (totalTeams - 1);
  const avgPointsFactor =
    avgPointsPerGame > leagueAvgPointsPerGame ? 0.1 : -0.1;

  // Calculate base chance
  let baseChance =
    (rankFactor * 0.4 +
      winPercentageFactor * 0.3 +
      pointsRankFactor * 0.2 +
      avgPointsFactor) *
    100;

  // Adjust for remaining weeks
  const weeksFactor = remainingWeeks / 14; // Assuming a 14-week regular season
  baseChance = baseChance * (1 - weeksFactor) + 50 * weeksFactor;

  // Adjust based on playoff spots
  if (currentRank <= playoffSpots) {
    baseChance = Math.min(baseChance * 1.2, 99); // Boost chances if in playoff position
  } else {
    baseChance = Math.max(baseChance * 0.8, 1); // Reduce chances if out of playoff position
  }

  return Math.round(Math.max(1, Math.min(99, baseChance)));
};

export default LeagueSettings;
