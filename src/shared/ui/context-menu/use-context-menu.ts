import { createContext, useContext } from "react";

// Context menu 열림 상태를 각 구성요소들이 공유 하기 위해 useContext
type ContextMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("ContextMenu components mush be used within ContextMenu.");
  }

  return context;
};
