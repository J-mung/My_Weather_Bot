import { bookmarkPageStyles } from "./styles";

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
  return (
    <>
      <input
        type={"text"}
        className={bookmarkPageStyles.bookmarkEditInput}
        maxLength={20}
        placeholder={"별칭 입력 (최대 20자)"}
        value={aliasInput}
        onChange={(e) => setAliasInput(e.currentTarget.value)}
      />
      <div className={bookmarkPageStyles.bookmarkEditButtonList}>
        <button
          type={"button"}
          className={bookmarkPageStyles.bookmarkEditSaveButton}
          onClick={saveEdit}
        >
          저장
        </button>
        <button
          type={"button"}
          className={bookmarkPageStyles.bookmarkEditCancleButton}
          onClick={cancelEdit}
        >
          취소
        </button>
      </div>
    </>
  );
};
