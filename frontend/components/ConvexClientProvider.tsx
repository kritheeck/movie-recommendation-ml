"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

interface ConvexStatusContextType {
  isConnected: boolean;
  convexUrl: string;
}

const ConvexStatusContext = createContext<ConvexStatusContextType>({
  isConnected: true,
  convexUrl: "",
});

export const useConvexStatus = () => useContext(ConvexStatusContext);

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ||
  "https://standing-wolverine-760.convex.cloud";

const convexClient = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ConvexStatusContext.Provider value={{ isConnected, convexUrl }}>
      <ConvexProvider client={convexClient}>{children}</ConvexProvider>
    </ConvexStatusContext.Provider>
  );
}
