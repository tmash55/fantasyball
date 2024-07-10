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
      label: "WR Bonus Receptions",
      value: formatNumber(settings.bonus_rec_wr ?? 0),
    },
    {
      label: "RB Bonus Receptions",
      value: formatNumber(settings.bonus_rec_rb ?? 0),
    },
    {
      label: "TE Bonus Receptions",
      value: formatNumber(settings.bonus_rec_te ?? 0),
    },
  ];

  return (
    <div className="card bg-base-200 w-[30rem] shadow-xl p-4">
      <div className="card-body items-center">
        <h1 className="card-title text-2xl text-primary items-center">
          {leagueName}
        </h1>
      </div>
      <div className="card-actions"></div>
      <ul className="text-left pl-8">
        League Settings:
        {settingsToDisplay.map(
          (setting, idx) =>
            setting.value !== null && (
              <li key={idx} className="py-1 text-xs">
                {setting.label}
                {setting.noColon ? "" : ":"} {setting.value}
              </li>
            )
        )}
      </ul>
    </div>
  );
};

export default LeagueSettings;
