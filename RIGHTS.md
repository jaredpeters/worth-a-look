# Rights, licenses and disclaimers

Who owns each part of Skinder, what you may do with it, and what Skinder does not promise.

## 1. Not medical advice

Skinder is a practice game for learning to recognize skin spots. It does not diagnose anything, and your score says nothing about your own skin or health. Anything new, changing, bleeding, itching or worrying you should be seen by a doctor, whatever Skinder has taught you.

Skinder is provided "as is", without warranty of any kind (see [LICENSE](LICENSE)). The ISIC Archive, where the photos come from, makes the same point about its own content: it is for informational purposes only and is not medical advice ([ISIC terms](https://www.isic-archive.com/terms-conditions)).

## 2. The code

The code in this repository (HTML, CSS, JavaScript, Python and the server) is © 2026 Jared Peters, released under the [MIT license](LICENSE). You may use, copy, change and share it, including commercially, as long as the copyright notice stays with it.

## 3. The photos

**The photos are not part of this repository and are not covered by the MIT license.** Each one belongs to whoever contributed it to the [ISIC Archive](https://www.isic-archive.com), which is run by the International Skin Imaging Collaboration and hosted by Memorial Sloan Kettering Cancer Center. When you play, your browser loads each photo directly from the archive's image host.

Each contributor chose one of three Creative Commons licenses for their photos. The license for any photo is shown on its page in the archive.

| License | What it allows | Photos in Skinder |
|---|---|---|
| [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | Any use, no credit needed | 3,051 |
| [CC BY](https://creativecommons.org/share-your-work/cclicenses/) | Any use, including commercial, with credit | 1,191 |
| [CC BY-NC](https://creativecommons.org/share-your-work/cclicenses/) | Non-commercial use only, with credit | 4,917 |

Every answer card credits its photo the way the ISIC Archive asks: the photo's ISIC ID, the contributor's credit line, the license, and a link to the photo's page in the archive. Skinder shows the photos unchanged. They are scaled to fit the card, never cropped or edited.

### Skinder is non-commercial

Skinder is free. It has no ads, no paid features and no sponsorships, and it will not be sold. That keeps it within the CC BY-NC license that covers over half the photos.

If you fork Skinder and want to use it commercially, you must first remove the CC BY-NC photos. Each entry in `public/data/deck.json` has a `license` field, so they are easy to filter out. Using a CC BY-NC photo commercially needs separate permission from its contributor.

### The photo list

`public/data/deck.json` lists each photo's ID, web address, diagnosis, the patient's approximate age, sex and body site, and the license and credit line. This information comes from the ISIC Archive database, which the archive releases under [CC0](https://creativecommons.org/publicdomain/zero/1.0/) ([ISIC terms](https://www.isic-archive.com/terms-conditions)). The photos themselves stay under their own licenses.

## 4. The screenshots

The screenshots in `site/img/` show the Skinder interface and include photo ISIC_0024258 from the ISIC Archive, released under CC0. The interface in them is covered by the MIT license.

## 5. The fonts

Skinder uses [Archivo Black](https://github.com/Omnibus-Type/ArchivoBlack) and [Space Grotesk](https://github.com/floriankarsten/space-grotesk). Both are under the [SIL Open Font License 1.1](https://openfontlicense.org), and their license files are in `public/fonts/`. They are bundled with the app, so loading them sends no request to Google or anyone else.

## 6. Your privacy

- No accounts, no cookies, no analytics, no tracking.
- Your score is saved only in your own browser. Clearing your site data or pressing "Reset score" removes it.
- The only outside requests are for the photos, which your browser fetches from the ISIC Archive's image host on Amazon Web Services. Like any website, that host sees your IP address when it sends a photo.
- If someone hosts their own copy of Skinder, their server sees the requests for the page itself.

## 7. The patients in the photos

The photos show real people's skin. Contributors to the ISIC Archive are responsible for removing identifying details before submitting. The archive says it does not check this itself. Please don't try to work out who anyone is. If you think a photo could identify someone, report it to the ISIC Archive and [open an issue here](https://github.com/jaredpeters/skinder/issues), and it will be taken out of Skinder's photo list.

If you contributed a photo and want it removed from Skinder, open an issue with its ISIC ID.

## 8. Names

"ISIC" and "ISIC Archive" are used only to say where the photos come from. Skinder is an independent project and is not affiliated with or endorsed by the International Skin Imaging Collaboration or Memorial Sloan Kettering Cancer Center.

## Questions

[Open an issue](https://github.com/jaredpeters/skinder/issues).

*This page explains the licenses in plain language. It is not legal advice.*
