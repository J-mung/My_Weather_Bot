import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ContextMenuProps } from "./context-menu.types";

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

export const ContextMenu = ({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: ContextMenuProps) => {
  // context menu content 렌더링 기준점
  const rootRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (!currentOpen) {
      return;
    }

    const handlePointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [currentOpen, setOpen]);

  // ContextMenu 하위 컴포넌트들이 공유할 context value
  const value = useMemo(
    () => ({
      open: currentOpen,
      setOpen,
    }),
    [currentOpen, setOpen],
  );

  return (
    <ContextMenuContext.Provider value={value}>
      <div ref={rootRef} className={"relative inline-block"}>
        {children}
      </div>
    </ContextMenuContext.Provider>
  );
};
