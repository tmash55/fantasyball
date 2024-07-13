import Image from "next/image";
import config from "@/config";
import { football } from "@/assets";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="relative hero overflow-hidden min-h-screen">
      <Image
        src={football}
        alt="Background"
        className="object-cover w-full"
        fill
      />

      <div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
            Transform Your Fantasy Game Today
          </h2>
          <p className="text-lg opacity-80 mb-12 md:mb-16">
            Join now and transform your strategy with our advanced metrics and
            insights.
          </p>

          <Link href={"/dashboard"}>
            <button className="btn btn-primary btn-wide">
              {" "}
              Get {config.appName}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
