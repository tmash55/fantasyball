import Header from "@/components/Header";
import SleeperInput from "@/components/SleeperInput";
import PlayerExposure from "@/components/PlayerExposure";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Exposure() {
  return (
    <>
      <main className="min-h-screen pb-24">
        <Header />
        <section
          id="exposure"
          className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full my-8 flex flex-col gap-2 md:gap-6"
        >
          <PlayerExposure />
        </section>
      </main>
    </>
  );
}
