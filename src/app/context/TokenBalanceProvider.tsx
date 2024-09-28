"use client";

import React, { useState, createContext, useEffect, useContext } from "react";
import { SelectTokenContext } from "./SelectTokenProvider";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { updateBalance } from "../web3/updateBalance";
import useInterval from "../hooks/useInterval";
import { FETCH_BALANCE_INTERVAL_MS } from "../constants";

export const TokenBalanceContext = createContext(0);

export const TokenBalanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const selectTokenContext = useContext(SelectTokenContext);
  const wallet = useWallet();
  const connectionContext = useConnection();
  const [balance, setBalance] = useState(0);

  const onSetBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  useEffect(() => {
    if (!wallet.connected) onSetBalance(0);
    else if (selectTokenContext?.token) {
      if (wallet.publicKey)
        updateBalance(
          wallet.publicKey,
          selectTokenContext?.token,
          connectionContext.connection,
          onSetBalance
        );
      else onSetBalance(0);
    }
  }, [
    wallet.connected,
    wallet.publicKey,
    connectionContext.connection,
    selectTokenContext,
  ]);

  useInterval(async () => {
    if (selectTokenContext?.token && wallet.publicKey)
      updateBalance(
        wallet.publicKey,
        selectTokenContext.token,
        connectionContext.connection,
        onSetBalance
      );
  }, FETCH_BALANCE_INTERVAL_MS);
  return (
    <TokenBalanceContext.Provider value={balance}>
      {children}
    </TokenBalanceContext.Provider>
  );
};
