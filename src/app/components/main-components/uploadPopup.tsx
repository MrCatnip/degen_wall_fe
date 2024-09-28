import { BackdropCommon } from "@/app/common";
import {
  MAX_DATA_SIZE,
  MAX_JITO_TX_NR,
  PX_HEIGHT,
  PX_SIZE,
  PX_WIDTH,
} from "@/app/constants";
import {  PixelArray, UploadPopupProps } from "@/app/types";
import { useRef, useEffect, useState } from "react";

const MAX_PX_SIZE = (MAX_DATA_SIZE * MAX_JITO_TX_NR) / PX_SIZE;
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
            if (width > PX_WIDTH || height > PX_HEIGHT) {
              throw new Error(
                `Image dimensions should not exceed ${PX_WIDTH} in width and ${PX_HEIGHT} in height.`
              );
            }
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
              if (pixelCount > MAX_PX_SIZE)
                throw new Error(
                  `Image total size (width * height) should not exceed ${MAX_PX_SIZE}`
                );
              // Save the pixel array to state
              setPixelArray(pixelArray);
            }
            URL.revokeObjectURL(img.src);
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

  return (
    <BackdropCommon open={popupUpload}>
      <div ref={menuRef} className="bg-black">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <button disabled={!pixelArray.length} onClick={handleSave}>
          Save
        </button>
        <canvas ref={canvasRef} onDragStart={(e) => e.preventDefault()} />
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
