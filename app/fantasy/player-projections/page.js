import React, { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WeeklyFantasyProjections from "@/components/playerProjections/WeeklyFantasyProjections";
import { Info } from "lucide-react"; // Assuming you're using lucide-react for icons
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server component which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default function PlayerProjections() {
  return (
    <>
      <main className="min-h-screen pb-24 relative">
        <Header />
        <section
          id="league"
          className="max-w-full mx-auto px-1 sm:px-8 md:px-12 xl:px-16 w-full my-6 flex flex-col gap-4 md:gap-6"
        >
          <div>
            <h2 className="text-4xl font-bold mb-2">
              Weekly Fantasy Projections
            </h2>
            <p className="text-gray-400 mb-4">
              Explore comprehensive NFL player projections for each week. Use
              the filters and sorting options to customize your view and gain
              valuable insights for your fantasy team.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <Info className="mr-2 h-4 w-4" />
              <span>
                Pro Tip: Click on a player to see detailed projections.
              </span>
            </div>
          </div>
          <Suspense fallback={<div>Loading projections...</div>}>
            <WeeklyFantasyProjections />
          </Suspense>
          <div className="pb-6 relative z-10"></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
