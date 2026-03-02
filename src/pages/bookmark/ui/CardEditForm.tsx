import { useEffect, useRef } from "react";
import { bookmarkEditStyles } from "./styles";

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
  });

  return (
    <div className={bookmarkEditStyles.bookmarkEditForm}>
      <input
        type={"text"}
        className={bookmarkEditStyles.bookmarkEditInput}
        ref={inputRef}
        maxLength={20}
        placeholder={"별칭 입력 (최대 20자)"}
        value={aliasInput}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onChange={(e) => {
          e.stopPropagation();
          setAliasInput(e.currentTarget.value);
        }}
      />
      <div className={bookmarkEditStyles.bookmarkEditButtonList}>
        <button
          type={"button"}
          className={bookmarkEditStyles.bookmarkEditSaveButton}
          onClick={(e) => {
            e.stopPropagation();
            saveEdit();
          }}
        >
          저장
        </button>
        <button
          type={"button"}
          className={bookmarkEditStyles.bookmarkEditCancleButton}
          onClick={(e) => {
            e.stopPropagation();
            cancelEdit();
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
};
