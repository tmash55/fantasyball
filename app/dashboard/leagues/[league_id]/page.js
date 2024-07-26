// app/(root)/leagues/[league_id]/page.js

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeagueDetails from "@/components/LeagueDetails";
import MyTeam from "@/components/MyTeam";

const LeaguePage = () => {
  return (
    <>
      <main>
        <div>
          <Header />
          <LeagueDetails />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LeaguePage;
