# Contributing

Thanks for your interest in contributing.

## Scope
This is a public portfolio project. PRs are welcome for:
- bug fixes
- documentation improvements
- performance and accessibility improvements
- developer experience improvements

## Before opening a PR
1. Open an issue first for non-trivial changes.
2. Keep changes focused and small.
3. Avoid introducing heavy dependencies without strong justification.

## Local workflow
```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run seed
npm run lint
npm run build
```

## Pull request checklist
- [ ] Clear description of what changed and why
- [ ] No secrets or credentials added
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Docs updated when behavior/config changed

## Style
- TypeScript-first.
- Keep comments concise and meaningful.
- Prefer incremental, reviewable commits.
