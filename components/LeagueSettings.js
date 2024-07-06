const LeagueSettings = ({ leagueName, settings }) => {
  const formatNumber = (num) => {
    if (typeof num === "number") {
      return num.toFixed(1); // Always show one decimal place
    }
    return num;
  };

  const settingsToDisplay = [
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
    { label: "Bestball", value: settings.best_ball === 1 ? "Yes" : "No" },
  ];

  return (
    <div className="card bg-base-200 w-108 shadow-xl p-4">
      <div className="card-body">
        <h1 className="card-title text-2xl text-primary">{leagueName}</h1>
        <ul className="text-left pt-6">
          League Settings:
          {settingsToDisplay.map(
            (setting, idx) =>
              setting.value !== null && (
                <li key={idx} className="py-1 text-sm">
                  <strong>{setting.label}:</strong> {setting.value}
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
};

export default LeagueSettings;
