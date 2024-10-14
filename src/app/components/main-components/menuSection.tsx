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

  return (
    <div id="menu" className="flex justify-between mt-2">
      <div id="menu-leftside" className="flex gap-2">
        <button
          className="menu-button rounded-full"
          disabled={isEditMode && !isEraseMode}
          onClick={enterEditMode}
        >
          <img src="./pencil.png" alt="degen-pencil" draggable="false" />
        </button>
        <div
          className="border-white border-2 rounded-full overflow-hidden menu-button color-picker"
          style={{
            opacity: isEditMode ? 1 : 0,
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
          className="menu-button"
          disabled={!isEditMode || isEraseMode}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={enableEraseMode}
        >
          <img src="./eraser.png" alt="degen-eraser" draggable="false" />
        </button>
        <button
          className="menu-button"
          disabled={!isEditMode}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={onOpenPopupUpload}
        >
          <img src="./upload.png" alt="degen-upload" draggable="false" />
        </button>
        <button
          className="menu-button"
          disabled={!isEditMode || !undoCount}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={() => onSetActionStamped(Action.Undo)}
        >
          <img src="./undo.png" alt="degen-undo" draggable="false" />
        </button>
        <button
          className="menu-button"
          disabled={!isEditMode || !redoCount}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={() => onSetActionStamped(Action.Redo)}
        >
          <img src="./redo.png" alt="degen-redo" draggable="false" />
        </button>
        <button
          className="menu-button"
          disabled={!isEditMode}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={exitEditMode}
        >
          <img src="./exit.png" alt="degen-exit" draggable="false" />
        </button>
      </div>
      <div id="menu-rightside">
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
