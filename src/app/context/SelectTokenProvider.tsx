"use client";

import React, { useState, createContext, useEffect } from "react";
import { Token, TokenSymbol } from "../types";
import { TOKEN_DICT } from "../constants";

const TOKEN_SYMBOL_KEY = "tokenSymbol";

export const SelectTokenContext = createContext<{
  token: Token;
  symbol: TokenSymbol;
  onSetToken: (newSymbol: TokenSymbol) => void; //@ts-ignore
}>(null);

export const SelectTokenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [token, setToken] = useState(TOKEN_DICT.SOL);
  const [symbol, setSymbol] = useState<TokenSymbol>("SOL");
  useEffect(() => {
    const newSymbol = localStorage.getItem(TOKEN_SYMBOL_KEY) as TokenSymbol;
    if (newSymbol) {
      setToken(TOKEN_DICT[newSymbol]);
      setSymbol(newSymbol);
    } else {
      setToken(TOKEN_DICT.SOL);
      setSymbol("SOL");
    }
  }, []);
  const onSetToken = (newSymbol: TokenSymbol) => {
    if (newSymbol !== symbol) {
      setSymbol(newSymbol);
      setToken(TOKEN_DICT[newSymbol]);
      localStorage.setItem(TOKEN_SYMBOL_KEY, newSymbol);
    }
  };
  return (
    <SelectTokenContext.Provider
      value={{
        token,
        symbol,
        onSetToken,
      }}
    >
      {children}
    </SelectTokenContext.Provider>
  );
};
