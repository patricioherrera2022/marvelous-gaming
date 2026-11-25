"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { CartDrawer } from "./CartDrawer";
import { Footer } from "./Footer";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import type { StoreSettings, TcgSeriesWithSets } from "@/types";

export function StoreShell({
  children,
  settings,
  series,
}: {
  children: React.ReactNode;
  settings: StoreSettings;
  series: TcgSeriesWithSets[];
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/adminfacu");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-obsidian-950 text-white">
      <ScrollProgressBar />
      <Navbar settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} series={series} />
      <CartDrawer settings={settings} />
    </div>
  );
}
