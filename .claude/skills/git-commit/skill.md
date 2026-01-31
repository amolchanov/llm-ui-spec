---
name: git-commit
user-invocable: true
description: Stage and commit changes with an auto-generated commit message. Use when the user wants to commit their work.
---

# git-commit

Stage and commit changes with an auto-generated summary.

## When to use

Use this skill when the user wants to:
- Commit changes
- Save their work to git
- Create a commit
- Commit all changes

Examples: "commit", "git commit", "commit changes", "save to git"

## Instructions

1. Run `git status --short` to see all changed files
2. Run `git diff` to see the actual changes (both staged and unstaged)
3. Run `git log --oneline -3` to see recent commit message style
4. Stage the relevant files using `git add` (prefer specific files over `git add -A`)
5. Generate a concise commit message that:
   - Summarizes the nature of the changes (new feature, bug fix, refactoring, etc.)
   - Focuses on the "why" rather than the "what"
   - Follows the repository's commit message style
6. Create the commit with the message ending with:
   ```
   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```

Do NOT commit files that likely contain secrets (.env, credentials.json, etc.).
