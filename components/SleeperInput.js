"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SleeperInput = () => {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/dashboard/leagues?username=${username}`);
  };
  return (
    <section className="bg-neutral text-neutral-content rounded-lg">
      <div className="ax-w-10xl mx-auto px-8 py-16 md:py-32 text-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-4xl md:text-5xl tracking-tight mb-6 md:mb-8">
          Enter a Sleeper Username
        </h2>
        <form onSubmit={handleSubmit} className="inline-block">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Sleeper Username"
            className="input input-bordered w-full placeholder:opacity-60 rounded"
          />
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6">
            <button
              type="submit"
              className="btn btn-outline btn-primary animate-shimmer py-2 rounded-xl text-white w-72 mt-6"
            >
              Lets Go!
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SleeperInput;
