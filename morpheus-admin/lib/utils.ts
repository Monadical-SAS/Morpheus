import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isEmptyObject = (object: any) => {
  if (!object) return true;
  return Object.keys(object).length === 0;
};
