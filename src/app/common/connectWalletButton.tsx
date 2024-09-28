import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useIsMounted from "../hooks/useIsMounted";

export default function ConnectWalletButton() {
  const mounted = useIsMounted();
  return <>{mounted && <WalletMultiButton style={{}} />}</>;
}
