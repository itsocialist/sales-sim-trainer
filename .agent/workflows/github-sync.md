---
description: Sync sprint plans, stories, bugs, and requests to GitHub Issues
---
# GitHub Issue Sync Workflow

## Creating Issues from Sprint Plans

// turbo-all

1. **Read the sprint plan file**
   ```bash
   cat docs/sprints/sprint-<N>.md
   ```

2. **Create issues for each story** using the GitHub CLI:
   ```bash
   gh issue create \
     --title "S<N>-<ID>: <Story Title>" \
     --body "<Full story description with acceptance criteria>" \
     --label "story,sprint-<N>,<priority>,<domain>" \
     --assignee "<assignee>"
   ```

3. **Verify all issues created**
   ```bash
   gh issue list --label "sprint-<N>" --state open
   ```

## Creating Bug Issues

When a bug is found during development:
```bash
gh issue create \
  --title "BUG: <Short description>" \
  --body "## Steps to Reproduce\n1. ...\n\n## Expected\n...\n\n## Actual\n...\n\n## Environment\n..." \
  --label "bug,sprint-<N>,<priority>"
```

## Updating Issue Status

- Move to In Progress: add comment with status update
- Close completed: `gh issue close <number> --comment "Merged in PR #<pr>"`
- Add blockers: `gh issue comment <number> --body "BLOCKED: <reason>"`

## Sprint Review — Issue Audit

At the end of each sprint:
```bash
# List all open issues for the sprint
gh issue list --label "sprint-<N>" --state open

# List all closed issues for the sprint
gh issue list --label "sprint-<N>" --state closed

# Generate sprint burndown summary
echo "Open: $(gh issue list --label 'sprint-<N>' --state open --json number | jq length)"
echo "Closed: $(gh issue list --label 'sprint-<N>' --state closed --json number | jq length)"
```

## Carry-Over Issues

For stories not completed in a sprint:
```bash
# Remove old sprint label and add new one
gh issue edit <number> --remove-label "sprint-<N>" --add-label "sprint-<N+1>"
gh issue comment <number> --body "Carried over from Sprint <N> to Sprint <N+1>. Reason: <reason>"
```

## Labels Reference

| Label | Color | Purpose |
|-------|-------|---------|
| `sprint-1` through `sprint-6` | Various | Sprint assignment |
| `P0` | Red | Critical priority |
| `P1` | Orange | High priority |
| `P2` | Yellow | Medium priority |
| `story` | Green | User story |
| `bug` | Red | Bug report |
| `voice` | Purple | Voice/TTS/STT |
| `product-config` | Teal | Product & ICP |
| `design` | Light blue | UI/UX work |
| `sales-content` | Pink | Sales methodology |
| `infra` | Blue | Infrastructure |
