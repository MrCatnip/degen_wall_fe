import { useContext } from "react";
import { TokenBalanceContext } from "../context/TokenBalanceProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatBalance } from "../web3/misc";

export default function TokenBalanceDisplay() {
  const balance = useContext(TokenBalanceContext);
  const wallet = useWallet();
  return (
    <p style={{ display: wallet.connected ? "block" : "none" }}>
      Balance: {formatBalance(balance)}
    </p>
  );
}
