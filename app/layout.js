import { Plus_Jakarta_Sans } from "next/font/google";
import PlausibleProvider from "next-plausible";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/components/Google/GoogleAnalytics";
import { Toaster } from "@/components/ui/toaster";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const viewport = {
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

export const metadata = getSEOTags();

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme={config.colors.theme} className={font.className}>
      {config.domainName && (
        <head>
          <PlausibleProvider domain={config.domainName} />
          <GoogleAnalytics />
        </head>
      )}
      <body>
        {/* Wrap ClientLayout with QueryProvider */}
        <QueryProvider>
          <ClientLayout>{children}</ClientLayout>
        </QueryProvider>
        <Toaster />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
