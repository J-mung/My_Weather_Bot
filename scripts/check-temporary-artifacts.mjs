#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanTargets = ["src", "public", "vite.config.ts"];
const ignoredDirectories = new Set(["node_modules", "dist", ".git", ".wrangler"]);
const ignoredExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg", ".woff", ".woff2"]);

const blockers = [
  {
    name: "FORCE flag",
    pattern: /\bFORCE_[A-Z0-9_]+\b/g,
    hint: "검증용 강제 flag는 커밋 전에 제거하세요.",
  },
  {
    name: "TEMP marker",
    pattern: /\bTEMP\([^\n)]*\)/g,
    hint: "임시 재현 marker는 확인 후 제거하세요.",
  },
  {
    name: "DEBUG_ONLY_COMMIT_BLOCKER marker",
    pattern: /\bDEBUG_ONLY_COMMIT_BLOCKER\b/g,
    hint: "커밋 차단용 debug marker가 남아 있습니다.",
  },
  {
    name: "HARDCODE marker",
    pattern: /\bHARDCODE(?:D)?\b/g,
    hint: "검증용 하드코딩 marker가 남아 있습니다.",
  },
];

const isTextFile = (filePath) => !ignoredExtensions.has(path.extname(filePath).toLowerCase());

const collectFiles = (targetPath) => {
  const absolutePath = path.resolve(root, targetPath);
  const stat = statSync(absolutePath, { throwIfNoEntry: false });

  if (!stat) return [];

  if (stat.isFile()) {
    return isTextFile(absolutePath) ? [absolutePath] : [];
  }

  if (!stat.isDirectory()) return [];

  const dirname = path.basename(absolutePath);
  if (ignoredDirectories.has(dirname)) return [];

  return readdirSync(absolutePath).flatMap((entry) => collectFiles(path.join(targetPath, entry)));
};

const formatRelativePath = (filePath) => path.relative(root, filePath);
const findings = [];

for (const filePath of scanTargets.flatMap(collectFiles)) {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const blocker of blockers) {
    for (const [index, line] of lines.entries()) {
      blocker.pattern.lastIndex = 0;
      const matches = [...line.matchAll(blocker.pattern)];

      for (const match of matches) {
        findings.push({
          file: formatRelativePath(filePath),
          line: index + 1,
          marker: match[0],
          name: blocker.name,
          hint: blocker.hint,
        });
      }
    }
  }
}

if (findings.length > 0) {
  console.error("임시 검증 코드 또는 강제 flag 후보가 발견되었습니다.\n");

  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.name}: ${finding.marker}`);
    console.error(`  ${finding.hint}`);
  }

  process.exit(1);
}

console.log("Temporary artifact check passed.");
