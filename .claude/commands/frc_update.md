---
description: Pull the newest FRC docs from 927-927.github.io into docs/frc, build, commit and push
allowed-tools: Bash(git:*), Bash(.venv/Scripts/python.exe:*), Bash(python:*), Read, Edit, Grep, Glob
---

Update the FRC docs in this repo from the newest version of
927-927/927-927.github.io on GitHub, then publish it. Work through these steps
without stopping to ask, unless a step says to stop.

1. **Start clean.** Run `git status --porcelain`. If anything under
   `docs/frc/`, `mkdocs.yml` or `scripts/` is already changed, stop and tell me,
   so unrelated edits don't end up in the sync commit. Otherwise run
   `git pull --rebase origin main`, so any sync commits the GitHub Actions
   workflow already pushed are here first.

2. **Get the newest source.** Use the clone in `.frc-source/` (gitignored, the
   same folder the workflow uses), not my working checkout, so only what's
   pushed to GitHub gets synced:
   - if `.frc-source/.git` doesn't exist:
     `git clone https://github.com/927-927/927-927.github.io .frc-source`
   - otherwise: `git -C .frc-source fetch origin`, then
     `git -C .frc-source reset --hard origin/main`

3. **Sync.** Run `.venv/Scripts/python.exe scripts/sync_frc.py .frc-source`
   (plain `python` if there's no `.venv`), then
   `git add -A -- docs/frc mkdocs.yml` and `git diff --cached --stat`. Go by
   that, not `git status`: on Windows, rewritten files whose only difference is
   line endings show as modified there but have nothing to commit. If nothing
   is staged, tell me the FRC docs are already up to date with the source's
   `git -C .frc-source log -1 --format="%h %s"` and go to step 7.

4. **Carry over settings the script doesn't sync.** Compare
   `.frc-source/mkdocs.yml` with this repo's `mkdocs.yml`. Ignore `nav`,
   `site_name`, `site_url`, `repo_url`, `repo_name` and `exclude_docs` (the
   script handles those). If the source added or removed anything in
   `extra_css`, `extra_javascript`, `markdown_extensions`, `theme` or
   `plugins`, make the same change here. Paths in `extra_css` and
   `extra_javascript` get a `frc/` prefix. Don't edit the FRC nav block by hand.

5. **Build.** Run `.venv/Scripts/python.exe -m mkdocs build --strict`. If it
   fails because of this repo's own files (`mkdocs.yml`, `scripts/`), fix
   them. If it fails because of a synced page (say, a broken link in
   927-927.github.io), stop and tell me which page and what's wrong, because
   anything fixed in `docs/frc/` gets overwritten on the next sync.

6. **Commit and push.** Stage anything you changed in steps 4 and 5 too (the
   sync itself is already staged). For the message, find the last synced source commit with
   `git log -1 --format=%s --grep="927-927.github.io@"` and list what came in
   since with `git -C .frc-source log --format="%h %s" <that sha>..HEAD`. If
   there isn't one, read the diff instead. Commit with the subject
   `Sync FRC docs from 927-927/927-927.github.io@<short sha>`, then a blank line
   and a short summary of the pages added, changed or removed. Then run
   `git push origin main`, which starts the deploy workflow.

7. **Report** in a few lines: the source commit synced, the pages added,
   changed or removed, anything you changed in step 4 or 5, and whether the
   push went through. If `../roboedu/927-927.github.io` exists and has
   uncommitted changes or commits not yet pushed to GitHub, say so. Those
   weren't included, and the hourly workflow only syncs what's on GitHub.
