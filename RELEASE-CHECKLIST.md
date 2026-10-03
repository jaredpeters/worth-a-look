# Going public

Work through these before switching the repository to public.

1. Play 100 cards on a phone and fix anything that feels off.
2. Read the project page and README once more as a stranger would.
3. Check the git history has nothing personal in it: `git log -p | grep -iE "tailscal[e]|homela[b]|192\.168|100\.112|greenhill[s]|greenknol[l]|green-knol[l]"` should print nothing.
4. Switch the repository to public: `gh repo edit --visibility public --accept-visibility-change-consequences`
5. Turn on Pages with GitHub Actions as the source: `gh api -X POST repos/jaredpeters/skinder/pages -f build_type=workflow`
6. Run the Pages workflow: `gh workflow run Pages`, then open https://jaredpeters.github.io/skinder/
7. In `.github/workflows/pages.yml`, add the push trigger so every push to main republishes.
8. Add a description, website link and topics to the repository: `gh repo edit --description "..." --homepage https://jaredpeters.github.io/skinder/ --add-topic dermatology,skin-cancer,education,isic`
