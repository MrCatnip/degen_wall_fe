"use client";

import { CanvasReadonlyProps, Socials } from "@/app/types";
import { PX_HEIGHT, PX_WIDTH } from "@/app/constants";
import { useEffect, useRef, useState } from "react";
import { drawPixel, getDefaultSocials, invertColor } from "./canvas-util";
import SocialsSection from "../socialsSection";
import { BackdropCommon } from "@/app/common";

export default function CanvasReadonly(
  props: CanvasReadonlyProps & { onSetSocials: (socials: Socials) => void }
) {
  const {
    squareSize,
    isEditMode,
    canvasReadonly: canvasLayout,
    onSetSocials,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [socials, setSocials] = useState(getDefaultSocials());
  const [hoveredSquare, setHoveredSquare] = useState<{
    x: number;
    y: number;
    color: string;
    prevSquare?: {
      x: number;
      y: number;
      color: string;
    };
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    // Draw the entire canvas initially
    const drawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvasLayout.forEach((square, index) => {
        const row = Math.floor(index / PX_WIDTH);
        const col = index % PX_WIDTH;
        ctx = drawPixel(col, row, square.color, squareSize, ctx);
      });
    };

    // Set canvas dimensions
    canvas.width = PX_WIDTH * squareSize;
    canvas.height = PX_HEIGHT * squareSize;

    drawCanvas();
  }, [canvasLayout, squareSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx || !hoveredSquare) return;

    const { x, y, prevSquare } = hoveredSquare;
    const index = y * PX_WIDTH + x;
    const square = canvasLayout[index];

    if (square) {
      const invertedColor = invertColor(square.color);
      ctx = drawPixel(x, y, invertedColor, squareSize, ctx); // Color the square with the inverted color
      onSetSocials(square.socials);
    }
    if (prevSquare) {
      const { x, y, color } = prevSquare;
      ctx = drawPixel(x, y, color, squareSize, ctx);
    }
  }, [hoveredSquare, squareSize, canvasLayout, onSetSocials]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / squareSize);
    const y = Math.floor((event.clientY - rect.top) / squareSize);

    if (
      x >= 0 &&
      x < PX_WIDTH &&
      y >= 0 &&
      y < PX_HEIGHT &&
      (hoveredSquare?.x !== x || hoveredSquare?.y !== y)
    ) {
      const { color } = canvasLayout[x + y * PX_WIDTH];
      const prevSquare = hoveredSquare
        ? {
            x: hoveredSquare.x,
            y: hoveredSquare.y,
            color: hoveredSquare.color,
          }
        : undefined;
      setHoveredSquare({ x, y, color, prevSquare });
    }
  };

  const handleMouseLeave = () => {
    setHoveredSquare((prevSquare) => ({
      x: -1,
      y: -1,
      color: "black",
      prevSquare: prevSquare
        ? { x: prevSquare.x, y: prevSquare.y, color: prevSquare.color }
        : undefined,
    }));
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / squareSize);
    const y = Math.floor((event.clientY - rect.top) / squareSize);

    if (x >= 0 && x < PX_WIDTH && y >= 0 && y < PX_HEIGHT) {
      // Do something with the clicked square (e.g., log, update state, etc.)
      setSocials(canvasLayout[x + y * PX_WIDTH].socials);
      setOpen(true);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        socialsRef.current &&
        !socialsRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const socialsSectionProps = { ...socials, isEditMode: false };

  return (
    <div
      id="canvas-view"
      className="flex"
      style={{ opacity: isEditMode ? 0 : 1 }}
    >
      <canvas
        id="canvas-readonly"
        ref={canvasRef}
        style={{
          border: "1px solid black",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      <BackdropCommon open={open}>
        <div ref={socialsRef}>
          <SocialsSection {...socialsSectionProps}></SocialsSection>
        </div>
      </BackdropCommon>
    </div>
  );
}
