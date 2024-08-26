"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "./ui/hero-highlight";

const Hero = () => {
  return (
    <section className=" hero xl:min-h-screen lg:min-h-screen md:min-h-screen bg-base-200">
      <HeroHighlight containerClassName="overflow-hidden">
        <motion.h1
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: [20, -5, 0],
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white dark:text-white max-w-3xl lg:max-w-5xl leading-relaxed lg:leading-snug text-center mx-auto px-6"
        >
          Step Up Your Game: Advanced Fantasy{" "}
          <Highlight className="text-white dark:text-white">
            Metrics for the Win
          </Highlight>
        </motion.h1>
      </HeroHighlight>
    </section>
  );
};

export default Hero;
