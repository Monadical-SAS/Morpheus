import { IconProps } from "./types";

export const Text2ImgIcon = (props: IconProps) => (
  <svg
    width={props.width || "24"}
    height={props.height || "22"}
    viewBox="0 0 24 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 14.5V15C24 15.55 23.55 16 23 16C22.45 16 22 15.55 22 15V14.5C22 13.67 21.33 13 20.5 13H19V21C19 21.55 18.55 22 18 22C17.45 22 17 21.55 17 21V13H15.5C14.67 13 14 13.67 14 14.5V15C14 15.55 13.55 16 13 16C12.45 16 12 15.55 12 15V14.5C12 12.57 13.57 11 15.5 11H20.5C22.43 11 24 12.57 24 14.5ZM13 2C14.65 2 16 3.35 16 5V6C16 6.55 16.45 7 17 7C17.55 7 18 6.55 18 6V5C18 2.24 15.76 0 13 0H5C2.24 0 0 2.24 0 5V6C0 6.55 0.45 7 1 7C1.55 7 2 6.55 2 6V5C2 3.35 3.35 2 5 2H8V21C8 21.55 8.45 22 9 22C9.55 22 10 21.55 10 21V2H13Z"
      fill={props.color || "white"}
    />
  </svg>
);
