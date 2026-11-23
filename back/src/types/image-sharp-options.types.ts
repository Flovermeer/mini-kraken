import type { ResizeOptions } from "sharp";

export type ImageSharpOptions = { width: number; height: number; fit: ResizeOptions['fit'], position: ResizeOptions['position'] };
