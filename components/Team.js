import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Team = ({ roster, players, rosterPositions }) => {
  const [playerAdps, setPlayerAdps] = useState({});

  useEffect(() => {
    const fetchPlayerAdps = async () => {
      try {
        const adpMap = {};

        for (let starterId of roster.starters) {
          const player = players[starterId];

          if (player) {
            const [firstName, lastName] = player.full_name.split(" ");
            //const slotName = player.position;
            console.log("Fetching ADP for:", firstName, lastName);

            const { data: adpData, error } = await supabase
              .from("adp_rankings_2024_June")
              .select("adp, positionRank")
              .eq("firstName", firstName)
              .ilike("lastName", `%${lastName}%`)

              .single();

            if (error) {
              console.error(
                `Error fetching ADP for ${firstName} ${lastName}:`,
                error
              );
              adpMap[starterId] = {
                adp: "Unknown ADP",
                positionRank: "Unknown Rank",
              };
            } else {
              console.log(`Fetched ADP for ${firstName} ${lastName}:`, adpData);
              adpMap[starterId] = {
                adp: adpData.adp,
                positionRank: adpData.positionRank,
              };
            }
          } else {
            console.log(`Player with ID ${starterId} not found`);
            adpMap[starterId] = {
              adp: "Unknown ADP",
              positionRank: "Unknown Rank",
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
    <div
      className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] md:max-w-[24rem] rounded-2xl border px-6
    "
    >
      <div clasName="flex flex-wrap gap-10 mb-10">
        <h2 className="text-2xl font-bold mb-2 m-8 flex justify-center text-[#f8edeb] uppercase">
          {roster.owner}
        </h2>
        <div className="grid grid-cols-4 gap-2 mt-4 text-[#f8edeb]/2 ">
          <div className="font-bold pb-2 col-span-2">
            <h2>Starters</h2>
          </div>

          <div className="font-bold flex justify-center">
            <h2>Position Rank</h2>
          </div>
          <div className="font-bold flex justify-center">
            <h2>UDP ADP</h2>
          </div>
        </div>
        {roster.starters.map((starterId, idx) => {
          const player = players[starterId];
          const position = rosterPositions[idx];
          const { adp, positionRank } = playerAdps[starterId] || {
            adp: "Unknown ADP",
            positionRank: "Unknown Rank",
          };

          return (
            <div key={idx} className="grid grid-cols-4 gap-2 border-t py-2">
              <div className="text-[#118ab2] font-bold col-span-2">
                {player
                  ? `${position} - ${player.full_name} (${player.position})`
                  : `Unknown Player (${starterId}) - ${position}`}
              </div>

              <div className="text-[#55a630] items-center justify-center flex">
                {positionRank}
              </div>
              <div className="items-center justify-center flex">
                <p className="text-[#2b9348] ">{adp}</p>
              </div>
            </div>
          );
        })}
        <div className="grid grid-cols-4 gap-2 border-t py-2 font-bold">
          <div clasName="">
            <h2>Total ADP</h2>
          </div>
          <div></div>
          <div></div>
          <div className="text-[#ffff3f] flex justify-center items-center">
            {totalAdp.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
