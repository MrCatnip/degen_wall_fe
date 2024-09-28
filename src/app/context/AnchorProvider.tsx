"use client";

import { createContext, useEffect, useRef, useState } from "react";
import AnchorInterface from "../web3/anchorInterface";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

export const AnchorContext = createContext<AnchorInterface | undefined>(
  undefined
);

export const AnchorProvider = ({ children }: { children: React.ReactNode }) => {
  const wallet = useAnchorWallet();
  const prevPubkey = useRef("");
  const { connection } = useConnection();
  const [anchorInterface, setAnchorInterface] = useState<AnchorInterface>(); // contract interactions
  const [anchorInterfaceListener, setAnchorInterfaceListener] =
    useState<AnchorInterface>();
  const isEventRegistered = useRef(false);
  useEffect(() => {
    if (anchorInterfaceListener && !isEventRegistered.current) {
      anchorInterfaceListener.registerEventListener();
      isEventRegistered.current = true;
    }
    if (!anchorInterfaceListener && connection) {
      setAnchorInterfaceListener(new AnchorInterface(connection));
    }
  }, [connection, anchorInterfaceListener]);

  useEffect(() => {
    const currentPubkey = wallet?.publicKey?.toString();
    if (wallet && currentPubkey !== prevPubkey.current) {
      prevPubkey.current = currentPubkey as string;
      if (!anchorInterface)
        setAnchorInterface(new AnchorInterface(connection, wallet));
      else anchorInterface.updateProgram(connection, wallet);
    } else if (!wallet) {
      prevPubkey.current = "";
    }
  }, [wallet, connection, anchorInterface]);

  return (
    <AnchorContext.Provider value={anchorInterface}>
      {children}
    </AnchorContext.Provider>
  );
};
