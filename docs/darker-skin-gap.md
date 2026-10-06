# Darker skin: what's in the game, what's left out, and why

Checked against the ISIC Archive on 2026-10-06.

## The short version

- The ISIC Archive has **37 photos of cancer on darker skin** (Fitzpatrick types IV to VI). Worth a Look uses all 37.
- It has **2,443 photos of harmless spots on darker skin**. Worth a Look uses **57** of them, the ones whose diagnosis was confirmed by a biopsy or by a panel of dermatologists.
- Of the rest, **2,346** were labeled "harmless" by one clinician looking at the spot, with no biopsy and no second opinion. They are left out, for the reasons below. Adding them is an open question, not a settled no.
- Adding them would not fix the real gap. The gap is the 37 cancers, and no setting in this game can change that number.

## Where the numbers come from

Skin type is often not recorded. Among the photos in this game it's recorded for about 1 in 8, and across the whole archive for far fewer. Every count here is of photos where a skin type is recorded, so the true number of darker-skin photos could be higher. There is no reliable way to find the unrecorded ones.

Darker-skin harmless photos in the archive, by how the diagnosis was confirmed:

| Kind of photo | Confirmed by biopsy | Agreed by a panel of dermatologists | One clinician's assessment |
|---|---|---|---|
| Everyday close-up | 21 | 9 | 574 |
| Dermoscope | 27 | 0 | 1,772 |

About 40 more have no confirmation recorded, or are other kinds of photo.

What the game uses: 94 darker-skin photos in total. That's 34 cancers and 30 harmless spots in everyday photos, and 3 cancers and 27 harmless spots through a dermoscope.

## Why the 2,346 are left out

Every other photo in Worth a Look has a diagnosis confirmed by a biopsy, or agreed by several dermatologists. A single clinician's assessment is a weaker label. Most of the time it will be right, but when it's wrong, the photo is a spot that should have been checked and is marked harmless, and it teaches players to clear a spot like that.

Mixing these photos in would also create a double standard: the darker-skin harmless photos would be held to a lower bar than every other photo in the game.

## What the game does instead

The darker-skin photos it has are dealt about 1 card in 5, instead of fewer than 1 in 100. Players see darker skin regularly, at the cost of those few photos repeating sooner.

Each of the two skill-check sets includes 4 darker-skin photos (2 cancers, 2 harmless), scored separately so players can see how they do on darker skin. Those 8 photos are kept out of normal rounds, which leaves 30 darker-skin cancers and 26 harmless spots for everyday-photo practice.

## Options, if this is revisited

1. **Add the 574 everyday photos with a visible label.** The answer card would say "judged harmless by one doctor" instead of "confirmed by biopsy". That's honest about the weaker label, and it would multiply the darker-skin harmless photos in naked-eye mode by about 20.
2. **Leave them out** and put the effort into getting more darker-skin cancer photos, which is what's actually missing. See `tickets/001-stanford-ddi-permission.md`.

Option 2 matters either way. Option 1 is a judgment call that a dermatologist reviewer should weigh in on.

## Sources

- ISIC Archive search API: `https://api.isic-archive.com/api/v2/images/search/`, filtering on `fitzpatrick_skin_type`, `diagnosis_1` and `diagnosis_confirm_type`.
- `scripts/build_deck.py` shows exactly which photos the game takes.
