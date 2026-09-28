# Font licensing

| file | family | foundry / owner | status |
|---|---|---|---|
| chevysans-medium.woff2 | ChevySans 500 | General Motors (brand face) | license confirmed by site owner for this host (2026-09-28) |
| chevysans-demi.woff2 | ChevySans 600 | General Motors | confirmed (2026-09-28) |
| chevysans-bold.woff2 | ChevySans 700 | General Motors | confirmed (2026-09-28) |
| chevysans-black.woff2 | ChevySansBlack 900 | General Motors | confirmed (2026-09-28) |

Remove path: delete the woff2 files and the @font-face rules in styles/fonts.css; every stack falls back to the
metric-matched `chevysans-fallback` / `chevysansblack-fallback` faces (Arial) declared in styles/styles.css.
