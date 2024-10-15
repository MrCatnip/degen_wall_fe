import { ConnectWalletButton } from "../common";
import { SettingsMenu } from "./nav-components";

export default function Nav() {
  return (
    <nav className="flex flex-wrap justify-between px-8 py-1.5">
      <div className="flex align-middle lg:w-4/10">
        <div>
          <img
            src="GOLD.png"
            alt="degenwall-logo"
            className="size-10"
            draggable="false"
          ></img>
        </div>
        <div>
          <span className="leading-10">DegenWall</span>
        </div>
      </div>
      <div className="py-2 lg:w-full lg:order-3">
        <p className="text-center">We are supposed to fill this void with something</p>
      </div>
      <div className="flex gap-4 min-w-60 align-middle lg:order-2">
        <SettingsMenu></SettingsMenu>
        <ConnectWalletButton></ConnectWalletButton>
      </div>
    </nav>
  );
}
