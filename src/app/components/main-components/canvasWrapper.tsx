/* eslint-disable @next/next/no-img-element */
"use client";

import {
  CanvasLayout,
  CanvasReadonlyProps,
  CanvasEditProps,
  MetadataAccountParsed,
  Socials,
} from "@/app/types";
import { CanvasReadonly, CanvasEdit } from "./canvas-components";
import { useEffect, useRef, useState } from "react";
import {
  getDefaultCanvas,
  getUpdatedCanvas,
  initAndGetCanvas,
} from "./canvas-components/canvas-util";
import { PX_HEIGHT, PX_WIDTH, RPC_URL_KEY } from "@/app/constants";
import useWindowDimensions from "@/app/hooks/useWindowDimensions";
import { useConnection } from "@solana/wallet-adapter-react";
import eventEmitter from "@/app/hooks/eventEmitter";
import { EVENT_NAME } from "@/app/constantsUncircular";
import { Toast } from "primereact/toast";
import {
  CANVAS_DISPLAY_RATIO,
  LG_WIDTH,
  TOAST_LIFE_MS,
} from "@/app/constants-styles";

const SQUARE_MIN_SIZE = 4;

export default function CanvasWrapper(
  props: CanvasEditProps & {
    onSetSocials: (socials: Socials) => void;
  }
) {
  const { onSetSocials, ...canvasEditProps } = props;
  const toast = useRef<Toast>(null);
  const [canvasReadonly, setCanvasReadonly] = useState<CanvasLayout>(
    getDefaultCanvas()
  );
  const isInitialRender = useRef(true);
  const { connection } = useConnection();
  const { height, width } = useWindowDimensions();
  const [squareSize, setSquareSize] = useState(SQUARE_MIN_SIZE);

  const ACTUAL_DISPLAY_RATIO = width <= LG_WIDTH ? 0.95 : CANVAS_DISPLAY_RATIO;

  useEffect(() => {
    const newSquareSize = Math.max(
      SQUARE_MIN_SIZE,
      Math.min(
        Math.floor((width * ACTUAL_DISPLAY_RATIO) / PX_WIDTH),
        Math.floor((height * ACTUAL_DISPLAY_RATIO) / PX_HEIGHT)
      )
    );
    setSquareSize(newSquareSize);
  }, [width, height, ACTUAL_DISPLAY_RATIO]);

  const canvasReadonlyProps: CanvasReadonlyProps = {
    squareSize,
    isEditMode: canvasEditProps.isEditMode,
    canvasReadonly,
  };

  useEffect(() => {
    const handleEvent = (event: MetadataAccountParsed) => {
      const newCanvas = getUpdatedCanvas(canvasReadonly, event) as CanvasLayout;
      setCanvasReadonly([...newCanvas]);
    };

    eventEmitter.on(EVENT_NAME, handleEvent);

    // Clean up the event listener on unmount
    return () => {
      eventEmitter.off(EVENT_NAME, handleEvent);
    };
  }, [canvasReadonly]);

  useEffect(() => {
    const onInitAndGetCanvas = async () => {
      const endpoint = localStorage.getItem(RPC_URL_KEY) || "";
      const initialCanvas = await initAndGetCanvas(endpoint);
      if (initialCanvas) setCanvasReadonly(initialCanvas);
      else {
        toast?.current?.show({
          severity: "warn",
          detail: `Couldn't fetch from server. Please use a valid RPC for now!`,
          life: TOAST_LIFE_MS,
          className: "toast-warn",
        });
        isInitialRender.current = true;
      }
    };

    if (isInitialRender.current) {
      isInitialRender.current = false;
      onInitAndGetCanvas();
    }
  }, [canvasReadonly, connection]);
  return (
    <div id="canvas wrapper" className="flex">
      <CanvasReadonly
        {...canvasReadonlyProps}
        onSetSocials={onSetSocials}
      ></CanvasReadonly>
      <CanvasEdit {...canvasReadonlyProps} {...canvasEditProps}></CanvasEdit>
      <Toast ref={toast} position="bottom-right"></Toast>
    </div>
  );
}
