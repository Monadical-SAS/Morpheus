import { IconProps } from "./types";

export const MinusIcon = (props: IconProps) => (
  <svg
    width={props.width || 16}
    height={props.height || 2}
    viewBox="0 0 16 2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 1C0 0.447715 0.447715 0 1 0H15C15.5523 0 16 0.447715 16 1C16 1.55228 15.5523 2 15 2H1C0.447715 2 0 1.55228 0 1Z"
      fill={props.color || "#FFFFFF"}
    />
  </svg>
);
