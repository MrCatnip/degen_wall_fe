import {
  ConnectWalletButton,
  SelectTokenDropdown,
  TokenBalanceDisplay,
} from "../common";
import { SettingsMenu } from "./nav-components";

export default function Nav() {
  return (
    <nav className="flex gap-4">
      <div className="flex align-middle">
        <div>
          <img src="GOLD.png" alt="degenwall-logo" className="size-10"></img>
        </div>
        <div>
          <span className="leading-10">DegenWall</span>
        </div>
      </div>
      <SettingsMenu></SettingsMenu>
      <ConnectWalletButton></ConnectWalletButton>
      <SelectTokenDropdown></SelectTokenDropdown>
      <TokenBalanceDisplay></TokenBalanceDisplay>
    </nav>
  );
}
