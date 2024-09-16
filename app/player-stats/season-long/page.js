import AdpTool from "@/components/AdpTool";
import AdpToolWithPopup from "@/components/AdpToolWithPopup";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PlayerStatsSeasonal from "@/components/playerStats/PlayerStatsSeasonal";
import PlayerStatsTable from "@/components/playerStats/PlayerStatsTable";
import PropsTool from "@/components/props/PropsTool";
import SleeperInput from "@/components/SleeperInput";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server component which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function ADP() {
  return (
    <>
      <main className="min-h-screen pb-2 relative mb-8">
        <Header />
        <section className="max-w-full mx-auto p-4 md:p-8 w-full my-6">
          <div className="">
            <PlayerStatsSeasonal />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
