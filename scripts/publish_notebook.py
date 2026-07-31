#!/usr/bin/env python3
"""Convert a saved Jupyter notebook into a Jekyll blog post."""

from __future__ import annotations

import argparse
import copy
import re
import shutil
import sys
from pathlib import Path

try:
    import nbformat
    from nbconvert import MarkdownExporter
except ImportError:
    sys.exit(
        "Notebook publishing tools are missing. Run:\n"
        "  VS Code → Tasks: Run Task → Blog: Set Up Notebook Tools"
    )


ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "blog" / "_posts"
ASSETS_DIR = ROOT / "blog" / "assets" / "notebooks"
ALLOWED_FOLDERS = {
    "Cosmology",
    "Machine Learning",
    "Generative Model",
    "Python",
}
FILENAME_PATTERN = re.compile(
    r"^(?P<date>\d{4}-\d{2}-\d{2})-(?P<slug>[a-z0-9]+(?:-[a-z0-9]+)*)\.ipynb$"
)
FRONT_MATTER_PATTERN = re.compile(
    r"\A---\s*\n(?P<yaml>.*?)\n---\s*(?:\n(?P<rest>.*))?\Z",
    re.DOTALL,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Publish a saved .ipynb file as a Jekyll post."
    )
    parser.add_argument("notebook", help="Path to the notebook file")
    return parser.parse_args()


def read_front_matter(source: str) -> tuple[str, str]:
    match = FRONT_MATTER_PATTERN.match(source.strip())
    if not match:
        raise ValueError(
            "The first cell must be Markdown and begin with Jekyll front matter "
            "between two --- lines."
        )

    yaml_text = match.group("yaml").strip()
    title_match = re.search(r"(?m)^title:\s*(.+?)\s*$", yaml_text)
    lang_match = re.search(r"(?m)^lang:\s*(en|ko)\s*$", yaml_text)
    if not title_match:
        raise ValueError("Front matter needs a title.")
    if not lang_match:
        raise ValueError("Front matter needs lang: en or lang: ko.")

    categories_match = re.search(
        r"(?ms)^categories:\s*\n(?P<items>(?:\s+-[^\n]+\n?)*)", yaml_text
    )
    if categories_match:
        categories = {
            item.strip().strip('"\'')
            for item in re.findall(
                r"(?m)^\s+-\s*(.+?)\s*$", categories_match.group("items")
            )
        }
        unsupported = categories - ALLOWED_FOLDERS
        if unsupported:
            allowed = ", ".join(sorted(ALLOWED_FOLDERS))
            raise ValueError(
                f"Unsupported folder: {', '.join(sorted(unsupported))}. "
                f"Use one of: {allowed}."
            )

    front_matter = f"---\n{yaml_text}\n---"
    remainder = (match.group("rest") or "").strip()
    return front_matter, remainder


def write_resources(resources: dict, slug: str) -> None:
    asset_dir = (ASSETS_DIR / slug).resolve()
    if asset_dir.exists():
        shutil.rmtree(asset_dir)

    outputs = resources.get("outputs", {})
    if not outputs:
        return

    output_folder = f"{slug}_files"
    for resource_name, data in outputs.items():
        resource_path = Path(resource_name)
        if resource_path.parts and resource_path.parts[0] == output_folder:
            relative_path = Path(*resource_path.parts[1:])
        else:
            relative_path = Path(resource_path.name)

        destination = (asset_dir / relative_path).resolve()
        if asset_dir not in destination.parents:
            raise ValueError(f"Unsafe notebook resource path: {resource_name}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(data, str):
            destination.write_text(data, encoding="utf-8")
        else:
            destination.write_bytes(data)


def publish(notebook_path: Path) -> Path:
    notebook_path = notebook_path.resolve()
    if not notebook_path.is_file():
        raise ValueError(f"Notebook not found: {notebook_path}")

    name_match = FILENAME_PATTERN.match(notebook_path.name)
    if not name_match:
        raise ValueError(
            "Notebook filename must look like YYYY-MM-DD-short-title.ipynb "
            "and use lowercase letters, numbers, and hyphens."
        )

    notebook = nbformat.read(notebook_path, as_version=4)
    if not notebook.cells or notebook.cells[0].cell_type != "markdown":
        raise ValueError("The first notebook cell must be a Markdown cell.")

    front_matter, opening_text = read_front_matter(notebook.cells[0].source)
    export_notebook = copy.deepcopy(notebook)
    export_notebook.cells = export_notebook.cells[1:]

    slug = name_match.group("slug")
    output_folder = f"{slug}_files"
    exporter = MarkdownExporter()
    body, resources = exporter.from_notebook_node(
        export_notebook,
        resources={"output_files_dir": output_folder},
    )
    body = body.replace(
        f"{output_folder}/", f"/blog/assets/notebooks/{slug}/"
    ).strip()
    write_resources(resources, slug)

    generated_notice = (
        f"<!-- Generated from {notebook_path.relative_to(ROOT)}. "
        "Edit the notebook, not this file. -->"
    )
    sections = [front_matter, generated_notice]
    if opening_text:
        sections.append(opening_text)
    if body:
        sections.append(body)

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    post_path = POSTS_DIR / f"{name_match.group('date')}-{slug}.md"
    post_path.write_text("\n\n".join(sections) + "\n", encoding="utf-8")
    return post_path


def main() -> None:
    args = parse_args()
    notebook_path = Path(args.notebook)
    if not notebook_path.is_absolute():
        notebook_path = ROOT / notebook_path

    try:
        result = publish(notebook_path)
    except (ValueError, OSError) as exc:
        sys.exit(f"Could not publish notebook: {exc}")

    print(f"Created {result.relative_to(ROOT)}")
    print("Review the generated post, then commit and push it with the notebook.")


if __name__ == "__main__":
    main()
