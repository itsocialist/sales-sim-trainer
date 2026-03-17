---
description: Sprint ceremonies for SalesSim — kickoff, standup check, review, retro, and sprint close
---
# Sprint Ceremony Workflow

## Sprint Kickoff

1. **Review the sprint plan** in `docs/sprints/sprint-<N>.md`
2. **Verify all stories are scoped** — each has acceptance criteria, story points, and assignee
3. **Check dependencies** — are blockers from the prior sprint resolved?
4. **Confirm environment** — dev server runs, API keys are active, git is clean
5. **Set sprint goal** — one sentence summary of what "done" means for this sprint

## Daily Standup Check

1. **Read sprint file** for current story status
2. **Update status** — mark stories as `🔵 In Progress`, `🟡 Blocked`, or `✅ Done`
3. **Note any blockers** in the sprint file
4. **Check git log** for recent commits against the sprint stories

## Sprint Review / Demo

1. **Start the dev server**
   ```bash
   cd /Users/briandawson/workspace/sales-sim-trainer/app && npm run dev
   ```
2. **Walk through each completed story** — demonstrate the feature in-browser
3. **Capture screenshots or recordings** in `docs/sprints/sprint-<N>-review/`
4. **Note any incomplete stories** and their carry-over rationale

## Sprint Retro

1. **What went well?** — Document in sprint file
2. **What didn't?** — Document with specific improvement actions
3. **Action items** — Add as stories or tasks to the next sprint

## Sprint Close

1. **Tag the release**
   ```bash
   git tag -a v0.<sprint>.0 -m "Sprint <N> release"
   git push origin v0.<sprint>.0
   ```
2. **Update sprint status** to `✅ CLOSED` in the sprint file
3. **Create next sprint file** from template
