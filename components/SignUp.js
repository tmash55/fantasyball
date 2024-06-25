"use client";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

import { useRouter } from "next/navigation";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (user) {
      const { data, error } = await supabase
        .from("users")
        .insert([
          { id: user.id, username, first_name: firstName, last_name: lastName },
        ]);
      if (!error) {
        router.push("/dashboard");
      } else {
        console.error("Error inserting user data:", error.message);
      }
    }

    if (error) {
      console.error("Error signing up:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border border-gray-300 rounded mt-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border border-gray-300 rounded mt-2"
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 border border-gray-300 rounded mt-2"
      />
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="p-2 border border-gray-300 rounded mt-2"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="p-2 border border-gray-300 rounded mt-2"
      />
      <button
        onClick={handleSignUp}
        className="p-2 bg-blue-500 text-white rounded mt-4"
      >
        Sign Up
      </button>
    </div>
  );
};

export default SignUp;
