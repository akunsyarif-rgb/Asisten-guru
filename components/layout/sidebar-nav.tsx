"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/modules";
import { cn } from "@/lib/utils";

export function SidebarNav({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-1", orientation === "vertical" ? "flex-col" : "flex-row justify-around")}>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-xs font-medium transition-colors md:text-sm",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
