import { BackdropCommon } from "@/app/common";
import { RPC_URL_KEY } from "@/app/constants";
import { ICON_SIZE, SETTINGS_MENU_WIDTH } from "@/app/constants-styles";
import { RPCContext } from "@/app/context/RPCProvider";
import { changeTheme } from "@/app/themes";
import { Switch } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import XIcon from "./xIcon";
import { ThemeButton, ThemeButtonProps } from "@/app/types";

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const RPC_URL =
    typeof window !== "undefined"
      ? localStorage.getItem(RPC_URL_KEY) || ""
      : "";
  const [isCustomRPC, setIsCustomRPC] = useState(RPC_URL ? true : false);
  const { setRPC } = useContext(RPCContext);
  const [inputValue, setInputValue] = useState(RPC_URL || "");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom, left: rect.left });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    const RPC_URL = localStorage.getItem(RPC_URL_KEY) || "";
    RPC_URL ? setIsCustomRPC(true) : setIsCustomRPC(false);
    setInputValue(RPC_URL);
  };

  const toggleSwitch = () => {
    setIsCustomRPC(!isCustomRPC);
    if (isCustomRPC) {
      // keep in mind that even if 1 line above we toggled the bool, it's still the old value in this context
      setInputValue("");
      localStorage.setItem(RPC_URL_KEY, "");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const save = async () => {
    if (isCustomRPC && inputRef.current?.value) {
      setOpen(false);
      const everythingsAllright = await setRPC(inputRef.current?.value);
      if (!everythingsAllright) {
        setInputValue("");
        toggleSwitch();
        localStorage.setItem(RPC_URL_KEY, "");
      } else localStorage.setItem(RPC_URL_KEY, inputRef.current?.value);
      return;
    }
    setRPC();
    setInputValue("");
    localStorage.setItem(RPC_URL_KEY, "");
    setOpen(false);
    if (isCustomRPC) toggleSwitch();
  };

  useEffect(() => {
    const handleResize = () => {
      // Update menu position on window resize
      if (open) {
        //@ts-expect-error shut the fuck up
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom, left: rect.left });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      //@ts-ignore
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const themes = [
    { id: 1, color: "#243642" },
    { id: 2, color: "#f1f1f2" },
    { id: 3, color: "#ff6f61" },
  ];

  const ThemeButton: React.FC<ThemeButtonProps> = ({ theme, onChange }) => (
    <button
      onClick={() => onChange(theme.id)}
      className="rounded-full"
      style={{ backgroundColor: theme.color, width: ICON_SIZE, height: ICON_SIZE }}
    />
  );

  return (
    <div className="flex align-middle">
      <button
        onClick={handleOpen}
        className="hover:animate-spin"
        ref={buttonRef}
      >
        <img src="settings.png" className="size-6" />
      </button>
      <BackdropCommon open={open}>
        <div
          ref={menuRef}
          className="bg-color-2 text-color-4 flex flex-col gap-2 absolute mt-1 p-6 rounded-lg"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left - SETTINGS_MENU_WIDTH + ICON_SIZE}px`,
            width: `${SETTINGS_MENU_WIDTH}px`,
          }}
        >
          <div className="flex justify-between">
            <h3 className="text-xl line font-semibold">Settings</h3>
            <button onClick={save} className="mr-2">
              <XIcon color="var(--color-4)" />
            </button>
          </div>
          <div className="flex flex-col mt-4 gap-2">
            <div className="flex justify-between">
              <div>
                <p className="my-1.75">Use RPC</p>
              </div>
              <Switch
                checked={isCustomRPC}
                onChange={toggleSwitch}
                sx={{
                  "& .MuiSwitch-switchBase": {
                    "&.Mui-checked": {
                      color: "var(--color-5)",
                      "& + .MuiSwitch-track": {
                        backgroundColor: "var(--color-1)",
                      },
                      "&.Mui-disabled + .MuiSwitch-track": {},
                    },
                    "&.Mui-focusVisible .MuiSwitch-thumb": {},
                    "&.Mui-disabled .MuiSwitch-thumb": {},
                    "&.Mui-disabled + .MuiSwitch-track": {},
                  },
                  "& .MuiSwitch-thumb": {},
                  "& .MuiSwitch-track": {
                    backgroundColor: "var(--color-4)",
                  },
                }}
              ></Switch>
            </div>
            <input
              ref={inputRef}
              disabled={!isCustomRPC}
              type="url"
              style={{
                backgroundColor: `var(--color-${isCustomRPC ? "4" : "1"})`,
                outline: `${isCustomRPC ? "solid var(--color-1)" : "unset"}`,
                color: `var(--color-${isCustomRPC ? "1" : "4"})`,
              }}
              className="px-3 py-1 rounded-xl"
              value={inputValue}
              onChange={handleInputChange}
            ></input>
          </div>
          <div className="flex justify-between mt-4">
            <div>
              <p>Color Theme</p>
            </div>
            <div className="flex gap-1">
              {themes.map((theme) => (
                <ThemeButton
                  key={theme.id}
                  theme={theme}
                  onChange={changeTheme}
                />
              ))}
            </div>
          </div>
        </div>
      </BackdropCommon>
    </div>
  );
}
