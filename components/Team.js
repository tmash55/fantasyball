import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Team = ({ roster, players, rosterPositions, isOpen }) => {
  const [playerAdps, setPlayerAdps] = useState({});

  useEffect(() => {
    const fetchPlayerAdps = async () => {
      try {
        const adpMap = {};

        for (let starterId of roster.starters) {
          const player = players[starterId];

          if (player) {
            const [firstName, lastName] = player.full_name.split(" ");
            console.log("Fetching ADP and Value for:", firstName, lastName);

            const { data: adpData, error: adpError } = await supabase
              .from("UD_ADP_JULY12")
              .select("adp, positionRank")
              .eq("firstName", firstName)
              .ilike("lastName", `%${lastName}%`)
              .single();

            const { data: valueData, error: valueError } = await supabase
              .from("fantasyCalc_2024_July")
              .select("value, positionRank")
              .eq("first_name", firstName)
              .ilike("last_name", `%${lastName}%`)
              .single();

            if (adpError || valueError) {
              console.error(
                `Error fetching data for ${firstName} ${lastName}:`,
                adpError || valueError
              );
              adpMap[starterId] = {
                adp: "Unknown ADP",
                adpPositionRank: "Unknown Rank",
                value: "Unknown Value",
                valuePositionRank: "Unknown Rank",
              };
            } else {
              console.log(
                `Fetched data for ${firstName} ${lastName}:`,
                adpData,
                valueData
              );
              adpMap[starterId] = {
                adp: adpData.adp,
                adpPositionRank: adpData.positionRank,
                value: valueData.value,
                valuePositionRank: valueData.positionRank,
              };
            }
          } else {
            console.log(`Player with ID ${starterId} not found`);
            adpMap[starterId] = {
              adp: "Unknown ADP",
              adpPositionRank: "Unknown Rank",
              value: "Unknown Value",
              valuePositionRank: "Unknown Rank",
            };
          }
        }

        setPlayerAdps(adpMap);
      } catch (error) {
        console.error("Error fetching player ADPs:", error);
      }
    };

    if (roster.starters.length > 0) {
      fetchPlayerAdps();
    }
  }, [roster.starters, players]);

  const calculateTotalAdp = () => {
    return Object.values(playerAdps).reduce((total, playerData) => {
      const adp = parseFloat(playerData.adp);
      return total + (isNaN(adp) ? 0 : adp);
    }, 0);
  };

  const totalAdp = calculateTotalAdp();

  return (
    <div className="flex relative bg-no-repeat bg-[length:100%_100%] md:max-w-[24rem] rounded-2xl border w-[500px] ">
      <div className="card">
        <div className="card-body p-2">
          <h2 className="text-2xl font-bold mb-2 m-6 flex justify-center text-[#f8edeb] uppercase ">
            {roster.owner}
          </h2>
          <div className="grid grid-cols-5 gap-2 mt-4 text-[#f8edeb]/2">
            <div className="font-bold pb-2 col-span-2">
              <h2>Starters</h2>
            </div>
            <div className="font-bold flex justify-center">
              <h2>UD ADP</h2>
            </div>
            <div className="font-bold flex justify-center">
              <h2>Redraft Rank</h2>
            </div>
            <div className="font-bold flex justify-center">
              <h2>Dynasty Rank</h2>
            </div>
          </div>
          {isOpen && (
            <div>
              {roster.starters.map((starterId, idx) => {
                const player = players[starterId];
                const position = rosterPositions[idx];
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
                    className="grid grid-cols-5 gap-2 border-t py-1 text-sm h-16"
                  >
                    <div className="text-[#118ab2] font-bold items-center justify-start flex col-span-2">
                      {player
                        ? `${position} - ${player.full_name} `
                        : `Unknown Player (${starterId}) - ${position}`}
                    </div>
                    <div className="items-center justify-center flex">
                      <p className="text-[#2b9348]">{adp}</p>
                    </div>
                    <div className="text-[#55a630] items-center justify-center flex">
                      {adpPositionRank}
                    </div>
                    <div className="items-center justify-center flex">
                      <p className="text-[#ff9f1c]">
                        {player
                          ? valuePositionRank !== "Unknown Rank"
                            ? `${player.position}${valuePositionRank}`
                            : "Missing"
                          : "Missing"}
                      </p>
                    </div>
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
              {totalAdp.toFixed(2)}
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
