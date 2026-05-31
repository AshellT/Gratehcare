import React, { createContext, useContext } from "react";
import { useSubscription } from "@/hooks/useSubscription";

type SubscriptionContextValue = ReturnType<typeof useSubscription>;

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useSubscription();
  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
};

export function useSubscriptionContext() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
  }
  return ctx;
}

export function useWriteAccess() {
  const { isReadOnly } = useSubscriptionContext();
  return !isReadOnly;
}
