import React, { useState, useEffect } from "react";
import axios from "axios";
import clsx from "clsx"; // To easily manage conditional class names

const DraftPicks = ({ draftId, leagueId }) => {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [draftOrder, setDraftOrder] = useState([]);

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
  }, [leagueId]);

  useEffect(() => {
    const fetchDraftDetails = async () => {
      try {
        const draftResponse = await axios.get(
          `https://api.sleeper.app/v1/draft/${draftId}`
        );
        const draftData = draftResponse.data;
        const draftOrderArray = Object.entries(draftData.draft_order).sort(
          (a, b) => a[1] - b[1]
        );
        setDraftOrder(draftOrderArray);

        const picksResponse = await axios.get(
          `https://api.sleeper.app/v1/draft/${draftId}/picks`
        );
        const draftPicks = picksResponse.data;

        // Group picks by draft slot and round
        const groupedPicks = draftPicks.reduce((acc, pick) => {
          if (!acc[pick.round]) {
            acc[pick.round] = [];
          }
          acc[pick.round].push(pick);
          return acc;
        }, {});

        // Flatten the grouped picks and reset pick numbers within each round
        const flattenedPicks = Object.values(groupedPicks).flatMap(
          (roundPicks) => {
            return roundPicks.map((pick, index) => ({
              ...pick,
              pick_no: index + 1,
            }));
          }
        );

        setPicks(flattenedPicks);
      } catch (err) {
        console.error("Error fetching draft details:", err);
        setError("Failed to fetch draft details");
      } finally {
        setLoading(false);
      }
    };

    fetchDraftDetails();
  }, [draftId]);

  if (loading) return <p>Loading draft picks...</p>;
  if (error) return <p>{error}</p>;

  // Create a mapping of draft slot to picks
  const slotToPicks = draftOrder.reduce((acc, [userId, slot]) => {
    acc[slot] = picks.filter((pick) => pick.draft_slot === slot);
    return acc;
  }, {});

  // Find the maximum number of picks for a user to determine the number of rows
  const maxRounds = Math.max(
    ...Object.values(slotToPicks).map((slotPicks) => slotPicks.length),
    1
  );

  const getPositionColorClass = (position) => {
    switch (position) {
      case "RB":
        return "bg-[#2b9348]";
      case "WR":
        return "bg-[#118ab2]";
      case "TE":
        return "bg-[#B16E10]";
      case "QB":
        return "bg-[#A50F1C]";
      default:
        return "";
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="lg:table-fixed table-auto w-full table">
          <thead className="w-48 text-center">
            <tr>
              {draftOrder.map(([userId, slot]) => (
                <th key={userId} className="w-36">
                  {users[userId]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRounds }, (_, rowIndex) => (
              <tr key={rowIndex} className="h-36">
                {draftOrder.map(([userId, slot]) => {
                  const slotPicks = slotToPicks[slot] || [];
                  const pick = slotPicks[rowIndex];
                  const isPickedByOther = pick && pick.picked_by !== userId;
                  return (
                    <td
                      key={slot}
                      className={clsx(
                        "relative p-2  rounded-lg border border-1 border-base-100 w-40",
                        pick && getPositionColorClass(pick.metadata.position)
                      )}
                    >
                      {pick ? (
                        <div className="flex flex-col h-full justify-start">
                          <div className="flex items-center absolute top-0 left-0 text-xs font-semibold pl-2 pt-2">
                            {pick.round}.{pick.pick_no}
                          </div>
                          <div className="mt-4">
                            <div className="font-bold text-sm">
                              <span className="opacity-90">
                                {pick.metadata.first_name}{" "}
                              </span>
                              {pick.metadata.last_name}
                            </div>
                            <div className="text-sm opacity-50">
                              {pick.metadata.position} - {pick.metadata.team}
                            </div>
                            {isPickedByOther ? (
                              <div className="text-xs text-base-300 opacity-70 mt-1 flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="icon icon-tabler icons-tabler-outline icon-tabler-transform"
                                >
                                  <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                  />
                                  <path d="M3 6a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                                  <path d="M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3" />
                                  <path d="M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3" />
                                  <path d="M15 18a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                                </svg>
                                <span className="pl-2 ">
                                  {" "}
                                  {users[pick.picked_by]}{" "}
                                </span>
                              </div>
                            ) : (
                              <div className=" text-base-300 opacity-0">-</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm opacity-50">No Pick</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DraftPicks;
