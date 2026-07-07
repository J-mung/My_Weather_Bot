import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MetricStateCard } from "./MetricStateCard";

describe("MetricStateCard", () => {
  it("uses the common no-data image by default", () => {
    const markup = renderToStaticMarkup(
      <MetricStateCard
        title={"데이터를 불러오지 못했어요"}
        description={"데이터가 아직 준비되지 않았어요.\n잠시 후 다시 확인해 주세요."}
      />,
    );

    expect(markup).toContain("src=\"/images/no_data_image.png\"");
    expect(markup).toContain("width=\"180\"");
    expect(markup).toContain("aspect-video");
    expect(markup).toContain("w-[180px]");
    expect(markup).toContain("bg-[#F8FAFC]");
    expect(markup).toContain("loading=\"lazy\"");
    expect(markup).toContain("decoding=\"async\"");
    expect(markup).toContain("max-w-md");
    expect(markup).toContain("[word-break:keep-all]");
    expect(markup).toContain("[overflow-wrap:normal]");
    expect(markup).toContain(">데이터가 아직 준비되지 않았어요.</span>");
    expect(markup).toContain(">잠시 후 다시 확인해 주세요.</span>");
    expect(markup).not.toContain("whitespace-pre-line");
    expect(markup).not.toContain("break-words");
    expect(markup).not.toContain("<p");
  });

  it("can fall back to the icon-only state when an image is disabled", () => {
    const markup = renderToStaticMarkup(
      <MetricStateCard
        title={"데이터를 불러오지 못했어요"}
        description={"잠시 후 다시 확인해 주세요."}
        imageSrc={null}
      />,
    );

    expect(markup).not.toContain("src=\"/images/no_data_image.png\"");
  });

  it("renders a custom code label when provided", () => {
    const markup = renderToStaticMarkup(
      <MetricStateCard
        title={"데이터가 없어요"}
        description={"잠시 후 다시 확인해 주세요."}
        code={"MWB-NODATA-KMA-NOW"}
        codeLabel={"상태 코드"}
      />,
    );

    expect(markup).toContain("상태 코드:");
    expect(markup).toContain("MWB-NODATA-KMA-NOW");
    expect(markup).not.toContain("에러 코드:");
  });
});
