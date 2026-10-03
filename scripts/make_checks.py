"""Pick the two fixed 20-photo skill checks into public/data/checks.json.

Run once. The sets stay the same afterwards so scores from different days can be
compared; rebuilding the deck does not change them. Each set is 10 cancers and
10 harmless spots, all everyday camera photos confirmed by biopsy:
4 melanoma, 4 basal cell, 2 squamous cell; 6 moles, 2 seborrheic keratoses,
2 other harmless spots. The game keeps these photos out of normal rounds.

Usage: python3 scripts/make_checks.py
"""
import json
import pathlib
import random

DATA = pathlib.Path(__file__).resolve().parent.parent / "public" / "data"
MIX = [
    (True, "melanoma", 4), (True, "basal cell", 4), (True, "squamous", 2),
    (False, "nevus", 6), (False, "seborrheic", 2), (False, None, 2),
]


def kind(c, word):
    dx = (c["dx"] or "").lower()
    if word is None:  # "other harmless": anything not already a named kind
        return not any(w in dx for w in ("nevus", "seborrheic"))
    return word in dx


def main():
    out = DATA / "checks.json"
    if out.exists():
        raise SystemExit(f"{out} already exists; delete it on purpose to pick new sets")
    cards = json.loads((DATA / "deck.json").read_text())["cards"]
    pool = [c for c in cards if c["view"] == "clinical" and c["confirm"] == "biopsy"
            and c["age"] and c["site"]]
    rng = random.Random(20261003)
    used, sets = set(), []
    for _ in range(2):
        ids = []
        for malignant, word, n in MIX:
            options = [c for c in pool if c["malignant"] == malignant and kind(c, word) and c["id"] not in used]
            pick = rng.sample(options, n)
            ids += [c["id"] for c in pick]
            used.update(ids)
        sets.append(ids)
    out.write_text(json.dumps({"sets": sets}, indent=1))
    print("wrote", out, [len(s) for s in sets])


if __name__ == "__main__":
    main()
