import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getLanguageFromExtension = (lang: string) => {
  return lang.split(".").pop()?.toLocaleLowerCase() || "txt";
};
