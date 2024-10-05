"use client";

import { useEffect } from "react";
import { setTheme } from "./themes";

export default function PageTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setTheme(); //set your theme here after component mounts
  }, []);

  return <div>{children}</div>;
}
