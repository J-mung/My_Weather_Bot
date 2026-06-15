import type { AppErrorMeta } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { ErrorNotice } from "@/shared/ui/error-notice";
import { Icon } from "@/shared/ui/icon";
import { bookmarkCurrentLocationStyles } from "./styles";

export const CurrentLocationErrorCard = ({ errorMeta }: { errorMeta: AppErrorMeta }) => {
  return (
    <div className={cn(bookmarkCurrentLocationStyles.card)}>
      <div className={cn(bookmarkCurrentLocationStyles.header)}>
        <div className={"min-w-0"}>
          <span className={cn(bookmarkCurrentLocationStyles.eyebrow)}>현재 위치</span>
          <h2 className={cn(bookmarkCurrentLocationStyles.title)}>
            현재 위치를 불러오지 못했어요
          </h2>
        </div>
        <Icon
          name={"error"}
          size={"lg"}
          tone={"danger"}
          className={cn(bookmarkCurrentLocationStyles.icon)}
        />
      </div>

      <div className={cn(bookmarkCurrentLocationStyles.body)}>
        <ErrorNotice
          title={"현재 위치 확인이 필요해요"}
          description={errorMeta.description}
          code={errorMeta.code}
          variant={"card"}
        />
        <span className={cn(bookmarkCurrentLocationStyles.placeholderText)}>
          위치 권한을 허용하거나 검색에서 지역을 추가해 주세요.
        </span>
      </div>
    </div>
  );
};
