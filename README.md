# Worth a Look

A swipe game for learning which skin spots are worth showing a doctor.

Worth a Look shows you real photos of moles and skin growths whose diagnosis is known. Swipe left if it looks fine and right if you'd get it checked, and the real answer appears straight away.

<p>
  <img src="site/img/question.png" width="240" alt="A card waiting for your answer">
  <img src="site/img/swipe.png" width="240" alt="Swiping right to flag a spot">
  <img src="site/img/answer.png" width="240" alt="The answer">
</p>

> **Worth a Look is a practice game. It doesn't diagnose anything.** If a spot on your skin worries you, see a doctor.

## Why this exists

People miss many skin cancers on their own, especially on the scalp, head and neck. Barbers, hairdressers and estheticians see those places up close every few weeks. In one study, hairdressers first spotted 10% of the scalp and neck melanomas a cancer center treated. Few of these professionals have had any skin cancer training, and most say they'd like some. Studies show short training helps. Worth a Look adds free practice on hundreds of real cases. The research is on the project page.

## What's in it

- **9,595 photos from the [ISIC Archive](https://www.isic-archive.com)** with a known diagnosis. Every cancer was confirmed by biopsy, and so was every harmless spot except 406 everyday photos that dermatologists agreed were harmless from the photo. Photos with no clear answer are left out.
- **Naked eye mode:** 6,565 ordinary close-up photos, the view you have of your own skin.
- **Dermoscope mode:** 3,030 photos through the lit magnifier a skin doctor uses.
- **Head & neck mode:** the 2,085 everyday photos of the face, ears, neck and scalp, for barbers, hairdressers and estheticians. After each cancer it shows a sentence to say to a client. Research on why this matters is on the project page.
- Rounds of 20 photos, 6 of them cancer, ending with your score and a chart of your recent rounds. A photo you get wrong comes back once, two rounds later.
- **Skill check:** 20 fixed photos, half cancer and 4 on darker skin, with no answers until the end. Darker skin gets its own score. Take it again after some practice to see how much you've improved. Two sets take turns, and neither appears in normal rounds.
- **What it often looks like:** for the five most common diagnoses, the answer card can show a short description of what that diagnosis usually looks like, with a link to the NHS or American Academy of Dermatology page it's based on.
- **Spot checklist:** one page to open at the chair, listing when to suggest a doctor (new or changing, the ABCD signs, sores that won't heal, and what to check on darker skin). Open it from the game, or go straight to `checklist.html`.
- **Two styles:** Bold, and a rounder Soft style. Switch at the bottom of the game.
- No accounts and no tracking. Your score is kept in your browser.

## Limits

- 6 in every 20 photos are cancer. In real life almost every spot is harmless, and the round summary says so.
- Most harmless photos were suspicious enough to biopsy, so they are harder than everyday moles.
- Most naked-eye cancers are basal cell carcinoma. Melanoma practice is stronger in dermoscope mode.
- **Known gap: darker skin.** Only 94 of the 9,595 photos are recorded as darker skin (Fitzpatrick IV to VI): 37 cancers, which is every one in the archive, and 57 harmless spots. The archive has about 2,400 more darker-skin harmless photos, but almost all were labeled by one clinician without a biopsy, so they're left out. [docs/darker-skin-gap.md](docs/darker-skin-gap.md) explains the numbers and the choice. The game deals them about 1 time in 5 so players see them at all. Some collections that would help exist but are locked for research use; see the project page and `tickets/001-stanford-ddi-permission.md`.
- The archive has very few scalp photos.
- The diagnosis notes and the spot checklist have not yet been reviewed by a dermatologist.

## Run it

```sh
npm install
npm start            # http://localhost:8140
```

Or `docker compose up -d`.

The photo list (`public/data/deck.json`) ships with the repo. To rebuild it from the archive:

```sh
python3 scripts/build_deck.py
```

## Layout

| Path | What it is |
|---|---|
| `public/` | The game (`index.html`, `app.js`), the spot checklist (`checklist.html`), the diagnosis notes (`notes.js`) and the Soft skin (`skins/`) |
| `site/` | The project page |
| `scripts/make_checks.py` | Picks the two fixed skill-check sets (run once) |
| `public/notes.js` | The diagnosis notes and their sources |
| `scripts/build_deck.py` | Fetches photos with a confirmed diagnosis from the ISIC API |
| `server.mjs` | Small Express server. Serves the game at `/` and the project page at `/about/` |

## Rights and licenses

- **Code:** MIT license, © 2026 Jared Peters.
- **Photos:** not in this repo and not covered by the MIT license. Each belongs to its contributor to the [ISIC Archive](https://www.isic-archive.com), under CC0, CC BY or CC BY-NC. Every answer card shows the photo's ISIC ID, credit line and license, with a link to its archive page.
- **Non-commercial:** Worth a Look is free, with no ads, and will not be sold. Over half the photos are CC BY-NC, so a commercial fork must drop them first.
- **Screenshots** above use photo ISIC_0024258 (CC0).
- **Fonts:** Archivo Black, Space Grotesk, Fraunces and DM Sans, SIL Open Font License, bundled in `public/fonts/`.
- **Privacy:** no accounts, cookies or analytics. Photos load from the ISIC Archive's image host.

Full details, including the medical disclaimer and how to ask for a photo to be removed: [RIGHTS.md](RIGHTS.md).
