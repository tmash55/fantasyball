import axios from "axios";
import {
  getCurrentNFLWeek,
  fetchNFLSchedule,
  fetchPlayerSeasonalStatsOnly,
} from "@/libs/sleeper";

const BASE_URL = "https://api.sleeper.app/v1";

export default async function handler(req, res) {
  const {
    page = 1,
    limit = 50,
    position = "All",
    scoringType = "PPR",
  } = req.query;

  try {
    const week = await getCurrentNFLWeek();
    const schedule = await fetchNFLSchedule(week);
    const playerStats = await fetchPlayerSeasonalStatsOnly();

    const [sleeperRankings, seasonStats] = await Promise.all([
      axios.get(
        `${BASE_URL}/stats/nfl/regular/2024?season_type=regular&position=ALL`
      ),
      axios.get(
        `${BASE_URL}/stats/nfl/regular/2024?season_type=regular&position=all`
      ),
    ]);

    const combinedPlayerData = playerStats.map((player) => {
      const sleeperRank = sleeperRankings.data[player.id];
      const seasonStat = seasonStats.data[player.id];
      return {
        ...player,
        rank_ppr: sleeperRank?.rank_ppr ?? Infinity,
        rank_half_ppr: sleeperRank?.rank_half_ppr ?? Infinity,
        rank_std: sleeperRank?.rank_std ?? Infinity,
        pos_rank_ppr: sleeperRank?.pos_rank_ppr ?? Infinity,
        pos_rank_half_ppr: sleeperRank?.pos_rank_half_ppr ?? Infinity,
        pos_rank_std: sleeperRank?.pos_rank_std ?? Infinity,
        totalPointsHalfPPR: seasonStat?.pts_half_ppr ?? 0,
        averagePointsHalfPPR: seasonStat
          ? seasonStat.pts_half_ppr / seasonStat.gp
          : 0,
      };
    });

    // Filter and sort data
    let filteredData = combinedPlayerData;
    if (position !== "All") {
      filteredData = filteredData.filter(
        (player) => player.position === position
      );
    }

    filteredData.sort((a, b) => {
      const aRank = a[`rank_${scoringType.toLowerCase()}`];
      const bRank = b[`rank_${scoringType.toLowerCase()}`];
      return aRank - bRank;
    });

    // Paginate data
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    res.status(200).json({
      players: paginatedData,
      currentWeek: week,
      schedule,
      totalPlayers: filteredData.length,
      currentPage: Number(page),
      totalPages: Math.ceil(filteredData.length / Number(limit)),
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
}
