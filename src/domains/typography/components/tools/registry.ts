import type { ComponentType } from "react";
import { FontPreviewer } from "../impl/FontPreviewer";

export const TOOL_COMPONENTS: Record<string, ComponentType<any>> = {
  "font-previewer": FontPreviewer,
};
