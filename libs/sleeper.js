import supabase from "@/lib/supabaseClient";

const BASE_URL = "https://api.sleeper.app/v1";

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}

export async function fetchUser(username) {
  const url = `${BASE_URL}/user/${username}`;
  return fetchWithRetry(url);
}

export async function fetchUserLeagues(userId, season) {
  const url = `${BASE_URL}/user/${userId}/leagues/nfl/${season}`;
  return fetchWithRetry(url);
}

export async function fetchLeagueDetails(leagueId) {
  const url = `${BASE_URL}/league/${leagueId}`;
  return fetchWithRetry(url);
}

export async function fetchLeagueRosters(leagueId) {
  const url = `${BASE_URL}/league/${leagueId}/rosters`;
  return fetchWithRetry(url);
}

export async function fetchLeagueUsers(leagueId) {
  const url = `${BASE_URL}/league/${leagueId}/users`;
  return fetchWithRetry(url);
}

export async function fetchUserRoster(leagueId, userId) {
  const rosters = await fetchLeagueRosters(leagueId);
  return rosters.find((roster) => roster.owner_id === userId);
}

export async function fetchPlayerNames(playerIds) {
  try {
    const { data, error } = await supabase
      .from("nfl_players")
      .select("sleeper_id, player_name")
      .in("sleeper_id", playerIds);

    if (error) throw error;

    return data.reduce((acc, player) => {
      acc[player.sleeper_id] = player.player_name;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching player names:", error);
    return {};
  }
}

export async function fetchUserLeaguesAndDetails(username, season) {
  const user = await fetchUser(username);
  if (!user) {
    throw new Error("User not found");
  }

  const leagues = await fetchUserLeagues(user.user_id, season);
  const leaguesWithDetails = await Promise.all(
    leagues.map(async (league) => {
      const [leagueDetails, rosters, users] = await Promise.all([
        fetchLeagueDetails(league.league_id),
        fetchLeagueRosters(league.league_id),
        fetchLeagueUsers(league.league_id),
      ]);

      const allPlayerIds = rosters.flatMap((roster) => [
        ...(roster.starters || []),
        ...(roster.players || []),
      ]);
      const playerNames = await fetchPlayerNames(allPlayerIds);

      const rostersWithUserDetails = rosters.map((roster) => {
        const user = users.find((u) => u.user_id === roster.owner_id);
        return {
          ...roster,
          username: user ? user.display_name : `Team ${roster.roster_id}`,
          avatar: user ? user.avatar : null,
          starters: (roster.starters || []).map((playerId) => ({
            id: playerId,
            name: playerNames[playerId] || playerId,
          })),
          players: (roster.players || []).map((playerId) => ({
            id: playerId,
            name: playerNames[playerId] || playerId,
          })),
        };
      });

      const userRoster = rostersWithUserDetails.find(
        (roster) => roster.owner_id === user.user_id
      );

      return {
        ...leagueDetails,
        rosters: rostersWithUserDetails,
        userRoster,
      };
    })
  );

  return leaguesWithDetails;
}
