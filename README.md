# RookieRobotics

Documentation for building FTC and FRC robots, built with
[MkDocs Material](https://squidfunk.github.io/mkdocs-material/).

| Folder | What's in it |
| --- | --- |
| `docs/index.md` | Home page |
| `docs/ftc/` | FTC docs, written here |
| `docs/frc/` | FRC docs, **copied automatically** from [927-927/927-927.github.io](https://github.com/927-927/927-927.github.io) |

## Local preview

```bash
pip install -r requirements.txt
mkdocs serve
```

Then open <http://127.0.0.1:8000>. Pushing to `main` rebuilds the live site.

## Adding an FTC page

1. Create a new `.md` file under `docs/ftc/`.
2. Add it under `FTC:` in the `nav` section of `mkdocs.yml`.

## How the FRC docs stay in sync

Don't edit anything in `docs/frc/` or the FRC part of the `nav` in this repo;
edit 927-927.github.io instead. Changes made here get overwritten.

`scripts/sync_frc.py` copies that repo's `docs/` folder into `docs/frc/` and
rebuilds the FRC sidebar from its `mkdocs.yml` nav, so new, renamed and deleted
pages carry over. The `Sync FRC docs and deploy` workflow runs it, commits any
changes, and redeploys the site:

- on every push to `main` here,
- every hour (only redeploys if the FRC docs changed),
- when you click **Run workflow** on the Actions tab,
- when 927-927.github.io tells it to (optional, see below).

Only the docs and the nav are synced. If you change other settings in
927-927.github.io's `mkdocs.yml` (theme features, markdown extensions),
copy them into this `mkdocs.yml` by hand.

To sync by hand from a local checkout:

```bash
python scripts/sync_frc.py ../roboedu/927-927.github.io
```

### Instant updates (optional)

Without this, FRC changes show up here within about an hour. To have them show
up as soon as 927-927.github.io deploys:

1. Create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)
   with **Resource owner** set to `Rookie-Robotics`, access to only
   `Rookie-Robotics/Rookie-Robotics.github.io`, and the
   **Contents: Read and write** permission.
2. In 927-927.github.io, go to **Settings → Secrets and variables → Actions**
   and add it as a secret named `ROOKIEROBOTICS_TOKEN`.
3. Add this job to the end of 927-927.github.io's `.github/workflows/deploy.yml`:

   ```yaml
     notify-rookierobotics:
       needs: deploy
       runs-on: ubuntu-latest
       steps:
         - run: >
             curl -fsS -X POST
             -H "Authorization: Bearer ${{ secrets.ROOKIEROBOTICS_TOKEN }}"
             -H "Accept: application/vnd.github+json"
             https://api.github.com/repos/Rookie-Robotics/Rookie-Robotics.github.io/dispatches
             -d '{"event_type":"frc-docs-updated"}'
   ```

## GitHub Pages setup

In this repo's **Settings → Pages**, set **Source** to **GitHub Actions**.
