import Header from "@/components/Header";
import SleeperInput from "@/components/SleeperInput";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function ADP() {
  return (
    <main className="min-h-screen pb-24">
      <Header />
      <section className="max-w-xl mx-auto space-y-8">
        <div className="m-8 flex "> </div>
        <h1>ADP Coming soon!</h1>
      </section>
    </main>
  );
}
