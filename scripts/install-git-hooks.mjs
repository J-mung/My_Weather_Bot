#!/usr/bin/env node
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const hooksDir = path.join(root, ".git", "hooks");

if (!existsSync(path.join(root, ".git"))) {
  console.error(".git 디렉터리를 찾을 수 없습니다. 저장소 루트에서 실행하세요.");
  process.exit(1);
}

mkdirSync(hooksDir, { recursive: true });

const commitMsgHook = `#!/usr/bin/env sh
node scripts/validate-commit-msg.mjs "$1"
`;

const commitMsgPath = path.join(hooksDir, "commit-msg");
writeFileSync(commitMsgPath, commitMsgHook, "utf8");
chmodSync(commitMsgPath, 0o755);

console.log("Installed git hook: .git/hooks/commit-msg");
