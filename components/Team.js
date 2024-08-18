import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PlayerCard from "./PlayerCard"; // Import the PlayerCard component

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const stripSuffix = (name) => {
  return name.replace(/( Jr\.| Sr\.)$/, "");
};

const Team = ({
  teamId,
  roster,
  players,
  rosterPositions,
  isOpen,
  onValueCalculated,
  onADPCalculated, // Callback for ADP
}) => {
  const [playerAdps, setPlayerAdps] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [averageAge, setAverageAge] = useState(null); // State for average age
  const [totalValue, setTotalValue] = useState(0); // State for total dynasty value
  const [totalAdp, setTotalAdp] = useState(0); // State for total ADP

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const adpMap = {};
        let totalAge = 0;
        let starterCount = 0;
        let totalValueSum = 0; // Initialize total dynasty value sum
        let totalAdpSum = 0; // Initialize total ADP sum

        for (let starterId of roster.starters) {
          const player = players[starterId];

          if (player) {
            const [firstName, lastName] = player.full_name.split(" ");
            const strippedLastName = stripSuffix(lastName);

            const { data: adpData, error: adpError } = await supabase
              .from("Underdog_Redraft_ADP_2023")
              .select("adp, positionRank")
              .eq("firstName", firstName)
              .ilike("lastName", `%${lastName}%`)
              .single();

            const { data: valueData, error: valueError } = await supabase
              .from("ktc_test")
              .select("sf_value, age, sf_position_rank")
              .ilike("first_name", firstName)
              .ilike("last_name", `%${strippedLastName}%`)
              .order("date", { ascending: false })
              .single()
              .limit(1);

            if (!adpError && adpData && !isNaN(adpData.adp)) {
              totalAdpSum += parseFloat(adpData.adp);
            }

            if (!valueError && valueData && !isNaN(valueData.sf_value)) {
              totalValueSum += valueData.sf_value;
            }

            adpMap[starterId] = {
              adp: adpData ? adpData.adp : "Unknown ADP",
              adpPositionRank: adpData ? adpData.positionRank : "Unknown Rank",
              value: valueData ? valueData.sf_value : "Unknown Value",
              valuePositionRank: valueData
                ? valueData.sf_position_rank
                : "Unknown Rank",
            };

            if (valueData && valueData.age) {
              totalAge += valueData.age;
              starterCount++;
            }
          } else {
            adpMap[starterId] = {
              adp: "Unknown ADP",
              adpPositionRank: "Unknown Rank",
              value: "Unknown Value",
              valuePositionRank: "Unknown Rank",
            };
          }
        }

        setPlayerAdps(adpMap);
        setTotalValue(totalValueSum); // Set the total dynasty value state

        // Round totalAdpSum to 1 decimal place
        const roundedAdpSum = parseFloat(totalAdpSum.toFixed(1));
        setTotalAdp(roundedAdpSum); // Set the total ADP state

        if (starterCount > 0) {
          setAverageAge((totalAge / starterCount).toFixed(2));
        } else {
          setAverageAge(null);
        }

        // Call the callbacks with the calculated totals
        onValueCalculated(roster.owner, totalValueSum); // Dynasty value callback
        onADPCalculated(roster.owner, roundedAdpSum); // ADP callback
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    if (roster.starters.length > 0 && players) {
      fetchPlayerData();
    }
  }, [
    roster.starters,
    players,
    onValueCalculated,
    onADPCalculated,
    roster.owner,
  ]);

  const handlePlayerClick = (player, dialogId) => {
    if (player) {
      setSelectedPlayer({
        first_name: player.first_name,
        last_name: player.last_name,
        position: player.position,
        team: player.team,
      });
      document.getElementById(dialogId).showModal();
    }
  };

  return (
    <div className="flex relative bg-no-repeat bg-[length:100%_100%] md:max-w-[28rem] rounded-2xl border w-[500px] ">
      <div className="card">
        <div className="card-body p-2">
          <h2 className="text-2xl font-bold mb-2 m-6 flex justify-center text-[#f8edeb] uppercase ">
            {roster.owner}
          </h2>
          {averageAge !== null && (
            <p className="text-left text-sm text-[#f8edeb]">
              Average Age: {averageAge}
            </p>
          )}
          <div className="grid grid-cols-6 gap-2 mt-4 text-[#f8edeb]/2 ">
            <div className="font-bold pb-2 col-span-2">
              <h2>Starters</h2>
            </div>
            <div className="font-bold flex justify-center ">
              <h2>UD ADP</h2>
            </div>
            <div className="font-bold flex justify-center ">
              <h2>Redraft Rank</h2>
            </div>
            <div className="font-bold flex justify-center">
              <h2>Dynasty Rank</h2>
            </div>
            <div className="font-bold flex justify-center">
              <h2>Dynasty Value</h2>
            </div>
          </div>
          {isOpen && (
            <div>
              {roster.starters.map((starterId, idx) => {
                const player = players[starterId];
                const position = rosterPositions[idx];
                const dialogId = `player_modal_${teamId}_${starterId}`; // Unique ID for each player modal
                const { adp, adpPositionRank, value, valuePositionRank } =
                  playerAdps[starterId] || {
                    adp: "Unknown ADP",
                    adpPositionRank: "Unknown Rank",
                    value: "Unknown Value",
                    valuePositionRank: "Unknown Rank",
                  };

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-6 gap-2 border-t py-1 text-sm h-16 hover:bg-base-300 cursor-pointer"
                    onClick={() => handlePlayerClick(player, dialogId)}
                  >
                    <div className="text-[#118ab2] font-bold items-center justify-start flex col-span-2 ">
                      {player
                        ? `${position} - ${player.full_name}`
                        : `Unknown Player (${starterId}) - ${position}`}
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-[#2b9348] text-center">{adp}</p>
                    </div>
                    <div className="text-[#55a630] items-center justify-center flex">
                      {adpPositionRank}
                    </div>
                    <div className="items-center justify-center flex">
                      <p className="text-[#ff9f1c] text-center">
                        {player
                          ? valuePositionRank !== "Unknown Rank"
                            ? `${valuePositionRank}`
                            : "Missing"
                          : "Missing"}
                      </p>
                    </div>
                    <div className="items-center justify-center flex">
                      <p className="text-[#ff9f1c] text-center">
                        {player
                          ? value !== "Unknown Rank"
                            ? `${value}`
                            : "Missing"
                          : "Missing"}
                      </p>
                    </div>

                    <dialog id={dialogId} className="modal">
                      <div className="modal-box">
                        <h3 className="font-bold text-lg">Player Details</h3>
                        {selectedPlayer && (
                          <PlayerCard player={selectedPlayer} />
                        )}
                        <div className="modal-action">
                          <form method="dialog">
                            <button className="btn">Close</button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </div>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-5 gap-2 border-t py-2 font-bold text-sm">
            <div className="flex items-center space-x-1">
              <h2>Total ADP:</h2>
            </div>
            <div className="text-[#ffff3f] flex justify-start items-center font-bold">
              {totalAdp.toFixed(1)}
            </div>

            <div></div>

            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
