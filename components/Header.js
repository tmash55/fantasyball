"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import ButtonAccount from "./ButtonAccount";
import logo from "@/app/icon.png";
import config from "@/config";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const guestLinks = [
  {
    href: "/ADP", // Keep this one for Redraft Values
    label: "Redraft Values",
  },
  {
    href: "/dashboard",
    label: "My Leagues",
  },
  {
    href: "/fantasy-tools", // Change this href to make it unique
    label: "Fantasy Tools",
  },
];

const userLinks = [
  {
    href: "/dashboard",
    label: "My Leagues",
  },
  {
    href: "/fantasy-tools", // Ensure this is unique
    label: "Fantasy Tools",
  },
];

const Header = () => {
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(undefined); // Initialize as undefined

  // Fetch user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase]);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  // Show a loading state or a placeholder until user state is determined
  if (user === undefined) {
    return (
      <header className="bg-base-200">
        <nav
          className="container flex items-center justify-between px-8 py-4 mx-auto "
          aria-label="Global"
        >
          {/* Your logo/name on large screens */}
          <div className="flex lg:flex-1">
            <Link
              className="flex items-center gap-2 shrink-0"
              href="/"
              title={`${config.appName} homepage`}
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-8"
                placeholder="blur"
                priority={true}
                width={32}
                height={32}
              />
              <span className="font-extrabold text-lg">{config.appName}</span>
            </Link>
          </div>
        </nav>
      </header>
    );
  }

  const links = user ? userLinks : guestLinks;
  const cta = user ? (
    <ButtonAccount />
  ) : (
    <ButtonSignin extraStyle="btn-primary" />
  );

  return (
    <header className="bg-base-200">
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto "
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              placeholder="blur"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-extrabold text-lg">{config.appName}</span>
          </Link>
        </div>
        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Your links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => {
            if (link.label === "Fantasy Tools") {
              return (
                <div className="dropdown" key={link.href}>
                  <label
                    tabIndex={0}
                    className="link link-hover hover:text-primary cursor-pointer"
                  >
                    Fantasy Tools
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <Link href="/ADP" title="ADP Tool">
                        Redraft Values
                      </Link>
                    </li>
                    <li>
                      <Link href="/props" title="Props Tool">
                        Player Props
                      </Link>
                    </li>
                    <li>
                      <Link href="/props/tds" title="Props Tool">
                        Week 1 TD Props
                      </Link>
                    </li>
                    <li className="disabled">
                      <Link href="#" title="Another Tool">
                        More Coming Soon!
                      </Link>
                    </li>
                    {/* Add more tools here */}
                  </ul>
                </div>
              );
            } else {
              return (
                <Link
                  href={link.href}
                  key={link.href}
                  className="link link-hover hover:text-primary"
                  title={link.label}
                >
                  {link.label}
                </Link>
              );
            }
          })}
        </div>

        {/* CTA on large screens */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1">{cta}</div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* Your logo/name on small screens */}
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-2 shrink-0"
              title={`${config.appName} homepage`}
              href="/"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-8"
                placeholder="blur"
                priority={true}
                width={32}
                height={32}
              />
              <span className="font-extrabold text-lg">{config.appName}</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Your links on small screens */}
          <div className="flow-root mt-6">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
                {links.map((link) => {
                  if (link.label === "Fantasy Tools") {
                    return (
                      <details key={link.href} className="w-full">
                        <summary className="link link-hover hover:text-primary cursor-pointer">
                          Fantasy Tools
                        </summary>
                        <ul className="ml-4 pl-4 border-l border-neutral-200">
                          <li>
                            <Link href="/ADP" title="ADP Tool">
                              Redraft Values
                            </Link>
                          </li>
                          <li>
                            <Link href="/props" title="Props Tool">
                              Player Props
                            </Link>
                          </li>
                          <li>
                            <Link href="/props/tds" title="Props Tool">
                              Week 1 TD Props
                            </Link>
                          </li>
                          <li className="disabled">
                            <Link href="#" title="Another Tool">
                              More Coming Soon!
                            </Link>
                          </li>
                        </ul>
                      </details>
                    );
                  } else {
                    return (
                      <Link
                        href={link.href}
                        key={link.href}
                        className="link link-hover"
                        title={link.label}
                      >
                        {link.label}
                      </Link>
                    );
                  }
                })}
              </div>
            </div>
            <div className="divider"></div>
            {/* Your CTA on small screens */}
            <div className="flex flex-col z-0">{cta}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
