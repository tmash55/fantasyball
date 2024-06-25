import React from "react";

const LeagueSettings = ({ leagueName, settings }) => {
  const settingsToDisplay = [
    { label: "PPR", value: settings.rec ?? 0 },
    { label: "WR Bonus Receptions", value: settings.bonus_rec_wr ?? 0 },
    { label: "RB Bonus Receptions", value: settings.bonus_rec_rb ?? 0 },
    { label: "TE Bonus Receptions", value: settings.bonus_rec_te ?? 0 },
    { label: "Bestball", value: settings.best_ball === 1 ? "Yes" : "No" },
  ];

  return (
    <div className="border p-4 rounded-lg shadow-lg mb-4">
      <h1 className="text-2xl font-bold mb-4">{leagueName}</h1>
      <ul>
        {settingsToDisplay.map(
          (setting, idx) =>
            setting.value !== null && (
              <li key={idx} className="py-2">
                <strong>{setting.label}:</strong> {setting.value}
              </li>
            )
        )}
      </ul>
    </div>
  );
};

export default LeagueSettings;
