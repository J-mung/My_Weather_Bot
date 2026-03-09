import { createContext } from "react";

// Context menu 열림 상태를 각 구성요소들이 공유 하기 위해 useContext
type ContextMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);
