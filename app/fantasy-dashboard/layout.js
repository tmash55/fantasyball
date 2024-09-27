"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Settings,
  Menu,
  ChevronLeft,
  GitCompare,
  Trophy,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import dynamic from "next/dynamic";

const SleeperInput2 = dynamic(
  () => import("@/components/fantasy-dashboard/SleeperInput2"),
  {
    loading: () => <p>Loading...</p>,
  }
);

const NavItem = React.memo(function NavItem({
  href,
  icon,
  text,
  isOpen,
  onClick,
}) {
  return (
    <Link
      scroll={true}
      href={href}
      className={`flex items-center py-3 px-4 text-gray-300 hover:bg-[#2c2c2c] hover:text-white transition-colors duration-200 ${
        isOpen ? "justify-start" : "justify-center"
      }`}
      onClick={(e) => {
        if (window.innerWidth < 1024) {
          onClick();
        }
      }}
    >
      <span className="inline-flex">{icon}</span>
      {isOpen && (
        <span className="ml-3 transition-opacity duration-200">{text}</span>
      )}
    </Link>
  );
});

function DashboardLayoutContent({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const usernameParam = searchParams.get("username");
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const navItems = useMemo(
    () => [
      {
        href: `/fantasy-dashboard?username=${username}`,
        icon: <Home className="h-5 w-5" />,
        text: "Dashboard",
      },
      {
        href: `/fantasy-dashboard/leagues?username=${username}`,
        icon: <Users className="h-5 w-5" />,
        text: "My Leagues",
      },
      {
        href: `/fantasy-dashboard/projections?username=${username}`,
        icon: <LineChart className="h-5 w-5" />,
        text: "Weekly Projections",
      },
      {
        href: `/fantasy-dashboard/leaderboard?username=${username}`,
        icon: <Trophy className="h-5 w-5" />,
        text: "Season Leaderboards",
      },
      {
        href: `/fantasy-dashboard/player-comparison?username=${username}`,
        icon: <GitCompare className="h-5 w-5" />,
        text: "Player Comparison",
      },
      {
        href: `/fantasy-dashboard/settings?username=${username}`,
        icon: <Settings className="h-5 w-5" />,
        text: "Settings",
      },
    ],
    [username]
  );

  if (!username) {
    return <SleeperInput2 />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`fixed inset-y-0 left-0 z-50 bg-gray-800 text-white overflow-y-auto transition-[width] duration-300 ease-in-out lg:relative ${
            isSidebarOpen ? "w-64" : "w-0 lg:w-16"
          }`}
        >
          <div className="p-4 flex justify-between items-center">
            <h2
              className={`text-xl font-semibold transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Fantasy
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white hover:bg-[#2c2c2c]"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
          <nav className="mt-8">
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                href={item.href}
                icon={item.icon}
                text={item.text}
                isOpen={isSidebarOpen}
                onClick={toggleSidebar}
              />
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto bg-base-100">
          <div className="p-4 lg:p-8">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="mb-4 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </React.Suspense>
  );
}
