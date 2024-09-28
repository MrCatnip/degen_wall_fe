import { BackdropCommon } from "@/app/common";
import { RPC_URL_KEY } from "@/app/constants";
import { RPCContext } from "@/app/context/RPCProvider";
import { Switch } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const RPC_URL =
    typeof window !== "undefined"
      ? localStorage.getItem(RPC_URL_KEY) || ""
      : "";
  const [isCustomRPC, setIsCustomRPC] = useState(RPC_URL ? true : false);
  const { setRPC } = useContext(RPCContext);
  const [inputValue, setInputValue] = useState(RPC_URL || "");

  const handleOpen = () => {
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

  return (
    <div>
      <button onClick={handleOpen}>Settings</button>
      <BackdropCommon open={open}>
        <div ref={menuRef} className="bg-black flex gap-2">
          <Switch checked={isCustomRPC} onChange={toggleSwitch}></Switch>
          <span>RPC URL</span>
          <input
            ref={inputRef}
            disabled={!isCustomRPC}
            type="url"
            className="text-black"
            value={inputValue}
            onChange={handleInputChange}
          ></input>
          <button onClick={save}>Save</button>
        </div>
      </BackdropCommon>
    </div>
  );
}
