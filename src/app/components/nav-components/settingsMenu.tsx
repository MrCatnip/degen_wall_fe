import { BackdropCommon } from "@/app/common";
import { RPC_URL_KEY, SUGGESTED_RPC } from "@/app/constants";
import {
  ICON_SIZE,
  SETTINGS_MENU_WIDTH,
  TOAST_LIFE_MS,
  WALLET_CONTAINER_HEIGHT,
} from "@/app/constants-styles";
import { RPCContext } from "@/app/context/RPCProvider";
import { changeTheme } from "@/app/themes";
import { CircularProgress, Switch } from "@mui/material";
import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import XIcon from "./xIcon";
import { ThemeButtonProps } from "@/app/types";
import { Toast } from "primereact/toast";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export default function SettingsMenu() {
  const toast = useRef<Toast>(null);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [isValid, setIsValid] = useState(false);

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
    setIsPending(true);
    setInputValue(e.target.value);
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && inputRef.current?.value) {
      setIsPending(false);
      setIsLoading(true);
      const everythingsAllright = await setRPC(inputRef.current?.value);
      if (!everythingsAllright) {
        setIsValid(false);
        localStorage.setItem(RPC_URL_KEY, "");
        toast?.current?.show({
          severity: "error",
          summary: "Error!",
          detail: `Invalid RPC ${inputRef.current?.value}`,
          life: TOAST_LIFE_MS,
          className: "toast-error",
        });
      } else {
        setIsValid(true);
        localStorage.setItem(RPC_URL_KEY, inputRef.current?.value);
        toast?.current?.show({
          severity: "success",
          summary: "Success!",
          detail: `Switched to RPC ${inputRef.current?.value}`,
          life: TOAST_LIFE_MS,
          className: "toast-success",
        });
      }
      setIsLoading(false);
    }
  };

  const save = async () => {
    setOpen(false);
    if (!RPC_URL && isCustomRPC) {
      setInputValue("");
      toggleSwitch();
    }
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
      style={{
        backgroundColor: theme.color,
        width: ICON_SIZE,
        height: ICON_SIZE,
      }}
    />
  );

  const rpc_hint_style = (display: boolean): CSSProperties => ({
    width: ICON_SIZE,
    height: ICON_SIZE,
    color: "var(--color-1)",
    marginTop: 4,
    marginBottom: 4,
    fontSize: ICON_SIZE,
    display: display ? "block" : "none",
  });

  const defaultOutline = "solid var(--color-1)";

  return (
    <div
      style={{
        marginTop: `${(WALLET_CONTAINER_HEIGHT - ICON_SIZE) / 2}px`,
        marginBottom: `${(WALLET_CONTAINER_HEIGHT - ICON_SIZE) / 2}px`,
        width: ICON_SIZE,
        height: ICON_SIZE,
      }}
      className="settings-button-wrapper rounded-xl"
    >
      <button
        onClick={handleOpen}
        className="hover:animate-spin"
        ref={buttonRef}
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
      >
        <img src="settings.png" />
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
            <div className="flex relative">
              <input
                ref={inputRef}
                disabled={!isCustomRPC}
                type="url"
                style={{
                  backgroundColor: `var(--color-${isCustomRPC ? "4" : "1"})`,
                  outline: `${isCustomRPC ? `${defaultOutline}` : "unset"}`,
                  color: `var(--color-${isCustomRPC ? "1" : "4"})`,
                }}
                className="px-3 py-1 rounded-xl w-full"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`${SUGGESTED_RPC}`}
              ></input>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  width: ICON_SIZE * 1.5,
                  paddingRight: ICON_SIZE * 0.25,
                  paddingLeft: ICON_SIZE * 0.25,
                  height: "100%",
                  backgroundColor: `var(--color-${isCustomRPC ? "4" : "1"})`,
                  color: `var(--color-${isCustomRPC ? "1" : "4"})`,
                  zIndex: 12000,
                  display: !isPending ? "block" : "none",
                }}
                className="rounded-xl"
              >
                <CircularProgress style={rpc_hint_style(isLoading)} />
                <CheckIcon style={rpc_hint_style(!isPending && isValid)} />
                <CloseIcon style={rpc_hint_style(!isPending && !isValid)} />
              </div>
            </div>
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
      <Toast ref={toast} position="bottom-right"></Toast>
    </div>
  );
}
