import { MAX_DATA_SIZE, MAX_JITO_TX_NR, PX_SIZE } from "@/app/constants";
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
    coloredPixelsCount > MAX_PX_NR * MAX_JITO_TX_NR
      ? console.warn("Too many pixels you fat ass")
      : onOpenPopupPay();
  };

  return (
    <div id="menu" className="flex justify-between mt-2">
      <div id="menu-leftside" className="flex gap-2">
        <button disabled={isEditMode && !isEraseMode} onClick={enterEditMode}>
          Pencil
        </button>
        <div
          className="w-6 h-6 border-white border-2 rounded-full overflow-hidden"
          style={{ opacity: isEditMode ? 1 : 0 }}
        >
          <ColorPicker
            format="hex"
            value={drawColor}
            onChange={(e) => onSetDrawColor(e.value as string)}
            disabled={!isEditMode}
          />
        </div>
        <button
          disabled={!isEditMode || isEraseMode}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={enableEraseMode}
        >
          Erase
        </button>
        <button
          disabled={!isEditMode}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={onOpenPopupUpload}
        >
          Upload
        </button>
        <button
          disabled={!isEditMode || !undoCount}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={() => onSetActionStamped(Action.Undo)}
        >
          Undo
        </button>
        <button
          disabled={!isEditMode || !redoCount}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={() => onSetActionStamped(Action.Redo)}
        >
          Redo
        </button>
        <button
          disabled={!isEditMode}
          style={{ opacity: isEditMode ? 1 : 0 }}
          onClick={exitEditMode}
        >
          Exit
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
                : coloredPixelsCount <= MAX_PX_NR * MAX_JITO_TX_NR
                ? "orange"
                : "red",
          }}
        >
          {coloredPixelsCount > 0 &&
            `${coloredPixelsCount}/${
              MAX_PX_NR * (coloredPixelsCount <= MAX_PX_NR ? 1 : MAX_JITO_TX_NR)
            } PX`}
        </span>
      </div>
    </div>
  );
}
