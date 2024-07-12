import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";
import { data1, football } from "@/assets";
import ButtonSignin from "./ButtonSignin";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative hero xl:min-h-screen lg:min-h-screen md:min-h-screen  bg-base-100 ">
      <Image
        src={football}
        alt="Background"
        className="object-cover w-full hidden md:block"
        fill
      />

      <div className="relative hero-overlay  bg-base-100 bg-opacity-70"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="max-w-xl ">
          <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight mb-5">
            Unlock Your Advanced Fantasy Football Metrics
          </h1>
          <p className="text-lg opacity-80 mb-12 md:mb-16 ">
            Gain Deeper Insights and Make Smarter Moves in Your Fantasy Football
            Leagues. Enhance Your Strategy with In-Depth League Analysis.
          </p>

          <Link href={"/dashboard"}>
            <button className="btn btn-primary btn-wide"> Get Started</button>
          </Link>
          <div className="mt-8">
            <TestimonialsAvatars priority={true} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
