"""Copy the FRC docs from the 927-927.github.io repo into docs/frc/.

Usage:
    python scripts/sync_frc.py <path to a checkout of 927-927.github.io>

What it does:
  1. Replaces docs/frc/ with the source repo's docs/ folder (pages, images,
     stylesheets and scripts), so deleted pages are deleted here too.
  2. Rebuilds the FRC part of the sidebar in mkdocs.yml from the source
     repo's nav, between the "FRC nav" marker comments.

Everything else in this repo (FTC pages, home page, mkdocs.yml settings) is
left alone. The GitHub Actions workflow runs this on every deploy.
"""

import json
import re
import shutil
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DEST_DOCS = ROOT / "docs" / "frc"
MKDOCS_YML = ROOT / "mkdocs.yml"
PREFIX = "frc/"

BEGIN_MARKER = "# >>> FRC nav"
END_MARKER = "# <<< FRC nav"


class _NavLoader(yaml.SafeLoader):
    """SafeLoader that ignores the !!python/name tags used for emoji settings."""


_NavLoader.add_multi_constructor(
    "tag:yaml.org,2002:python/", lambda loader, suffix, node: None
)


def read_source_nav(source: Path) -> list:
    config = yaml.load((source / "mkdocs.yml").read_text(encoding="utf-8"), _NavLoader)
    nav = config.get("nav")
    if not nav:
        sys.exit(f"{source / 'mkdocs.yml'} has no nav section")
    return nav


def prefix_paths(entry):
    if isinstance(entry, str):
        return entry if "://" in entry else PREFIX + entry
    if isinstance(entry, list):
        return [prefix_paths(item) for item in entry]
    return {title: prefix_paths(value) for title, value in entry.items()}


def build_frc_nav(source_nav: list) -> list:
    # The source's home page becomes the FRC section's own page
    # (navigation.indexes shows it when you click "FRC" in the sidebar).
    home, rest = [], []
    for item in source_nav:
        target = item if isinstance(item, str) else next(iter(item.values()))
        (home if target == "index.md" else rest).append(item)
    nav = [PREFIX + "index.md"] if home else []
    return nav + [prefix_paths(item) for item in rest]


def quote(value: str) -> str:
    plain = re.fullmatch(r"\w[\w .()/-]*", value) and not value.endswith(" ")
    if plain and yaml.safe_load(value) == value:
        return value
    return json.dumps(value, ensure_ascii=False)


def emit(items: list, indent: int) -> list:
    pad = " " * indent
    lines = []
    for item in items:
        if isinstance(item, str):
            lines.append(f"{pad}- {quote(item)}")
            continue
        for title, value in item.items():
            if isinstance(value, str):
                lines.append(f"{pad}- {quote(title)}: {quote(value)}")
            else:
                lines.append(f"{pad}- {quote(title)}:")
                lines.extend(emit(value, indent + 4))
    return lines


def write_nav(frc_nav: list) -> None:
    text = MKDOCS_YML.read_text(encoding="utf-8")
    pattern = re.compile(
        rf"(^[ \t]*{re.escape(BEGIN_MARKER)}[^\n]*\n)(.*?)(^[ \t]*{re.escape(END_MARKER)})",
        re.M | re.S,
    )
    if not pattern.search(text):
        sys.exit(f"Could not find the '{BEGIN_MARKER}' / '{END_MARKER}' comments in mkdocs.yml")
    block = "\n".join(["  - FRC:", *emit(frc_nav, 6)]) + "\n"
    MKDOCS_YML.write_text(
        pattern.sub(lambda m: m.group(1) + block + m.group(3), text, count=1),
        encoding="utf-8",
        newline="\n",
    )


def copy_docs(source: Path) -> None:
    if DEST_DOCS.exists():
        shutil.rmtree(DEST_DOCS)
    shutil.copytree(source / "docs", DEST_DOCS)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    source = Path(sys.argv[1]).resolve()
    if not (source / "docs").is_dir() or not (source / "mkdocs.yml").is_file():
        sys.exit(f"{source} doesn't look like the FRC docs repo (no docs/ or mkdocs.yml)")

    frc_nav = build_frc_nav(read_source_nav(source))
    copy_docs(source)
    write_nav(frc_nav)
    print(f"Synced {source / 'docs'} -> {DEST_DOCS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
