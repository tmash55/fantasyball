import React from "react";

const LeagueSettings = ({
  leagueName,
  settings,
  activeRosterCount,
  rosterPositions,
}) => {
  const formatNumber = (num) => {
    if (typeof num === "number") {
      return num.toFixed(1); // Always show one decimal place
    }
    return num;
  };

  const hasSuperFlex = rosterPositions.includes("SFLX");

  const settingsToDisplay = [
    { label: "Start", value: activeRosterCount, noColon: true },
    {
      label: "Super Flex",
      value: hasSuperFlex ? "" : "Standard",
      noColon: true,
    },
    { label: "Bestball", value: settings.best_ball === 1 ? "Yes" : "No" },
    { label: "Pass TD", value: formatNumber(settings.pass_td ?? 0) },
    { label: "PPR", value: formatNumber(settings.rec ?? 0) },
    {
      label: "WR Rec Bonus",
      value: formatNumber(settings.bonus_rec_wr ?? 0),
    },
    {
      label: "RB Rec Bonus",
      value: formatNumber(settings.bonus_rec_rb ?? 0),
    },
    {
      label: "TE Rec Bonus",
      value: formatNumber(settings.bonus_rec_te ?? 0),
    },
  ];

  return (
    <div className="flex flex-col ">
      <div className="stats Shadow  text-center items-center bg-base-200 rounded-none  hidden lg-[1122px]:flex">
        {settingsToDisplay.map(
          (setting, idx) =>
            setting.value !== null && (
              <div className="stat" key={idx}>
                <div className="stat-description ">
                  <div className="stat-value text-xs ">
                    {setting.label}
                    {setting.noColon ? "" : ":"} {setting.value}
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default LeagueSettings;
