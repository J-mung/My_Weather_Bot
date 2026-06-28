#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const readMessage = () => {
  const [firstArg, ...restArgs] = process.argv.slice(2);

  if (firstArg === "--message") {
    return restArgs.join(" ");
  }

  if (firstArg && existsSync(firstArg)) {
    return readFileSync(firstArg, "utf8");
  }

  if (firstArg) {
    return [firstArg, ...restArgs].join(" ");
  }

  return execSync("git log -1 --pretty=%B", { encoding: "utf8" });
};

const message = readMessage();
const title = message
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) => line && !line.startsWith("#"));

const titleHasEmojiPrefix = /^\p{Extended_Pictographic}/u.test(title ?? "");
const titleHasKorean = /[가-힣]/.test(title ?? "");

if (!title) {
  console.error("커밋 메시지 제목이 비어 있습니다.");
  process.exit(1);
}

if (!titleHasEmojiPrefix || !titleHasKorean) {
  console.error("커밋 메시지 규칙 위반: 제목은 `gitmoji + 한글 요약` 형식이어야 합니다.");
  console.error(`현재 제목: ${title}`);
  console.error("예시: ✨ 즐겨찾기 예보를 홈에서 바로 확인하게 개선");
  process.exit(1);
}

console.log("Commit message check passed.");
