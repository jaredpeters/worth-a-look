"""Pick the two fixed 20-photo skill checks into public/data/checks.json.

The sets stay the same once picked, so scores from different days can be
compared; rebuilding the deck does not change them. Each set is 10 cancers and
10 harmless spots, all everyday camera photos confirmed by biopsy. Four photos
in each set show darker skin (Fitzpatrick IV-VI): two cancers and two harmless
spots. The game keeps all check photos out of normal rounds.

Version 2 (2026-10-06) added the darker-skin photos. Changing the sets again
means bumping VERSION, so old and new scores are never compared.

Usage: python3 scripts/make_checks.py --force   (overwrites the current sets)
"""
import json
import pathlib
import random
import sys

VERSION = 2
DATA = pathlib.Path(__file__).resolve().parent.parent / "public" / "data"
# (malignant, kind, darker skin?) for each of the 20 slots, per set.
SETS = [
    [(True, "melanoma", True), (True, "basal cell", True)] + [(True, "melanoma", False)] * 3
    + [(True, "basal cell", False)] * 3 + [(True, "squamous", False)] * 2,
    [(True, "squamous", True), (True, "basal cell", True)] + [(True, "melanoma", False)] * 4
    + [(True, "basal cell", False)] * 3 + [(True, "squamous", False)] * 1,
]
HARMLESS = [(False, "nevus", True), (False, "seborrheic", True)] + [(False, "nevus", False)] * 5 \
    + [(False, "seborrheic", False)] * 1 + [(False, None, False)] * 2
DARK = ("IV", "V", "VI")


def kind(c, word):
    dx = (c["dx"] or "").lower()
    if word is None:  # "other harmless": anything not already a named kind
        return not any(w in dx for w in ("nevus", "seborrheic"))
    return word in dx


def main():
    out = DATA / "checks.json"
    if out.exists() and "--force" not in sys.argv:
        raise SystemExit(f"{out} already exists; pass --force to pick new sets (and bump VERSION)")
    cards = json.loads((DATA / "deck.json").read_text())["cards"]
    pool = [c for c in cards if c["view"] == "clinical" and c["confirm"] == "biopsy"
            and c["age"] and c["site"]]
    rng = random.Random(20261006)
    used, sets = set(), []
    for slots in SETS:
        ids = []
        for malignant, word, dark in slots + HARMLESS:
            options = [c for c in pool if c["malignant"] == malignant and kind(c, word)
                       and (c.get("skin") in DARK) == dark and c["id"] not in used]
            pick = rng.choice(options)
            ids.append(pick["id"])
            used.add(pick["id"])
        sets.append(ids)
    out.write_text(json.dumps({"version": VERSION, "sets": sets}, indent=1))
    print("wrote", out, [len(s) for s in sets])


if __name__ == "__main__":
    main()
