import React from "react";
import MyTeam from "./MyTeam";
import DraftsAndPicks from "./DraftsAndPicks";
import LeagueSettings from "./LeagueSettings";

const MyTeamTabs = () => {
  return (
    <div
      role="tablist"
      className="tabs tabs-boxed tabs-lg rounded-none border-t border-base-100"
    >
      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        className="tab "
        aria-label="Trades"
      />
      <div role="tabpanel" className="tab-content bg-base-100  rounded-box p-6">
        Trades Coming soon!
      </div>

      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        className="tab"
        aria-label="Roster"
        defaultChecked
      />
      <div role="tabpanel" className="tab-content bg-base-100 rounded-box p-6">
        <MyTeam />
      </div>

      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        className="tab"
        aria-label="Drafts"
      />
      <div role="tabpanel" className="tab-content bg-base-100  rounded-box p-6">
        Draft History with values coming soon!
      </div>
      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        className="tab "
        aria-label="Settings"
      />
      <div
        role="tabpanel"
        className="tab-content bg-base-100  rounded-box p-6"
      ></div>
    </div>
  );
};

export default MyTeamTabs;
