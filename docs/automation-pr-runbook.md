# Automation PR runbook

This runbook describes the repository-local automation that verifies an existing branch, opens a draft pull request, and leaves a non-approving review comment.

## Purpose

Use the `Automation PR` workflow when an automation branch already exists and should be promoted into a reviewable draft PR with repeatable verification evidence.

The workflow is intentionally conservative:

- it runs `npm run verify` before creating or updating a PR,
- it creates draft PRs only,
- it submits a `COMMENT` review only,
- it does not approve, mark ready, merge, deploy, or change secrets.

## Manual dispatch inputs

Run the workflow from GitHub Actions on the default branch.

| Input | Required | Description |
| --- | --- | --- |
| `head_branch` | yes | Branch that already contains the automation changes. |
| `base_branch` | no | Target branch, normally `main`. |
| `task_id` | yes | Short identifier used in the PR title and review body. |
| `summary` | yes | Human-readable summary for the generated PR body. |
| `create_pr` | no | Set to `false` for no-op smoke runs. |

## Expected result

When `create_pr=true` and the branch has changes against `base_branch`, the workflow should:

1. verify the branch with `npm run verify`,
2. create or update one draft PR for the branch,
3. include changed files and verification output in the PR body,
4. leave a non-approving `COMMENT` review,
5. stop before approval, ready-for-review, merge, or deployment.

## Operator checklist

Before merging an automation-created PR:

- [ ] Confirm the branch diff matches the requested task.
- [ ] Confirm GitHub CI passed on the PR.
- [ ] Confirm the automation review is a comment, not an approval.
- [ ] Request human or Codex review when the change is non-trivial.
- [ ] Merge only after the protected-branch checks are satisfied.
