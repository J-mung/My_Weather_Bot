# GitHub repository settings checklist

These settings complement the repository CI workflow. They are configured in GitHub, not in source code, so a repository maintainer must apply them manually.

## Branch protection for `main`

Recommended settings:

- [ ] Require a pull request before merging.
- [ ] Require status checks to pass before merging.
- [ ] Add the `CI / Test, lint, and build` workflow as a required status check after it has run at least once.
- [ ] Require branches to be up to date before merging when collaboration volume increases.
- [ ] Restrict force pushes to `main`.
- [ ] Restrict branch deletion for `main`.

## Actions permissions

Recommended settings:

- [ ] Keep default workflow permissions read-only unless a workflow needs write access.
- [ ] Do not store API keys in repository files.
- [ ] Use GitHub Actions secrets only for future deployment workflows, not for the current CI-only workflow.

## Merge workflow

Recommended flow:

```text
feature/staging/chore branch
→ pull request
→ CI passes
→ human review or self-review checklist
→ merge to main
```

## Notes

The current CI workflow validates repository quality only. It does not deploy to Cloudflare Workers or any other runtime.
