import { ConnectWalletButton } from "../common";
import { TOP_RIGHT_WIDTH } from "../constants-styles";
import { SettingsMenu } from "./nav-components";

export default function Nav() {
  return (
    <nav className="flex justify-between px-8 py-1.5">
      <div className="flex align-middle">
        <div>
          <img src="GOLD.png" alt="degenwall-logo" className="size-10"></img>
        </div>
        <div>
          <span className="leading-10">DegenWall</span>
        </div>
      </div>
      <p>We are supposed to fill this void with something</p>
      <div className="flex gap-4" style={{ minWidth: TOP_RIGHT_WIDTH }}>
        <SettingsMenu></SettingsMenu>
        <ConnectWalletButton></ConnectWalletButton>
      </div>
    </nav>
  );
}
