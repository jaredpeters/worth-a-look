# Release checklist

## Released 2026-10-03

- Repository made public as a fresh repo, so no commit from before the history cleanup is published.
- Project page and game published at https://jaredpeters.github.io/worth-a-look/, republished on every push to main.
- Checked on the live site: the page, the game, the skill check and the photo list all load, and the only other site contacted is the ISIC Archive's image host.

## Still to do

1. Have a dermatologist review the diagnosis notes in `public/notes.js`.
2. Play 100 cards on a phone and fix anything that feels off.
3. Delete the private archive copy of the old repository, which still holds the pre-cleanup history. It needs a GitHub permission the command line doesn't have yet:
   `gh auth refresh -h github.com -s delete_repo`, then `gh repo delete jaredpeters/worth-a-look-private-archive`

## Before any future history rewrite

Check nothing personal is in the history: `git log -p | grep -iE "tailscal[e]|homela[b]|192\.168|100\.112|greenhill[s]|greenknol[l]|green-knol[l]"` should print nothing.
