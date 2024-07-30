import React, { useState, useEffect } from "react";
import axios from "axios";
import clsx from "clsx"; // To easily manage conditional class names
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DraftPicks = ({ draftId, leagueId }) => {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [draftOrder, setDraftOrder] = useState([]);
  const [historicalData, setHistoricalData] = useState({});
  const [draftDayData, setDraftDayData] = useState({});
  const [startTime, setStartTime] = useState(null);

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
        setStartTime(draftData.start_time); // Set the start time

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

  useEffect(() => {
    if (!startTime) return;

    const fetchHistoricalData = async () => {
      const formattedDraftDate = new Date(startTime)
        .toISOString()
        .split("T")[0];

      // Query to get the most recent historical data for each player
      const { data: recentData, error: recentError } = await supabase
        .from("Dynasty-historical-data")
        .select("first_name, last_name, value, date")
        .order("date", { ascending: false });

      if (recentError) {
        console.error("Error fetching recent historical data:", recentError);
      } else {
        console.log("Fetched recent historical data:", recentData); // Debug: log the fetched recent historical data

        // Process to get the most recent record for each player
        const recentHistoricalData = recentData.reduce((acc, record) => {
          if (record.first_name && record.last_name) {
            const key = `${record.first_name.toLowerCase()} ${record.last_name.toLowerCase()}`;
            if (!acc[key]) {
              acc[key] = record;
            }
          }
          return acc;
        }, {});

        console.log("Processed recent historical data:", recentHistoricalData); // Debug: log the processed recent historical data
        setHistoricalData(recentHistoricalData);
      }

      // Query to get the historical data for the draft day date
      const { data: draftDayData, error: draftDayError } = await supabase
        .from("Dynasty-historical-data")
        .select("first_name, last_name, value, date")
        .eq("date", formattedDraftDate);

      if (draftDayError) {
        console.error("Error fetching draft day data:", draftDayError);
      } else {
        console.log("Fetched draft day data:", draftDayData); // Debug: log the fetched draft day data

        const draftDayHistoricalData = draftDayData.reduce((acc, record) => {
          if (record.first_name && record.last_name) {
            const key = `${record.first_name.toLowerCase()} ${record.last_name.toLowerCase()}`;
            acc[key] = record;
          }
          return acc;
        }, {});

        console.log("Processed draft day data:", draftDayHistoricalData); // Debug: log the processed draft day data
        setDraftDayData(draftDayHistoricalData);
      }
    };

    fetchHistoricalData();
  }, [startTime]);

  const findHistoricalData = (firstName, lastName, data) => {
    const key = `${firstName.toLowerCase()} ${lastName.toLowerCase()}`;
    console.log("Generated key:", key); // Debug: log the generated key
    const historicalInfo = data[key];
    console.log(
      `Finding historical data for ${firstName} ${lastName}:`,
      historicalInfo
    ); // Debug: log the matching result
    return historicalInfo;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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

  const getArrowIcon = (currentValue, draftDayValue) => {
    if (currentValue > draftDayValue) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 5l0 14" />
          <path d="M18 11l-6 -6" />
          <path d="M6 11l6 -6" />
        </svg>
      );
    } else if (currentValue < draftDayValue) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-down"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 5l0 14" />
          <path d="M18 13l-6 6" />
          <path d="M6 13l6 6" />
        </svg>
      );
    } else {
      return null;
    }
  };

  return (
    <div>
      {startTime && (
        <div className="mb-4 text-center">
          <strong>Draft Start Date:</strong> {formatDate(startTime)}
        </div>
      )}
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
                  const historicalInfo = pick
                    ? findHistoricalData(
                        pick.metadata.first_name,
                        pick.metadata.last_name,
                        historicalData
                      )
                    : null;
                  const draftDayValue = pick
                    ? findHistoricalData(
                        pick.metadata.first_name,
                        pick.metadata.last_name,
                        draftDayData
                      )
                    : null;

                  const currentValue = historicalInfo
                    ? historicalInfo.value
                    : null;
                  const draftDayVal = draftDayValue
                    ? draftDayValue.value
                    : null;

                  return (
                    <td
                      key={slot}
                      className={clsx(
                        "relative p-2 rounded-lg border border-1 border-base-100 w-40",
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
                            <div className="flex items-center">
                              <div className="flex flex-col">
                                {draftDayValue && (
                                  <div className="text-xs mt-2 flex items-center">
                                    Draft Day Value: {draftDayValue.value}
                                    <div className="ml-2">
                                      {getArrowIcon(currentValue, draftDayVal)}
                                    </div>
                                  </div>
                                )}
                                {historicalInfo && (
                                  <div className="text-xs mt-2">
                                    Current Value: {historicalInfo.value}
                                  </div>
                                )}
                              </div>
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
