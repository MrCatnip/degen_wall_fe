import {
  ConnectWalletButton,
  SelectTokenDropdown,
  TokenBalanceDisplay,
} from "../common";
import { SettingsMenu } from "./nav-components";

export default function Nav() {
  return (
    <nav className="flex gap-4">
      <p>Lorem ipsum blablablabla</p>
      <ConnectWalletButton></ConnectWalletButton>
      <SelectTokenDropdown></SelectTokenDropdown>
      <TokenBalanceDisplay></TokenBalanceDisplay>
      <SettingsMenu></SettingsMenu>
    </nav>
  );
}
