import { SQUARE_BORDER_COLOR } from "@/app/constants";
import { SquareReadonlyProps } from "@/app/types";
import { useState } from "react";
import { invertColor } from "./canvas-util";

export default function SquareReadonly(squareProps: SquareReadonlyProps) {
  const { size, metadataItem, onSetSocials, handleClick, focusIndex, index } =
    squareProps;
  const { color, socials } = metadataItem;
  const invertedColor = invertColor(color);
  const [isHovered, setIsHovered] = useState(false);
  const onHover = () => {
    if (focusIndex === undefined) {
      setIsHovered(true);
      onSetSocials(socials);
    }
  };

  const onUnhover = () => {
    setIsHovered(false);
  };

  return (
    <div
      style={{
        backgroundColor: `#${
          isHovered || index === focusIndex ? invertedColor : color
        }`,
        width: `${size}px`,
        height: `${size}px`,
        border: `0.5px solid #${SQUARE_BORDER_COLOR}`,
        flexShrink: 0,
      }}
      onClick={(event) => handleClick(index)}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    />
  );
}
