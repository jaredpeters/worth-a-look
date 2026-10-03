# Going public

Work through these before switching the repository to public.

1. Play 100 cards on a phone and fix anything that feels off.
2. Read the project page and README once more as a stranger would.
3. Check the git history has nothing personal in it: `git log -p | grep -iE "tailscal[e]|homela[b]|192\.168|100\.112|greenhill[s]|greenknol[l]|green-knol[l]"` should print nothing.
4. GitHub keeps commits from before the history cleanup reachable by their ID, even after a force push. To remove them for good, delete and recreate the repository, then push again:
   `gh repo delete jaredpeters/worth-a-look` (asks you to confirm), then `gh repo create jaredpeters/worth-a-look --private --source . --remote github --push`
5. Switch the repository to public: `gh repo edit --visibility public --accept-visibility-change-consequences`
6. Turn on Pages with GitHub Actions as the source: `gh api -X POST repos/jaredpeters/worth-a-look/pages -f build_type=workflow`
7. Run the Pages workflow: `gh workflow run Pages`, then open https://jaredpeters.github.io/worth-a-look/
8. In `.github/workflows/pages.yml`, add the push trigger so every push to main republishes.
9. Add a description, website link and topics to the repository: `gh repo edit --description "..." --homepage https://jaredpeters.github.io/worth-a-look/ --add-topic dermatology,skin-cancer,education,isic`
