import { ICON_SIZE } from "@/app/constants-styles";

const XIcon = ({
  color = "currentColor",
  width = ICON_SIZE,
  height = ICON_SIZE,
}) => (
  <svg
    className="x-icon rounded-lg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}
    width={width}
    height={height}
    style={{ fill: color }}
  >
    <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4l4.9 4.9-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4l-4.9-4.9 4.9-4.9a1 1 0 0 0 0-1.4z" />
  </svg>
);

export default XIcon;
