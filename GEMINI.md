# GEMINI.md — Google Gemini / Antigravity Instructions for SwimBuddz

Read and follow [`AGENTS.md`](./AGENTS.md), [`docs/DECISIONS.md`](./docs/DECISIONS.md), and [`CLAUDE.MD`](./CLAUDE.MD) before making any product, architecture, or code changes.

## Non-Negotiable Agent Habit
1. **Check `docs/DECISIONS.md` First:** Never override or simplify away a settled product, financial, or operational decision recorded in [`docs/DECISIONS.md`](./docs/DECISIONS.md) or [`swimbuddz-backend/docs/`](./swimbuddz-backend/docs/).
2. **Always Update Docs When Deliberating:** Whenever you and the user think through or decide on a feature, workflow, pricing rule, or architectural design, **update [`docs/DECISIONS.md`](./docs/DECISIONS.md) (and its mirror [`swimbuddz-backend/docs/DECISIONS.md`](./swimbuddz-backend/docs/DECISIONS.md)) plus the relevant domain documentation in the same turn**, explaining both *what* was decided and *why*.
3. **Keep Worktrees & Caches Clean:** Always work on the latest `origin/main` / `origin/develop` in `swimbuddz-backend` and `swimbuddz-frontend`, and avoid leaving redundant git worktrees or `.next` build caches behind.
