import { useEffect, useState } from "react";

// Hydration guard for wallets

export default function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}