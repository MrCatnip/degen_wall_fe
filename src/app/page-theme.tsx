"use client";

import { useEffect } from "react";
import { setTheme } from "./themes";
import { WALLET_CONTAINER_HEIGHT } from "./constants-styles";

export default function PageTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--wallet-button-height",
      `${WALLET_CONTAINER_HEIGHT}px`
    );
    setTheme(); //set your theme here after component mounts
  }, []);

  return <div>{children}</div>;
}
