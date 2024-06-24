// app/(root)/leagues/[league_id]/page.js

import Header from "@/components/Header";
import LeagueDetails from "@/components/LeagueDetails";
import MyTeam from "@/components/MyTeam";

const LeaguePage = () => {
  return (
    <div>
      <Header />
      <LeagueDetails />
    </div>
  );
};

export default LeaguePage;
