"""Build public/data/deck.json from the ISIC Archive.

Keeps images whose top-level diagnosis is Benign or Malignant, confirmed by
biopsy (histopathology). Everyday-camera photos of harmless spots are scarce
with a biopsy, so for those it also takes spots a panel of dermatologists
judged harmless from the photo ("single image expert consensus"); each card
records which kind of confirmation it has. Indeterminate cases are left out,
because there is no answer to grade a swipe against.

Usage: python3 scripts/build_deck.py [--derm-per-class 1500]
"""
import argparse
import json
import pathlib
import time
import urllib.parse
import urllib.request

API = "https://api.isic-archive.com/api/v2/images/search/"
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "data" / "deck.json"


def fetch(query, max_items=None):
    url = API + "?" + urllib.parse.urlencode({"query": query, "limit": 100})
    out = []
    while url and (max_items is None or len(out) < max_items):
        for attempt in range(4):
            try:
                with urllib.request.urlopen(url, timeout=60) as r:
                    page = json.load(r)
                break
            except Exception as e:  # network hiccup: back off and retry
                if attempt == 3:
                    raise
                print("  retry:", e)
                time.sleep(2 ** attempt)
        out.extend(page["results"])
        url = page["next"]
        print(f"  {len(out)} / {page['count']}", end="\r")
    print()
    return out[:max_items] if max_items else out


def card(r, view):
    c = r["metadata"].get("clinical", {})
    return {
        "id": r["isic_id"],
        "img": r["files"]["full"]["url"],
        "thumb": r["files"]["thumbnail_256"]["url"],
        "view": view,
        "malignant": c.get("diagnosis_1") == "Malignant",
        "dx": c.get("diagnosis_3") or c.get("diagnosis_2") or c.get("diagnosis_1"),
        "group": c.get("diagnosis_2"),
        "site": c.get("anatom_site_1"),
        "site_detail": c.get("anatom_site_3") or c.get("anatom_site_2"),
        "skin": c.get("fitzpatrick_skin_type"),  # Fitzpatrick type I-VI when the archive records it
        "age": c.get("age_approx"),
        "sex": c.get("sex"),
        "confirm": "biopsy" if c.get("diagnosis_confirm_type") == "histopathology" else "experts",
        "license": r.get("copyright_license"),
        "attribution": r.get("attribution"),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--derm-per-class", type=int, default=1500)
    args = ap.parse_args()

    base = 'diagnosis_confirm_type:"histopathology"'
    cards = []
    for dx in ("Malignant", "Benign"):
        q = f'{base} AND diagnosis_1:"{dx}" AND image_type:"clinical: close-up"'
        print("clinical", dx)
        cards += [card(r, "clinical") for r in fetch(q)]
        q = f'{base} AND diagnosis_1:"{dx}" AND image_type:"dermoscopic"'
        if dx == "Benign":
            qe = 'diagnosis_confirm_type:"single image expert consensus" AND diagnosis_1:"Benign" AND image_type:"clinical: close-up"'
            print("clinical Benign, expert consensus")
            cards += [card(r, "clinical") for r in fetch(qe)]
        print("dermoscopic", dx)
        cards += [card(r, "dermoscopic") for r in fetch(q, args.derm_per_class)]

    OUT.write_text(json.dumps({"built": time.strftime("%Y-%m-%d"), "cards": cards}, separators=(",", ":")))
    for view in ("clinical", "dermoscopic"):
        m = sum(1 for c in cards if c["view"] == view and c["malignant"])
        b = sum(1 for c in cards if c["view"] == view and not c["malignant"])
        print(f"{view}: {m} malignant, {b} benign")
    print("wrote", OUT, f"({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
