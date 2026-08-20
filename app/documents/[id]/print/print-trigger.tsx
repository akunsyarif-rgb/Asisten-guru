"use client";

import { useEffect } from "react";

/** Opens the browser print dialog automatically once the A4 page has rendered. */
export function PrintTrigger() {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
