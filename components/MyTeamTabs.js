import React from "react";
import MyTeam from "./MyTeam";
import DraftsAndPicks from "./DraftsAndPicks";

const MyTeamTabs = () => {
  return (
    <div role="tablist" className="tabs tabs-boxed tabs-lg">
      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        className="tab "
        aria-label="Roster"
      />
      <div role="tabpanel" className="tab-content bg-base-100  rounded-box p-6">
        <MyTeam />
      </div>

      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        className="tab"
        aria-label="Trades"
        defaultChecked
      />
      <div role="tabpanel" className="tab-content bg-base-100rounded-box p-6">
        Trades
      </div>

      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        className="tab"
        aria-label="Drafts"
      />
      <div role="tabpanel" className="tab-content bg-base-100  rounded-box p-6">
        <DraftsAndPicks />
      </div>
    </div>
  );
};

export default MyTeamTabs;
