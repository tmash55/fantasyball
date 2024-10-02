"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Menu, X, ChevronDown } from "lucide-react";
import ButtonSignin from "./ButtonSignin";
import ButtonAccount from "./ButtonAccount";
import ThemeSwitcher from "./ThemeSwitcher";
import logo from "@/app/icon.png";
import config from "@/config";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const navItems = [
  {
    name: "Player Stats",
    items: [
      { name: "Weekly Stats", href: "/player-stats/weekly" },
      { name: "Season Long Stats", href: "/player-stats/season-long" },
    ],
  },
  {
    name: "Betting",
    items: [
      //{ name: "Player Props", href: "/props" },
      { name: "Weekly TD Props", href: "/props/tds" },
      { name: "More Coming Soon!", href: "#", disabled: true },
    ],
  },
  {
    name: "Fantasy",
    items: [
      { name: "Redraft Values", href: "/ADP" },
      { name: "My Leagues", href: "/dashboard" },
      { name: "Fantasy Projections", href: "/fantasy/player-projections" },
      { name: "More Coming Soon!", href: "#", disabled: true },
    ],
  },
];

const DropdownMenu = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
        {item.name}
        <ChevronDown size={16} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
          >
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              {item.items.map((subItem) => (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white ${
                    subItem.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  role="menuitem"
                  onClick={(e) => subItem.disabled && e.preventDefault()}
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header = () => {
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg-gray-900 ">
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2"
              title={`${config.appName} homepage`}
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                width={32}
                height={32}
                className="w-8 h-8"
                priority
              />
              <span className="font-extrabold text-lg text-gray-300">
                {config.appName}
              </span>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <DropdownMenu key={item.name} item={item} />
            ))}
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <ButtonAccount />
            ) : (
              <ButtonSignin extraStyle="btn-primary" />
            )}
          </div>
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <div key={item.name} className="space-y-1">
                  <button
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out"
                    onClick={() => setIsOpen((prev) => !prev)}
                  >
                    {item.name}
                  </button>
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out ${
                        subItem.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={(e) => {
                        if (subItem.disabled) e.preventDefault();
                        setIsOpen(false);
                      }}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5 space-x-4">
                {user ? (
                  <ButtonAccount />
                ) : (
                  <ButtonSignin extraStyle="btn-primary" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
