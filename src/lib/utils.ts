import { clsx, type ClassValue } from "clsx"
import { twMagnetStraight } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
