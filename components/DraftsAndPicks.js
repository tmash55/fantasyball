import React, { useState, useEffect } from "react";
import axios from "axios";

const leagueId = "1053041007475994624";

const DraftsAndPicks = () => {
  const [drafts, setDrafts] = useState([]);
  const [draftsPicks, setDraftsPicks] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch drafts for the league
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await axios.get(
          `https://api.sleeper.app/v1/league/${leagueId}/drafts`
        );
        setDrafts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        setLoading(false);
      }
    };
    fetchDrafts();
  }, []);

  // Fetch users for the league
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `https://api.sleeper.app/v1/league/${leagueId}/users`
        );
        const usersMap = response.data.reduce((acc, user) => {
          acc[user.user_id] = user.display_name;
          return acc;
        }, {});
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch picks for all drafts
  useEffect(() => {
    const fetchPicksForAllDrafts = async () => {
      try {
        const allDraftsPicks = await Promise.all(
          drafts.map(async (draft) => {
            const response = await axios.get(
              `https://api.sleeper.app/v1/draft/${draft.draft_id}/picks`
            );
            return {
              draftId: draft.draft_id,
              picks: response.data,
              draftOrder: draft.draft_order,
            };
          })
        );
        setDraftsPicks(allDraftsPicks);
      } catch (error) {
        console.error("Error fetching picks:", error);
      }
    };

    if (drafts.length > 0) {
      fetchPicksForAllDrafts();
    }
  }, [drafts]);

  return (
    <div>
      <h1>League Drafts and Picks</h1>
      {loading ? (
        <p>Loading drafts...</p>
      ) : (
        draftsPicks.map(({ draftId, picks, draftOrder }) => (
          <div key={draftId}>
            <h2>Picks for Draft {draftId}</h2>
            <div className="grid-container">
              <div className="grid-header">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((slot) => (
                  <div key={slot} className="grid-header-item">
                    {users[
                      Object.keys(draftOrder).find(
                        (userId) => draftOrder[userId] === slot
                      )
                    ] || "Unknown"}
                  </div>
                ))}
              </div>
              <div className="grid-body">
                {Array.from({ length: picks.length / 12 }).map(
                  (_, rowIndex) => (
                    <div className="grid-row" key={rowIndex}>
                      {Array.from({ length: 12 }, (_, colIndex) => {
                        const pick = picks.find(
                          (pick) =>
                            pick.round === rowIndex + 1 &&
                            pick.draft_slot === colIndex + 1
                        );
                        return (
                          <div key={colIndex} className="grid-item">
                            {pick ? (
                              <div>
                                <div>
                                  {pick.metadata.first_name}{" "}
                                  {pick.metadata.last_name} (
                                  {pick.metadata.team})
                                </div>
                                <div>
                                  Picked by:{" "}
                                  {users[pick.picked_by] || "Unknown"}
                                </div>
                                <div>Pick Number: {pick.pick_no}</div>
                              </div>
                            ) : (
                              <div>---</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ))
      )}
      <style jsx>{`
        .grid-container {
          display: grid;
          gap: 10px;
        }
        .grid-header {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
        }
        .grid-header-item {
          font-weight: bold;
          background-color: base-300;
          padding: 10px;
          border: 1px solid #ccc;
          text-align: center;
        }
        .grid-body {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
        }
        .grid-row {
          display: contents;
        }
        .grid-item {
          background-color: base-300;
          padding: 10px;
          border: 1px solid #ccc;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default DraftsAndPicks;
