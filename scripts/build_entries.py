#!/usr/bin/env python3
"""Build entries.json from content/entries/*.md (Thai-only version)."""
import re, json
from pathlib import Path

ENTRIES_DIR = Path("content/entries")
OUT = Path("public/entries.json")

def parse_md(path):
    text = path.read_text(encoding="utf-8").strip()
    lines = text.splitlines()
    header = lines[0].strip()
    m = re.match(r"^#\s*(\d{4}-\d{2}-\d{2})\s*[—-]\s*(.+)$", header)
    date = m.group(1) if m else ""
    title_raw = m.group(2) if m else ""

    def extract(h):
        pat = rf"^## {h}\s*$"
        for i, ln in enumerate(lines):
            if re.match(pat, ln, re.I):
                body = []
                for j in range(i+1, len(lines)):
                    if lines[j].startswith("## "): break
                    body.append(lines[j])
                return "\n".join(body).strip()
        return ""

    title_th = extract("TITLE")
    tldr = extract("TLDR")
    body = extract("BODY")

    def hl(b, ml=220):
        first = b.strip().split("\n\n")[0].replace("\n"," ").strip()
        return (first[:ml-1]+"…") if len(first)>ml else first

    return {
        "id": f"entry-{date}-{re.sub(r'[^a-z0-9]+','-',title_raw.lower()).strip('-')[:40]}",
        "date": date,
        "title": {"th": title_th or title_raw},
        "highlight": {"th": hl(body or title_th)},
        "tldr": {"th": tldr or hl(body or title_th)},
        "body": {"th": body or title_th},
    }

def main():
    md_files = sorted(ENTRIES_DIR.glob("entry-*.md"))
    entries = [parse_md(f) for f in md_files]
    entries.sort(key=lambda e: e.get("date",""))
    OUT.write_text(json.dumps({"entries": entries}, ensure_ascii=False, indent=2), encoding="utf-8")
    for e in entries:
        th_title = e["title"]["th"][:50]
        print(f"{e['date']} | TH: {th_title}")

if __name__ == "__main__":
    main()
