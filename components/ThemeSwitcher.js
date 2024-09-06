"use client";
import React, { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "light"
      : "light"
  );

  // Change theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dim" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Set theme on initial load
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? (
        // Moon icon for dark mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-800 dark:text-gray-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m8.66-9H21m-16 0H3m1.54 6.93l.71-.71M4.21 5.64l.71-.71M17.66 17.66l.71-.71M17.66 6.34l.71.71M12 5a7 7 0 100 14 7 7 0 000-14z"
          />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m8.66-9H21m-16 0H3m1.54 6.93l.71-.71M4.21 5.64l.71-.71M17.66 17.66l.71-.71M17.66 6.34l.71.71M12 5a7 7 0 100 14 7 7 0 000-14z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeSwitcher;
