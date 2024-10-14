import { BackdropCommon } from "@/app/common";
import XIcon from "@/app/common/xIcon";
import { PX_HEIGHT, PX_WIDTH } from "@/app/constants";
import { PixelArray, UploadPopupProps } from "@/app/types";
import { useRef, useEffect, useState } from "react";

const UNEXPECTED_ERROR_MESSAGE = "Unexpected error";

export default function UploadPopup(props: UploadPopupProps) {
  const { popupUpload, onClosePopupUpload, onSaveImage } = props;
  const menuRef = useRef<HTMLDivElement>(null);
  const [pixelArray, setPixelArray] = useState<PixelArray>([]);
  const [errorMessage, setErrorMesage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const clearStuff = () => {
    setErrorMesage("");
    setPixelArray([]);
    resetCanvas();
  };

  const handleSave = () => {
    onSaveImage(pixelArray);
    setPixelArray([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    clearStuff();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      clearStuff();
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/"))
          throw new Error("Please upload a valid image file.");
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          try {
            const { width, height } = img;
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;

            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const imageData = ctx.getImageData(0, 0, width, height);
              const pixels = imageData.data; // RGBA values
              const pixelArray: PixelArray = Array.from({ length: width }, () =>
                Array(height).fill(null)
              );
              let pixelCount = 0;
              for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];
                const rowIndex = Math.floor(i / 4 / width);
                const colIndex = (i / 4) % width;
                if (a === 0) {
                  pixelArray[rowIndex][colIndex] = null;
                } else {
                  pixelCount++;
                  // Convert RGBA to hex (excluding alpha)
                  const hex = ((r << 16) | (g << 8) | b)
                    .toString(16)
                    .padStart(6, "0");
                  pixelArray[rowIndex][colIndex] = hex;
                }
              }
              // Save the pixel array to state
              setPixelArray(pixelArray);
            }
            URL.revokeObjectURL(img.src);
            if (width > PX_WIDTH || height > PX_HEIGHT) {
              throw new Error(
                `Image dimensions should not exceed ${PX_WIDTH}px in width and ${PX_HEIGHT}px in height.`
              );
            }
          } catch (error) {
            //@ts-expect-error fk this shit
            if (error?.message)
              //@ts-expect-error fk this shit x2
              setErrorMesage(error.message as string);
            else setErrorMesage(UNEXPECTED_ERROR_MESSAGE);
            console.warn(error);
          }
        };
        img.onerror = (error) => {
          const errorMessage = `There was an error loading the image`;
          setErrorMesage(errorMessage);
          console.warn(`${errorMessage}: ${error}`);
        };
      } else throw new Error(`Couldn't load the image!`);
    } catch (error) {
      const errorMessage = UNEXPECTED_ERROR_MESSAGE;
      setErrorMesage(errorMessage);
      console.warn(`${errorMessage}: ${error}`);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClosePopupUpload();
      }
    };
    if (popupUpload) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupUpload, onClosePopupUpload]);

  const saveButtonDisabled = (!pixelArray.length || errorMessage) as boolean;

  return (
    <BackdropCommon open={popupUpload}>
      <div
        ref={menuRef}
        className="bg-color-2 text-color-4 flex flex-col gap-4 p-6 rounded-lg"
      >
        <div className="flex justify-between">
          <h3 className="text-xl font-semibold">Upload Image</h3>
          <button onClick={onClosePopupUpload} className="mr-2">
            <XIcon color="var(--color-4)" />
          </button>
        </div>
        <input
          className="common-button"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <canvas
          ref={canvasRef}
          onDragStart={(e) => e.preventDefault()}
          style={{ maxWidth: `${PX_WIDTH}px`, maxHeight: `${PX_HEIGHT}px` }}
        />
        <button
          className={
            "common-button" +
            (saveButtonDisabled ? " common-button-disabled" : "")
          }
          disabled={saveButtonDisabled}
          onClick={handleSave}
        >
          Save
        </button>
        <span
          id="error-message"
          style={{ display: errorMessage ? "inline" : "none" }}
        >
          {errorMessage}
        </span>
      </div>
    </BackdropCommon>
  );
}
