---
description: Standard development cycle for SalesSim — feature branch, implement, verify, PR, merge
---
# Dev Cycle Workflow

## Steps

// turbo-all

1. **Check current branch and status**
   ```bash
   git status && git branch
   ```

2. **Create feature branch from main**
   ```bash
   git checkout -b feat/<story-id>-<short-description>
   ```

3. **Implement the feature**
   - Follow existing patterns in `app/src/`
   - Components → `app/src/components/`
   - API routes → `app/src/app/api/<endpoint>/route.ts`
   - Lib/data → `app/src/lib/`
   - Pages → `app/src/app/`

4. **Verify the dev server is running**
   ```bash
   cd /Users/briandawson/workspace/sales-sim-trainer/app && npm run dev
   ```

5. **Test in browser**
   - Open http://localhost:3000 (or whatever port is assigned)
   - Verify the feature works end-to-end

6. **Run lint and type checks**
   ```bash
   cd /Users/briandawson/workspace/sales-sim-trainer/app && npx tsc --noEmit && npm run lint
   ```

7. **Commit with conventional commit format**
   ```bash
   git add -A && git commit -m "<type>(<scope>): <description>"
   ```
   Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

8. **Push and create PR**
   ```bash
   git push -u origin HEAD
   ```
