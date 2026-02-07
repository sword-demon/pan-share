# Git Commit Skill

Analyze all changes and split them into logically grouped conventional commits.

## Workflow

### Step 1 - Analyze Changes

Run these commands in parallel to understand the full picture:

- `git status` - see all staged, unstaged, and untracked files
- `git diff --staged` - see staged changes
- `git diff` - see unstaged changes
- `git log --oneline -5` - see recent commit style for reference

### Step 2 - Group Changes Logically

Group changes by semantic concern, not by file type. Each group becomes one commit.

Grouping rules:

- Separate docs, features, fixes, styles, refactors, and chores
- Related file changes go together (e.g., a component + its test + its types)
- Config changes that support a feature go with that feature
- Independent fixes or improvements get their own commit

### Step 3 - Show Plan for Approval

Present the planned commits as a numbered list:

```
1. feat(scope): description
   - file1.ts
   - file2.ts

2. fix(scope): description
   - file3.ts

3. docs: description
   - README.md
```

Wait for user approval before executing. If the user wants to adjust grouping or messages, revise the plan.

### Step 4 - Execute Commits

For each planned commit:

1. Stage only the relevant files with `git add <specific files>`
2. Commit with conventional commit message using HEREDOC format:

```bash
git commit -m "$(cat <<'EOF'
type(scope): concise description

Optional body explaining WHY, not what.
EOF
)"
```

### Step 5 - Verify

Run `git log --oneline -N` (where N = number of new commits) to confirm all commits were created correctly.

## Conventional Commit Types

| Type | Usage |
|------|-------|
| feat | New feature or functionality |
| fix | Bug fix |
| docs | Documentation only |
| style | Code style, formatting, CSS changes |
| refactor | Code restructuring without behavior change |
| test | Adding or updating tests |
| chore | Build, config, tooling, dependencies |
| perf | Performance improvement |

## Rules

- NEVER push to remote unless the user explicitly says "push" or "push it"
- NEVER use `git add -A` or `git add .` - always add specific files
- NEVER use `--no-verify` unless user explicitly requests it
- NEVER amend existing commits unless user explicitly requests it
- Scope is optional but recommended - use the module or feature name
- Commit message body should explain WHY, not repeat WHAT the diff shows
- If a file has mixed concerns (e.g., a fix + a refactor), ask the user how to split it
- Keep commit messages under 72 characters for the subject line
