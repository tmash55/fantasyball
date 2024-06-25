const dbagsID = 1048461014691328000;
const WNBAID = 1048724879677218816;
const BSMTID = 1053041007475994624;
const junkiesID = 1048406686140116992;
const buildersID = 1048276775261904896;

export async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
  }
  return response.json();
}

export async function fetchLeagueName(leagueId) {
  const specificLeagueUrl = `https://api.sleeper.app/v1/league/${leagueId}`;
  const response = await fetch(specificLeagueUrl);
  const data = await response.json();
  return data.name;
}

export async function fetchLeagueSettings(leagueId) {
  const specificLeagueUrl = `https://api.sleeper.app/v1/league/${leagueId}`;
  const response = await fetch(specificLeagueUrl);
  const data = await response.json();
  return data.settings;
}

export async function getStartersWithNames(leagueId) {
  const playersUrl = "https://api.sleeper.app/v1/players/nfl";

  try {
    const [rostersData, playersData] = await Promise.all([
      fetchData(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
      fetchData(playersUrl),
    ]);

    const playerMap = {};
    for (const playerId in playersData) {
      playerMap[playerId] = {
        name: playersData[playerId].full_name,
        position: playersData[playerId].position,
      };
    }

    return rostersData.map((team) => {
      const starterNames = team.starters.map((playerId) => {
        const player = playerMap[playerId];
        return player
          ? `${player.name} (${player.position})`
          : `Unknown Player (${playerId})`;
      });

      return {
        rosterId: team.roster_id,
        starters: starterNames,
      };
    });
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function getStartersWithNamesAndPositions(leagueId) {
  const playersUrl = "https://api.sleeper.app/v1/players/nfl";

  try {
    const [rostersData, playersData] = await Promise.all([
      fetchData(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
      fetchData(playersUrl),
    ]);

    const playerMap = {};
    for (const playerId in playersData) {
      playerMap[playerId] = {
        name: playersData[playerId].full_name,
        position: playersData[playerId].position,
      };
    }

    return await Promise.all(
      rostersData.map(async (team) => {
        const starterNames = team.starters.map((playerId) => {
          const player = playerMap[playerId];
          return player
            ? `${player.name} (${player.position})`
            : `Unknown Player (${playerId})`;
        });
        const username = await fetchUsername(team.owner_id);

        return {
          rosterId: team.roster_id,
          owner: username,
          starters: starterNames,
        };
      })
    );
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function fetchLeagueIds(userId) {
  const sport = "nfl";
  const season = "2024";
  try {
    const response = await fetch(
      `https://api.sleeper.app/v1/user/${userId}/leagues/${sport}/${season}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const leagues = await response.json();

    if (!Array.isArray(leagues)) {
      throw new Error("Expected an array of leagues");
    }

    return leagues.map((league) => league.league_id);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function fetchUserID(username) {
  const usernameUrl = `https://api.sleeper.app/v1/user/${username}`;
  const response = await fetch(usernameUrl);
  const data = await response.json();
  return data.user_id;
}

export async function fetchLeagueIdsAndStarters(userId) {
  try {
    const leagueIds = await fetchLeagueIds(userId);

    return await Promise.all(
      leagueIds.map(async (leagueId) => {
        const leagueName = await fetchLeagueName(leagueId);
        const starters = await getStartersWithNamesAndPositions(leagueId);
        return {
          leagueId,
          leagueName,
          starters,
        };
      })
    );
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function fetchUsername(userId) {
  const userIdUrl = `https://api.sleeper.app/v1/user/${userId}`;
  const response = await fetch(userIdUrl);
  const data = await response.json();
  return data.username;
}
