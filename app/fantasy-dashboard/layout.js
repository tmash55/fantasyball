"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BarChart2,
  Users,
  Settings,
  Menu,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SleeperInput2 from "@/components/fantasy-dashboard/SleeperInput2";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [username, setUsername] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const usernameParam = searchParams.get("username");
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, [searchParams]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!username) {
    return <SleeperInput2 />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`bg-gray-800 text-white overflow-y-auto transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-64" : "w-16"
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
                <ChevronRight className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
          <nav className="mt-8">
            <NavItem
              href={`/fantasy-dashboard?username=${username}`}
              icon={<Home className="h-5 w-5" />}
              text="Dashboard"
              isOpen={isSidebarOpen}
            />
            <NavItem
              href={`/fantasy-dashboard/projections?username=${username}`}
              icon={<BarChart2 className="h-5 w-5" />}
              text="Projections"
              isOpen={isSidebarOpen}
            />
            <NavItem
              href={`/fantasy-dashboard/leagues?username=${username}`}
              icon={<Users className="h-5 w-5" />}
              text="My Leagues"
              isOpen={isSidebarOpen}
            />
            <NavItem
              href={`/fantasy-dashboard/settings?username=${username}`}
              icon={<Settings className="h-5 w-5" />}
              text="Settings"
              isOpen={isSidebarOpen}
            />
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto bg-base-100">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, text, isOpen }) {
  return (
    <Link
      href={href}
      className={`flex items-center py-3 px-4 text-gray-300 hover:bg-[#2c2c2c] hover:text-white transition-colors duration-200 ${
        isOpen ? "justify-start" : "justify-center"
      }`}
    >
      <span className="inline-flex">{icon}</span>
      {isOpen && (
        <span className="ml-3 transition-opacity duration-200">{text}</span>
      )}
    </Link>
  );
}
