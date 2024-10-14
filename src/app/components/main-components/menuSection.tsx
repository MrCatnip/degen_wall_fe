import { MAX_DATA_SIZE, PX_SIZE } from "@/app/constants";
import { Action, MenuSectionProps } from "@/app/types";
import { ColorPicker } from "primereact/colorpicker";

const MAX_PX_NR = MAX_DATA_SIZE / PX_SIZE;

export default function MenuSection(props: MenuSectionProps) {
  const {
    isEditMode,
    isEraseMode,
    drawColor,
    undoCount,
    redoCount,
    coloredPixelsCount,
    onSetActionStamped,
    onSetDrawColor,
    enterEditMode,
    enableEraseMode,
    exitEditMode,
    onOpenPopupUpload,
    onOpenPopupPay,
  } = props;

  const handleOpenPopupPay = () => {
    onOpenPopupPay();
  };

  const disablePencil = isEditMode && !isEraseMode;
  const disableEraser = !isEditMode || isEraseMode;
  const disableUpload = !isEditMode;
  const disableUndo = !isEditMode || !undoCount;
  const disableRedo = !isEditMode || !redoCount;
  const disableExit = !isEditMode;

  return (
    <div id="menu" className="flex justify-between mt-2">
      <div
        id="menu-leftside"
        className="flex gap-2 p-1 rounded-xl"
        style={{ backgroundColor: "var(--color-4)" }}
      >
        <button
          className={
            "menu-button" + (disablePencil ? " menu-button-disabled" : "")
          }
          disabled={disablePencil}
          onClick={enterEditMode}
        >
          <img
            className="button-icon"
            src="./pencil.png"
            alt="degen-pencil"
            draggable="false"
          />
        </button>
        <div
          className="border-white border-2 rounded-full overflow-hidden menu-button color-picker"
          style={{
            display: isEditMode ? "inline" : "none",
            backgroundColor: drawColor,
          }}
        >
          <ColorPicker
            format="hex"
            value={drawColor}
            onChange={(e) => onSetDrawColor(e.value as string)}
            disabled={!isEditMode}
          />
        </div>
        <button
          className={
            "menu-button" + (disableEraser ? " menu-button-disabled" : "")
          }
          disabled={disableEraser}
          style={{ display: isEditMode ? "inline" : "none" }}
          onClick={enableEraseMode}
        >
          <img
            className="button-icon"
            src="./eraser.png"
            alt="degen-eraser"
            draggable="false"
          />
        </button>
        <button
          className={
            "menu-button" + (disableUpload ? " menu-button-disabled" : "")
          }
          disabled={disableUpload}
          style={{ display: isEditMode ? "inline" : "none" }}
          onClick={onOpenPopupUpload}
        >
          <img
            className="button-icon"
            src="./upload.png"
            alt="degen-upload"
            draggable="false"
          />
        </button>
        <button
          className={
            "menu-button" + (disableUndo ? " menu-button-disabled" : "")
          }
          disabled={disableUndo}
          style={{ display: isEditMode ? "inline" : "none" }}
          onClick={() => onSetActionStamped(Action.Undo)}
        >
          <img
            className="button-icon"
            src="./undo.png"
            alt="degen-undo"
            draggable="false"
          />
        </button>
        <button
          className={
            "menu-button" + (disableRedo ? " menu-button-disabled" : "")
          }
          disabled={disableRedo}
          style={{ display: isEditMode ? "inline" : "none" }}
          onClick={() => onSetActionStamped(Action.Redo)}
        >
          <img
            className="button-icon"
            src="./redo.png"
            alt="degen-redo"
            draggable="false"
          />
        </button>
        <button
          className={
            "menu-button" + (disableExit ? " menu-button-disabled" : "")
          }
          disabled={disableExit}
          style={{ display: isEditMode ? "inline" : "none" }}
          onClick={exitEditMode}
        >
          <img
            className="button-icon"
            src="./exit.png"
            alt="degen-exit"
            draggable="false"
          />
        </button>
      </div>
      <div
        id="menu-rightside"
        className="rounded-xl"
        style={{ backgroundColor: "var(--color-4)" }}
      >
        <button
          disabled={!coloredPixelsCount}
          style={{ display: coloredPixelsCount ? "inline" : "none" }}
          onClick={handleOpenPopupPay}
        >
          Pay
        </button>
        <span
          style={{
            color:
              coloredPixelsCount === 0
                ? "white"
                : coloredPixelsCount <= MAX_PX_NR
                ? "green"
                : "red",
          }}
        >
          {coloredPixelsCount > 0 && `${coloredPixelsCount}/${MAX_PX_NR} PX`}
        </span>
      </div>
    </div>
  );
}
