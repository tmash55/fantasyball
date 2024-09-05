import supabase from "@/lib/supabaseClient";

export async function fetchWeekPropData(week) {
  // Fetch passing props data for the selected week
  const { data: passingData, error: passingError } = await supabase
    .from(`passing_props_week_${week}`)
    .select(
      "player, game, passyardsou, passtdsnumber, passtdsoverodds, passtdsunderodds, passattempts, passcompletions, interceptions, interceptionsoverodds, interceptionsunderodds, team, position"
    );

  // Fetch receiving props data for the selected week
  const { data: receivingData, error: receivingError } = await supabase
    .from(`receiving_props_week_${week}`)
    .select("player, game, receivingyardsou, receptions, team, position");

  // Fetch rushing props data for the selected week
  const { data: rushingData, error: rushingError } = await supabase
    .from(`rushing_props_week_${week}`)
    .select("player, game, rushyardsou, rushattempts, team, position");

  if (passingError || receivingError || rushingError) {
    throw new Error(
      passingError?.message || receivingError?.message || rushingError?.message
    );
  }

  // Combine the weekly data into a single array
  const combinedData = [];

  // Combine passing props
  passingData.forEach((prop) => {
    const player = combinedData.find((p) => p.player === prop.player);
    if (player) {
      player.passyardsou = prop.passyardsou;
      player.passtdsnumber = prop.passtdsnumber;
      player.passtdsoverodds = prop.passtdsoverodds;
      player.passtdsunderodds = prop.passtdsunderodds;
      player.passattempts = prop.passattempts;
      player.passcompletions = prop.passcompletions;
      player.interceptions = prop.interceptions;
      player.interceptionsoverodds = prop.interceptionsoverodds;
      player.interceptionsunderodds = prop.interceptionsunderodds;
    } else {
      combinedData.push({
        player: prop.player,
        game: prop.game,
        team: prop.team,
        position: prop.position,
        passyardsou: prop.passyardsou,
        passtdsnumber: prop.passtdsnumber,
        passtdsoverodds: prop.passtdsoverodds,
        passtdsunderodds: prop.passtdsunderodds,
        passattempts: prop.passattempts,
        passcompletions: prop.passcompletions,
        interceptions: prop.interceptions,
        interceptionsoverodds: prop.interceptionsoverodds,
        interceptionsunderodds: prop.interceptionsunderodds,
        receivingyardsou: null,
        receptions: null,
        rushyardsou: null,
        rushattempts: null,
      });
    }
  });

  // Combine receiving props
  receivingData.forEach((prop) => {
    const player = combinedData.find((p) => p.player === prop.player);
    if (player) {
      player.receivingyardsou = prop.receivingyardsou;
      player.receptions = prop.receptions;
      if (!player.team) player.team = prop.team; // Update team if not already set
      if (!player.position) player.position = prop.position; // Update position if not already set
    } else {
      combinedData.push({
        player: prop.player,
        game: prop.game,
        team: prop.team,
        position: prop.position,
        passyardsou: null,
        passtdsnumber: null,
        passtdsoverodds: null,
        passtdsunderodds: null,
        passattempts: null,
        passcompletions: null,
        interceptions: null,
        interceptionsoverodds: null,
        interceptionsunderodds: null,
        receivingyardsou: prop.receivingyardsou,
        receptions: prop.receptions,
        rushyardsou: null,
        rushattempts: null,
      });
    }
  });

  // Combine rushing props
  rushingData.forEach((prop) => {
    const player = combinedData.find((p) => p.player === prop.player);
    if (player) {
      player.rushyardsou = prop.rushyardsou;
      player.rushattempts = prop.rushattempts;
      if (!player.team) player.team = prop.team; // Update team if not already set
      if (!player.position) player.position = prop.position; // Update position if not already set
    } else {
      combinedData.push({
        player: prop.player,
        game: prop.game,
        team: prop.team,
        position: prop.position,
        passyardsou: null,
        passtdsnumber: null,
        passtdsoverodds: null,
        passtdsunderodds: null,
        passattempts: null,
        passcompletions: null,
        interceptions: null,
        interceptionsoverodds: null,
        interceptionsunderodds: null,
        receivingyardsou: null,
        receptions: null,
        rushyardsou: prop.rushyardsou,
        rushattempts: prop.rushattempts,
      });
    }
  });

  return combinedData;
}
