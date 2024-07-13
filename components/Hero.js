import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";
import { data1, football2 } from "@/assets";
import ButtonSignin from "./ButtonSignin";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          Step Up Your Game: Advanced Fantasy Metrics for the Win
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Gain Deeper Insights and Make Smarter Moves in Your Fantasy Football
          Leagues. Enhance Your Strategy with In-Depth League Analysis.
        </p>
        <Link href={"/dashboard"}>
          <button className="btn btn-primary btn-wide"> Get Started</button>
        </Link>
        <TestimonialsAvatars priority={true} />
      </div>
      <div className="lg:w-full lg:h-full">
        <Image
          src={football2}
          alt="Product Demo"
          className="w-full h-full rounded-xl hidden md:block object-cover shadow-2xl"
          priority={true}
          layout="responsive"
          width={400}
          height={400}
        />
      </div>
    </section>
  );
};

export default Hero;
