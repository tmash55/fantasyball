import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Hero2 from "@/components/Hero2";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FeatureSection from "@/components/FeatureSection";
import FantasyFootballHero from "@/components/shadcn/FantasyFootballHero";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />

        <FeaturesAccordion />

        <CTA />
      </main>
      <Footer />
    </>
  );
}
