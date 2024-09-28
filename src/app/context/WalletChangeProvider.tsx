"use client";

import React, { useState, createContext, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import useInterval from "../hooks/useInterval";

interface WalletChangeProviderProps {
  children: React.ReactNode;
}

export const WalletChangeContext = createContext(null);

export const WalletChangeProvider: React.FC<WalletChangeProviderProps> = ({
  children,
}) => {
  const wallet = useWallet();
  const [currentPubkey, setCurrentPubkey] = useState(undefined);

  useInterval(async () => {
    const provider = window //@ts-ignore
      ? window?.solana || window?.phantom || window?.solflare
      : null;
    const newPubkey = provider?.publicKey?.toBase58();
    if (newPubkey !== currentPubkey) {
      if (wallet.connected && currentPubkey) {
        await wallet.disconnect();
      }
      setCurrentPubkey(newPubkey);
    }
  }, 100);
  return (
    <WalletChangeContext.Provider value={null}>
      {children}
    </WalletChangeContext.Provider>
  );
};
