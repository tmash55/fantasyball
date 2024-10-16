import AdpTool from "@/components/AdpTool";
import AdpToolWithPopup from "@/components/AdpToolWithPopup";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SleeperInput from "@/components/SleeperInput";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function ADP() {
  return (
    <>
      {" "}
      <main className="min-h-screen pb-24 relative">
        <Header />
        <section
          id="league"
          className="max-w-full mx-auto p-8 md:px-12 xl:px-16 w-full my-6 flex flex-col gap-4 md:gap-6"
        >
          <div className="pt-16">
            <h1 className="text-5xl font-bold mb-20 text-center">
              Redraft{" "}
              <span className="text-orange-400 font-extrabold">
                Average Draft Position (ADP)
              </span>{" "}
              Value Tool
            </h1>
          </div>

          <div className="pb-6 relative z-10">
            <AdpToolWithPopup />
          </div>
          <AdpTool />
        </section>
      </main>
      <Footer />
    </>
  );
}
