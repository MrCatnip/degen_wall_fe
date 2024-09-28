import {
  CanvasEditProps,
  CanvasReadonlyProps,
  CanvasLayout,
  ColoredPixelsActionsDict,
  ActionStamped,
  ColorPixelPointers,
  Action,
} from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { PX_HEIGHT, PX_WIDTH, SQUARE_BORDER_COLOR } from "@/app/constants";

export default function CanvasEdit(
  props: CanvasEditProps & CanvasReadonlyProps
) {
  const {
    isEditMode,
    drawColor,
    squareSize,
    canvasReadonly,
    isEraseMode,
    onColorPixel,
    onErasePixel,
    forceUpdate,
    actionStamped,
    pixelArray,
    onClearImage,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const isMouseDown = useRef(false);
  const isInitialRender = useRef(true);
  const canvasEditable = useRef<CanvasLayout>([]);
  const canvasReadonlyCopy = useRef<CanvasLayout>([]);
  const canvasChangesTracker = useRef(Array.from({ length: 5000 }, () => ""));
  const coloredPixelsActionsDict = useRef<ColoredPixelsActionsDict>({});
  const canvasActions = useRef<ColoredPixelsActionsDict[]>([]);
  const canvasActionsUndoed = useRef<ColoredPixelsActionsDict[]>([]);
  const latestAction = useRef<ActionStamped>();
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isEditMode && isInitialRender.current) {
      isInitialRender.current = false;
      canvasEditable.current = JSON.parse(JSON.stringify(canvasReadonly));
      canvasReadonlyCopy.current = JSON.parse(JSON.stringify(canvasReadonly));
    } else if (!isEditMode && !isInitialRender.current) {
      isInitialRender.current = true;
      canvasEditable.current = [];
      canvasReadonlyCopy.current = [];
      coloredPixelsActionsDict.current = {};
      canvasActions.current = [];
      canvasActionsUndoed.current = [];
      latestAction.current = null;
      canvasChangesTracker.current = Array.from({ length: 5000 }, () => "");
    }
  }, [isEditMode, canvasReadonly]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const previewContext = previewCanvas?.getContext("2d");
    if (!context) return;
    canvas.width = PX_WIDTH * squareSize;
    canvas.height = PX_HEIGHT * squareSize;
    if (previewCanvas) {
      previewCanvas.width = squareSize * pixelArray.length;
      previewCanvas.height = squareSize * pixelArray.length;
    }
    const drawPixel = (x: number, y: number, color: string) => {
      context.fillStyle = `#${color}`;
      context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      context.strokeStyle = `#${SQUARE_BORDER_COLOR}`;
      context.lineWidth = 1;
      context.strokeRect(
        x * squareSize,
        y * squareSize,
        squareSize,
        squareSize
      );
    };

    const drawPreview = () => {
      if (previewCanvas && previewContext && pixelArray.length) {
        for (let i = 0; i < pixelArray.length; i++) {
          for (let j = 0; j < pixelArray[i].length; j++) {
            const color = pixelArray[i][j];
            if (color) {
              previewContext.fillStyle = `#${color}`;
              previewContext.fillRect(
                j * squareSize,
                i * squareSize,
                squareSize,
                squareSize
              );
              previewContext.strokeStyle = `#${SQUARE_BORDER_COLOR}`;
              previewContext.lineWidth = 1;
              previewContext.strokeRect(
                j * squareSize,
                i * squareSize,
                squareSize,
                squareSize
              );
            }
          }
        }
      }
    };

    const addPixelAction = (index: number, newColor: string = "") => {
      const prevColor = canvasChangesTracker.current[index];
      if (
        !coloredPixelsActionsDict.current[index] &&
        (newColor || canvasChangesTracker.current[index])
      ) {
        coloredPixelsActionsDict.current = {
          ...coloredPixelsActionsDict.current,
          [index]: {
            prevColor,
            newColor,
          },
        };
        canvasChangesTracker.current[index] = newColor;
        canvasEditable.current[index].color =
          newColor || canvasReadonlyCopy.current[index].color;
        if (canvasActionsUndoed.current.length)
          canvasActionsUndoed.current = [];
      }
      /*
      const action = coloredPixelsActionsDict.current[index];
      if (action?.newColor !== color) {
        coloredPixelsActionsDict.current = {
          ...coloredPixelsActionsDict.current,
          [index]: {
            prevColor: action?.newColor,
            newColor: color,
          },
        };
        canvasActionsUndoed.current = [];
      }
        */
    };
    const addCanvasAction = () => {
      const action = coloredPixelsActionsDict.current;
      if (Object.keys(action).length) {
        canvasActions.current.push(action);
        canvasActionsUndoed.current = [];
        coloredPixelsActionsDict.current = {};
      }
    };

    const applyCanvasAction = (
      action: ColoredPixelsActionsDict,
      key: keyof ColorPixelPointers
    ) => {
      for (const [indexString, entry] of Object.entries(action)) {
        const color = entry[key] || "";
        const index = Number(indexString);
        canvasChangesTracker.current[index] = color;
        if (!color) {
          canvasEditable.current[index].color =
            canvasReadonlyCopy.current[index].color;
          onErasePixel(index);
        } else {
          canvasEditable.current[index].color = color;
          onColorPixel(index, color);
        }
      }
      forceUpdate();
    };

    const redoCanvasAction = () => {
      const action = canvasActionsUndoed.current.pop();
      if (action) {
        canvasActions.current.push(action);
        applyCanvasAction(action, "newColor");
      }
    };
    const undoCanvasAction = () => {
      const action = canvasActions.current.pop();
      if (action) {
        canvasActionsUndoed.current.push(action);
        applyCanvasAction(action, "prevColor");
      }
    };

    if (
      actionStamped &&
      actionStamped.timestamp !== latestAction.current?.timestamp
    ) {
      latestAction.current = { ...actionStamped };
      if (latestAction.current.action === Action.Undo) undoCanvasAction();
      else redoCanvasAction();
    }

    canvasEditable.current.forEach((square, index) => {
      const row = Math.floor(index / PX_WIDTH);
      const col = index % PX_WIDTH;
      drawPixel(col, row, square.color);
    });

    if (pixelArray.length) drawPreview();

    const handlePixelAction = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / squareSize);
      const y = Math.floor((event.clientY - rect.top) / squareSize);
      if (x >= 0 && x < PX_WIDTH && y >= 0 && y < PX_HEIGHT) {
        if (pixelArray.length) {
          for (let i = 0; i < pixelArray.length; i++)
            for (let j = 0; j < pixelArray[i].length; j++) {
              const color = pixelArray[i][j];
              if (color) {
                const drawX = x + j;
                const drawY = y + i;
                const index = drawY * PX_WIDTH + drawX;
                if (drawX < canvas.width && drawY < canvas.height) {
                  drawPixel(drawX, drawY, color);
                  addPixelAction(index, color);
                  onColorPixel(index, color);
                }
              }
            }
          onClearImage();
          saveCurrentAction();
        } else {
          const index = y * PX_WIDTH + x;
          if (isEraseMode) {
            const originalColor = canvasReadonlyCopy.current[index].color;
            drawPixel(x, y, originalColor);
            addPixelAction(index);
            onErasePixel(index);
          } else {
            drawPixel(x, y, drawColor);
            addPixelAction(index, drawColor);
            onColorPixel(index);
          }
        }
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!pixelArray.length) isMouseDown.current = true;
      handlePixelAction(event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) handlePixelAction(event);
      if (pixelArray.length) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setCursorPosition({ x, y });
      }
    };

    const saveCurrentAction = () => {
      forceUpdate(true);
      addCanvasAction();
    };

    const handleMouseUp = () => {
      if (isMouseDown.current) {
        isMouseDown.current = false;
        saveCurrentAction();
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isEditMode,
    drawColor,
    isEraseMode,
    squareSize,
    onErasePixel,
    onColorPixel,
    forceUpdate,
    actionStamped,
    pixelArray,
    onClearImage,
  ]);

  return (
    <div
      id="canvas-edit"
      className="flex absolute overflow-hidden"
      style={{ opacity: isEditMode ? 1 : 0, zIndex: isEditMode ? 1 : -1 }}
    >
      <canvas ref={canvasRef} onDragStart={(e) => e.preventDefault()} />
      {pixelArray?.length !== 0 && (
        <canvas
          ref={previewCanvasRef}
          style={{
            position: "absolute",
            zIndex: 2,
            left: cursorPosition.x,
            top: cursorPosition.y,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
