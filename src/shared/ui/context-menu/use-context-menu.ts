import { useContext } from "react";
import { ContextMenuContext } from "./context-menu.context";

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("ContextMenu components mush be used within ContextMenu.");
  }

  return context;
};
