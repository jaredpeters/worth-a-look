# Skinder

A swipe game for learning which skin spots are worth showing a doctor.

Skinder shows you photos of moles and skin growths that were later checked by biopsy. Swipe left if it looks fine and right if you'd get it checked, and the real answer appears straight away.

<p>
  <img src="site/img/question.png" width="240" alt="A card waiting for your answer">
  <img src="site/img/swipe.png" width="240" alt="Swiping right to flag a spot">
  <img src="site/img/answer.png" width="240" alt="The biopsy answer">
</p>

> **Skinder is a practice game. It doesn't diagnose anything.** If a spot on your skin worries you, see a doctor.

## What's in it

- **9,159 photos from the [ISIC Archive](https://www.isic-archive.com)**, every one confirmed by biopsy. Photos the lab couldn't call either way are left out.
- **Naked eye mode:** 6,159 ordinary close-up photos, the view you have of your own skin.
- **Dermoscope mode:** 3,000 photos through the lit magnifier a skin doctor uses.
- **Head & neck mode:** the 1,925 everyday photos of the face, ears, neck and scalp, for barbers, hairdressers and estheticians. After each cancer it shows a sentence to say to a client. Research on why this matters is on the project page.
- Each round is half cancer and half harmless. A photo you get wrong comes back once, about 30 cards later.
- No accounts and no tracking. Your score is kept in your browser.

## Limits

- Half of every round is cancer. In real life almost every spot is harmless.
- The harmless photos were suspicious enough to biopsy, so they are harder than everyday moles.
- Most naked-eye cancers are basal cell carcinoma. Melanoma practice is stronger in dermoscope mode.
- Most photos show lighter skin.
- The archive has very few scalp photos.

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
| `public/` | The game: one HTML page and one script |
| `site/` | The project page |
| `scripts/build_deck.py` | Fetches biopsy-confirmed photos from the ISIC API |
| `server.mjs` | Small Express server. Serves the game at `/` and the project page at `/about/` |

## Rights and licenses

- **Code:** MIT license, © 2026 Jared Peters.
- **Photos:** not in this repo and not covered by the MIT license. Each belongs to its contributor to the [ISIC Archive](https://www.isic-archive.com), under CC0, CC BY or CC BY-NC. Every answer card shows the photo's ISIC ID, credit line and license, with a link to its archive page.
- **Non-commercial:** Skinder is free, with no ads, and will not be sold. Over half the photos are CC BY-NC, so a commercial fork must drop them first.
- **Screenshots** above use photo ISIC_0024258 (CC0).
- **Fonts:** Archivo Black and Space Grotesk, SIL Open Font License, bundled in `public/fonts/`.
- **Privacy:** no accounts, cookies or analytics. Photos load from the ISIC Archive's image host.

Full details, including the medical disclaimer and how to ask for a photo to be removed: [RIGHTS.md](RIGHTS.md).
