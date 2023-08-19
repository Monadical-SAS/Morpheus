import React from "react";
import { IconProps } from "./types";

export function EnhanceIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 32 33"
    >
      <path
        stroke={props.color || "white"}
        strokeLinecap="round"
        strokeWidth="2.5"
        d="M17.613 2H7a5 5 0 00-5 5v19a5 5 0 005 5h18a5 5 0 005-5V14.422M30 8V2.5a.5.5 0 00-.5-.5H24"
      ></path>
      <path
        stroke={props.color || "white"}
        strokeLinecap="round"
        strokeWidth="2.5"
        d="M14 13v5.5a.5.5 0 00.5.5H20"
      ></path>
      <path stroke={props.color || "white"} strokeWidth="2" d="M14.5 18.5l15-16"></path>
      <path stroke={props.color || "white"} strokeLinecap="round" strokeWidth="2.5" d="M7 7v18a1 1 0 001 1h17"></path>
    </svg>
  );
}
