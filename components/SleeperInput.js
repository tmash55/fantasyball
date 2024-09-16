"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Import for animations
import { MoonIcon, SunIcon } from "lucide-react"; // Importing icons

const SleeperInput = () => {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/dashboard/leagues?username=${username}`);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          {/* Spinning Icons */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="relative w-24 h-24"
            >
              <MoonIcon className="w-24 h-24 text-primary absolute" />
            </motion.div>
          </div>
          <h2 className="text-white text-4xl font-extrabold mb-6 text-center">
            Enter Your Sleeper Username
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 text-center">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Sleeper username"
              className="input input-bordered w-full placeholder:opacity-60 rounded text-primary border-2 border-primary"
            />
            <button type="submit" className="btn btn-primary w-full">
              Let's Go!
            </button>
          </form>
          <p className="mt-4 text-gray-400 text-center">
            Enter your Sleeper username to continue to your dashboard
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SleeperInput;
