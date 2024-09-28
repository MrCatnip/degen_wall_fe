"use client";

import { clusterApiUrl } from "@solana/web3.js";
import AppWalletProvider from "./AppWalletProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import React, { useState, createContext } from "react";
import { isHealthyEndpoint } from "../web3/misc";
import { RPC_URL_KEY } from "../constants";

const NETWORK = WalletAdapterNetwork.Devnet;
const CLUSTER_URL = clusterApiUrl(NETWORK);

interface RPCContextType {
  setRPC: (url?: string) => Promise<boolean>;
}

//@ts-ignore
export const RPCContext = createContext<RPCContextType>(undefined);

interface RPCProviderProps {
  children: React.ReactNode;
}

export default function RPCProvider({ children }: RPCProviderProps) {
  const [endpoint, setEndpoint] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem(RPC_URL_KEY) || CLUSTER_URL
      : CLUSTER_URL
  );

  const setRPC = async (url = "") => {
    if (url && (await isHealthyEndpoint(url))) {
      setEndpoint(url);
      return true;
    }
    setEndpoint(CLUSTER_URL);
    return false;
  };

  return (
    <RPCContext.Provider value={{ setRPC }}>
      <AppWalletProvider endpoint={endpoint}>{children}</AppWalletProvider>
    </RPCContext.Provider>
  );
}
