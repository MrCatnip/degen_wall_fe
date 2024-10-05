import { ConnectWalletButton } from "../common";
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
      <div className="py-2">
        <p>We are supposed to fill this void with something</p>
      </div>
      <div className="flex gap-4 min-w-60">
        <SettingsMenu></SettingsMenu>
        <ConnectWalletButton></ConnectWalletButton>
      </div>
    </nav>
  );
}
