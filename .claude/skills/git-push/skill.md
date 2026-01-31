---
name: git-push
user-invocable: true
description: Squash local commits, create a combined commit message, and push to origin. Use when the user wants to push code to the remote repository.
---

# git-push

Squash all local commits into one and push to origin.

## When to use

Use this skill when the user wants to:
- Push changes to origin
- Push to remote
- Push to main
- Upload code to GitHub

Examples: "push to origin", "git push", "push it", "push changes"

## Instructions

1. Get the current branch name:
   ```bash
   git branch --show-current
   ```

2. Check for uncommitted changes with `git status --short`
   - If there are uncommitted changes, stage and commit them first:
     ```bash
     git add -A
     git commit -m "WIP changes"
     ```

3. Count how many commits are ahead of origin:
   ```bash
   git rev-list --count origin/<branch>..HEAD
   ```

4. If there are multiple local commits (count > 1):
   - Get all commit messages for local commits:
     ```bash
     git log --oneline origin/<branch>..HEAD
     ```
   - Squash all local commits into one:
     ```bash
     git reset --soft origin/<branch>
     ```
   - Create a combined commit message that summarizes all changes:
     - Use a clear, descriptive title (max 72 chars)
     - If multiple features/fixes, list them as bullet points in the body
     - End with:
       ```
       Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
       ```
   - Commit with the combined message:
     ```bash
     git commit -m "<combined message>"
     ```

5. Push to origin:
   ```bash
   git push origin <branch>
   ```

Do NOT commit files that likely contain secrets (.env, credentials.json, etc.).
