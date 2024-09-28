import { Backdrop } from "@mui/material";
import { CommonBackdropProps } from "../types";
import { useEffect, useState } from "react";

export default function BackdropCommon(props: CommonBackdropProps) {
  const { children, sx = {}, open } = props;
  //Hydration error on localhost
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <Backdrop
      open={open}
      sx={(theme) => ({
        color: "#fff",
        zIndex: theme.zIndex.mobileStepper, // this is the only one lower than wallet modal
        ...sx,
      })}
    >
      {children}
    </Backdrop>
  );
}
