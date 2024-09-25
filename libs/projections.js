import { fetchTouchdownData } from "@/app/api/props/td-props-week-1/route";
import { fetchWeekData } from "@/app/api/props/weeklyprops2";
import { getCurrentNFLWeek } from "./sleeper";

const parseOdds = (odds) => {
  if (typeof odds === "string") {
    odds = odds.trim();
    const isNegative = odds.charAt(0) === "−";
    if (isNegative) {
      odds = odds.substring(1);
    }
    const parsedValue = parseFloat(odds);
    return isNegative ? -parsedValue : parsedValue;
  }
  return parseFloat(odds);
};

const calculateImpliedProbability = (odds) => {
  const parsedOdds = parseOdds(odds);
  if (parsedOdds < 0) {
    return Math.abs(parsedOdds) / (Math.abs(parsedOdds) + 100);
  } else if (parsedOdds > 0) {
    return 100 / (parsedOdds + 100);
  }
  return 0;
};

const safeParseFloat = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "N/A"
  ) {
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const calculateFantasyPoints = (player, scoringSettings) => {
  console.log(
    "Calculating fantasy points for player:",
    player.nfl_players?.player_name || player.nfl_players?.sleeper_id
  );

  const passingYards = safeParseFloat(player.passyardsou);
  const passingTDs = safeParseFloat(player.passtdsnumber);
  const interceptions = safeParseFloat(player.interceptions);
  const rushingYards = safeParseFloat(player.rushyardsou);
  const rushingTDs = safeParseFloat(player.rushtdsnumber);
  const receivingYards = safeParseFloat(player.receivingyardsou);
  const receptions = safeParseFloat(player.receptionsou);

  console.log("Parsed values:", {
    passingYards,
    passingTDs,
    interceptions,
    rushingYards,
    rushingTDs,
    receivingYards,
    receptions,
  });

  // Passing yards
  const passingYardsPoints = passingYards * scoringSettings.pass_yd;

  // Passing TDs
  let passingTDPoints = 0;
  if (player.passtdsoverodds) {
    const passingTDImpliedProbability = calculateImpliedProbability(
      player.passtdsoverodds
    );
    const expectedPassingTDs =
      passingTDs * passingTDImpliedProbability +
      (passingTDs - 0.5) * (1 - passingTDImpliedProbability);
    passingTDPoints = expectedPassingTDs * scoringSettings.pass_td;
  } else {
    passingTDPoints = passingTDs * scoringSettings.pass_td;
  }

  // Interceptions
  let interceptionPoints = 0;
  if (player.interceptionsoverodds) {
    const interceptionImpliedProbability = calculateImpliedProbability(
      player.interceptionsoverodds
    );
    const expectedInterceptions =
      interceptions * interceptionImpliedProbability +
      (interceptions - 0.5) * (1 - interceptionImpliedProbability);
    interceptionPoints = expectedInterceptions * scoringSettings.pass_int;
  } else {
    interceptionPoints = interceptions * scoringSettings.pass_int;
  }

  // Rushing yards
  const rushingYardsPoints = rushingYards * scoringSettings.rush_yd;

  // Rushing TDs
  let rushingTDPoints = 0;
  if (player.rushtdsoverodds) {
    const rushingTDImpliedProbability = calculateImpliedProbability(
      player.rushtdsoverodds
    );
    const expectedRushingTDs =
      rushingTDs * rushingTDImpliedProbability +
      (rushingTDs - 0.5) * (1 - rushingTDImpliedProbability);
    rushingTDPoints = expectedRushingTDs * scoringSettings.rush_td;
  } else {
    rushingTDPoints = rushingTDs * scoringSettings.rush_td;
  }

  // Receiving yards
  const receivingYardsPoints = receivingYards * scoringSettings.rec_yd;

  // Receptions (PPR)
  const receptionsPoints = receptions * scoringSettings.rec;

  // Receiving TDs
  let receivingTDPoints = 0;
  if (player.anytime_td_odds && player.anytime_td_odds !== "N/A") {
    const touchdownImpliedProbability = calculateImpliedProbability(
      player.anytime_td_odds
    );
    receivingTDPoints = touchdownImpliedProbability * scoringSettings.rec_td;
  }

  const totalPoints =
    passingYardsPoints +
    passingTDPoints -
    interceptionPoints +
    rushingYardsPoints +
    rushingTDPoints +
    receivingYardsPoints +
    receptionsPoints +
    receivingTDPoints;

  console.log("Calculated points breakdown:", {
    passingYardsPoints,
    passingTDPoints,
    interceptionPoints,
    rushingYardsPoints,
    rushingTDPoints,
    receivingYardsPoints,
    receptionsPoints,
    receivingTDPoints,
    totalPoints,
  });

  return totalPoints;
};

export async function fetchWeeklyProjections(playerIds, leagueScoringSettings) {
  try {
    console.log("Received league scoring settings:", leagueScoringSettings);

    const currentWeek = await getCurrentNFLWeek();
    const weekData = await fetchWeekData(currentWeek);
    const tdData = await fetchTouchdownData(currentWeek);

    const combinedData = weekData.reduce((acc, player) => {
      const existingPlayer = acc.find(
        (p) => p.nfl_players?.sleeper_id === player.nfl_players?.sleeper_id
      );

      if (existingPlayer) {
        Object.keys(player).forEach((key) => {
          if (
            player[key] !== null &&
            player[key] !== "N/A" &&
            !existingPlayer[key]
          ) {
            existingPlayer[key] = player[key];
          }
        });
      } else {
        acc.push({ ...player });
      }

      return acc;
    }, []);

    const processedData = combinedData.map((player) => {
      if (
        safeParseFloat(player.receivingyardsou) > 0 &&
        (player.receptionsou === null || player.receptionsou === "N/A")
      ) {
        player.receptionsou = 1;
      }

      const playerTouchdownData = tdData.find(
        (td) => td.nfl_players?.sleeper_id === player.nfl_players?.sleeper_id
      );

      if (playerTouchdownData) {
        player.anytime_td_odds = playerTouchdownData.anytime_td_odds;
      }

      return player;
    });

    console.log("Processed data:", processedData);

    const scoringSettings = {
      pass_yd: leagueScoringSettings.pass_yd || 0.04,
      pass_td: leagueScoringSettings.pass_td || 4,
      pass_int: leagueScoringSettings.pass_int || -2,
      rush_yd: leagueScoringSettings.rush_yd || 0.1,
      rush_td: leagueScoringSettings.rush_td || 6,
      rec_yd: leagueScoringSettings.rec_yd || 0.1,
      rec: leagueScoringSettings.rec || 0.5,
      rec_td: leagueScoringSettings.rec_td || 6,
      fum_lost: leagueScoringSettings.fum_lost || -1,
    };

    console.log("Calculated scoring settings:", scoringSettings);

    const projections = {};

    processedData.forEach((player) => {
      if (playerIds.includes(player.nfl_players?.sleeper_id)) {
        const projectedPoints = calculateFantasyPoints(player, scoringSettings);
        projections[player.nfl_players?.sleeper_id] = {
          projectedPoints: parseFloat(projectedPoints.toFixed(2)),
          week: currentWeek,
          playerName: player.nfl_players?.player_name || "Unknown Player",
          position: player.nfl_players?.position || "Unknown",
          team: player.nfl_players?.team || "Unknown",
          opponent: player.opponent || "Unknown",
          gameDate: player.game_date || "Unknown",
          gameTime: player.game_time || "Unknown",
          passingProjection: {
            yards: safeParseFloat(player.passyardsou),
            touchdowns: safeParseFloat(player.passtdsnumber),
            interceptions: safeParseFloat(player.interceptions),
          },
          rushingProjection: {
            yards: safeParseFloat(player.rushyardsou),
            attempts: safeParseFloat(player.rushattempts),
            touchdowns: safeParseFloat(player.rushtdsnumber),
          },
          receivingProjection: {
            yards: safeParseFloat(player.receivingyardsou),
            receptions: safeParseFloat(player.receptionsou),
          },
          anytimeTdOdds: player.anytime_td_odds || "N/A",
        };
      }
    });

    return projections;
  } catch (error) {
    console.error("Error fetching weekly projections:", error);
    throw error;
  }
}
