"use client";

import { CanvasReadonlyProps, Socials } from "@/app/types";
import { PX_HEIGHT, PX_WIDTH, SQUARE_BORDER_COLOR } from "@/app/constants";
import { useEffect, useRef, useState } from "react";
import { invertColor } from "./canvas-util";

// Draw a pixel
const drawPixel = (
  x: number,
  y: number,
  color: string,
  squareSize: number,
  ctx: CanvasRenderingContext2D
) => {
  ctx.fillStyle = `#${color}`;
  ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
  ctx.strokeStyle = `#${SQUARE_BORDER_COLOR}`;
  ctx.lineWidth = 1;
  ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
  return ctx;
};

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
    }
    if (prevSquare) {
      const { x, y, color } = prevSquare;
      ctx = drawPixel(x, y, color, squareSize, ctx);
    }
  }, [hoveredSquare, squareSize, canvasLayout]);

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
    setHoveredSquare(null);
  };

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
      />
    </div>
  );
}
