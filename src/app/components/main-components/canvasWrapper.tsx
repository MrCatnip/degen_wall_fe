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
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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

const CANVAS_DISPLAY_RATIO = 0.8;
const SQUARE_MIN_SIZE = 8;

const CanvasEditMemo = memo(CanvasEdit);

export default function CanvasWrapper(
  props: CanvasEditProps & { onSetSocials: (socials: Socials) => void }
) {
  const { onSetSocials, ...canvasEditProps } = props;
  const [canvasReadonly, setCanvasReadonly] = useState<CanvasLayout>(
    getDefaultCanvas()
  );
  const isInitialRender = useRef(true);
  const { connection } = useConnection();
  const { height, width } = useWindowDimensions();

  const squareSize = Math.max(
    SQUARE_MIN_SIZE,
    Math.min(
      Math.floor((width * CANVAS_DISPLAY_RATIO) / PX_WIDTH),
      Math.floor((height * CANVAS_DISPLAY_RATIO) / PX_HEIGHT)
    )
  );

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
      if (initialCanvas) {
        setCanvasReadonly(initialCanvas);
        isInitialRender.current = false;
      } else console.warn("Please use a valid RPC url for now");
    };

    if (isInitialRender.current) {
      onInitAndGetCanvas();
    }
  }, [canvasReadonly, connection]);
  return (
    <div id="canvas wrapper" className="flex">
      <CanvasReadonly
        {...canvasReadonlyProps}
        onSetSocials={onSetSocials}
      ></CanvasReadonly>
      <CanvasEditMemo
        {...canvasReadonlyProps}
        {...canvasEditProps}
      ></CanvasEditMemo>
    </div>
  );
}
