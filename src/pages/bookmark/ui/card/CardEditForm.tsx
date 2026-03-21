import Button from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/input/Input";
import { useEffect, useRef } from "react";
import { bookmarkEditStyles } from "../styles";

export const CardEditForm = ({
  aliasInput,
  setAliasInput,
  saveEdit,
  cancelEdit,
}: {
  aliasInput: string;
  setAliasInput: React.Dispatch<React.SetStateAction<string>>;
  saveEdit: () => void;
  cancelEdit: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.focus();
  }, []);

  return (
    <div className={cn(bookmarkEditStyles.bookmarkEditForm)}>
      <Input
        ref={inputRef}
        value={aliasInput}
        type={"text"}
        maxLength={20}
        variant={aliasInput.length > 19 ? "error" : "default"}
        placeholder={"별칭 입력 (최대 20자)"}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onChange={(e) => {
          setAliasInput(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            saveEdit();
          }
        }}
      />
      <div className={cn(bookmarkEditStyles.bookmarkEditButtonList)}>
        <Button
          variant={"primary"}
          size={"md"}
          onClick={(e) => {
            e.stopPropagation();
            saveEdit();
          }}
        >
          저장
        </Button>
        <Button
          variant={"secondary"}
          size={"md"}
          onClick={(e) => {
            e.stopPropagation();
            cancelEdit();
          }}
        >
          취소
        </Button>
      </div>
    </div>
  );
};
