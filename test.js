<div className="card bg-base-200 w-[30rem] shadow-xl p-4">
  <div className="card-body items-center"></div>
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
</div>;
