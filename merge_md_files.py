from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import List

GUIDE_FILENAMES = {
    "AGENT_INSTRUCTIONS.md",
    "ARCHITECTURE.md",
    "CONVENTIONS.md",
    "API_CONTRACT.md",
    "TODO.md",
    "ROUTES_AND_PAGES.md",
    "UI_FLOWS.md",
    "mcp/README.md",
    "services/gateway_service/README.md",
}


def collect_markdown_files(root: Path) -> List[Path]:
    """Walk backend/frontend folders and return guidance markdown files sorted lexicographically."""
    md_files: List[Path] = []
    for subdir in ("swimbuddz-backend", "swimbuddz-frontend"):
        base = root / subdir
        if not base.exists():
            continue
        for path in base.rglob("*.md"):
            if path.is_file() and path.name in GUIDE_FILENAMES:
                md_files.append(path)
    return sorted(md_files)


def build_document(root: Path, files: List[Path]) -> str:
    """Concatenate markdown files with headings showing relative paths."""
    sections: List[str] = []
    for path in files:
        rel = path.relative_to(root)
        sections.append(f"# {rel}\n")
        sections.append(path.read_text())
        sections.append("\n\n")
    return "".join(sections)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Merge backend and frontend markdown docs."
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("merged_docs.md"),
        help="Output file path (default: merged_docs.md).",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    files = collect_markdown_files(root)
    if not files:
        raise SystemExit(
            "No markdown files found under swimbuddz-backend or swimbuddz-frontend."
        )

    merged = build_document(root, files)
    output_path = args.output if args.output.is_absolute() else root / args.output
    output_path.write_text(merged)
    print(f"Wrote {len(files)} markdown files into {output_path}")


if __name__ == "__main__":
    main()
