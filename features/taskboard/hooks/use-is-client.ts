"use client";

import { useEffect, useState } from "react";

/** Returns true once running on the client after hydration. */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
