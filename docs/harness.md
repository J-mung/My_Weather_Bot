# Harness workflow

This project uses a lightweight harness to keep Codex-assisted and human-authored changes safe before they enter `main`.

## Goals

- Verify repository quality independently of the deployment environment.
- Keep local and CI validation commands aligned.
- Catch known repeated mistakes with scripts instead of relying only on prompts.
- Preserve the existing project rules: no secret leakage, no accidental temporary debug code, and clear commit messages.

## CI gate

GitHub Actions runs on pull requests and pushes to `main`, `staging/**`, and `chore/**`.

The CI workflow runs:

```bash
npm ci
npm run check:temporary
npm test
npm run lint
npm run build
```

This is not a deployment workflow. Its purpose is to answer: "Is this code safe enough to merge into the repository?"

## Local verification

Before committing meaningful changes, run:

```bash
npm run verify
```

`npm run verify` runs the temporary artifact scan, tests, lint, and production build in the same order used for local completion checks.

## Temporary artifact scan

Use:

```bash
npm run check:temporary
```

The scanner checks source-facing files for markers that should not be committed, including:

- `FORCE_*`
- `TEMP(...)`
- `DEBUG_ONLY_COMMIT_BLOCKER`
- `HARDCODE` / `HARDCODED`

These markers are allowed while reproducing UI/error states locally, but they must be removed before commit.

## Commit message validation

Commit titles should follow:

```text
<gitmoji> <Korean summary>
```

Example:

```text
✨ 즐겨찾기 예보를 홈에서 바로 확인하게 개선
```

Validate a message manually:

```bash
npm run check:commit-msg -- --message "✨ 하네스 안정화 검증 추가"
```

Install the local `commit-msg` hook:

```bash
npm run hooks:install
```

Git hooks are local to each clone. If the hook is not installed, CI and review still provide repository-level protection, but local feedback will be later.

## Human approval boundaries

Ask for human approval before:

- changing deployment settings,
- changing secrets or environment variables,
- force-pushing shared branches,
- deleting branches/tags,
- enabling repository settings that require GitHub UI access.

## Recommended merge checklist

- [ ] `npm run verify` passes locally.
- [ ] CI passes on the branch or pull request.
- [ ] No temporary reproduction code remains.
- [ ] Commit message follows `gitmoji + Korean summary`.
- [ ] User-facing copy does not expose secret names, API keys, proxy paths, or internal-only details.
