import type { KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchPageStyles } from "./styles";

export default function SearchPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.focus();
  }, [inputRef]);

  const onEnterSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (e.currentTarget.value === "") {
        alert("검색어를 입력해 주세요.");
        return;
      }

      navigate("/", { replace: true });
    }
  };

  return (
    <div className={searchPageStyles.page}>
      <div className={searchPageStyles.searchWrap}>
        <input
          aria-label="검색어 입력"
          ref={inputRef}
          className={searchPageStyles.searchInput}
          placeholder="검색어 입력..."
          type="text"
          onKeyDown={onEnterSearch}
        />
      </div>
    </div>
  );
}
