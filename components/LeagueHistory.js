import { useState, useEffect } from "react";
import axios from "axios";

const useLeagueHistory = (currentLeagueId) => {
  const [leagueHistory, setLeagueHistory] = useState([]);

  useEffect(() => {
    const fetchLeagueHistory = async (leagueId) => {
      const leagueIds = [];
      const seasons = [];

      while (leagueId) {
        try {
          const response = await axios.get(
            `https://api.sleeper.app/v1/league/${leagueId}`
          );
          const data = response.data;

          leagueIds.push(leagueId);
          seasons.push(data.season);

          leagueId = data.previous_league_id;
        } catch (error) {
          console.error("Error fetching league data:", error);
          break;
        }
      }

      const history = leagueIds.map((id, index) => ({
        leagueId: id,
        season: seasons[index],
      }));
      setLeagueHistory(history);
    };

    if (currentLeagueId) {
      fetchLeagueHistory(currentLeagueId);
    }
  }, [currentLeagueId]);

  return leagueHistory;
};

export default useLeagueHistory;
