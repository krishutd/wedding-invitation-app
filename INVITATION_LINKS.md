# Guest invitation links

Choose the row, then copy its link. Keep this reference for yourself; it is not included in the built website.

| Family | Events | Guest link |
| --- | --- | --- |
| Groom | Wedding | https://krishutd.github.io/wedding-invitation-app/?i=4f6a2ae57f7d |
| Groom | Reception | https://krishutd.github.io/wedding-invitation-app/?i=e7713c25d1c8 |
| Groom | Both | https://krishutd.github.io/wedding-invitation-app/?i=4083fa314b9e |
| Bride | Wedding | https://krishutd.github.io/wedding-invitation-app/?i=41c745e64ec8 |
| Bride | Reception | https://krishutd.github.io/wedding-invitation-app/?i=c12fbfce202e |
| Bride | Both | https://krishutd.github.io/wedding-invitation-app/?i=b03f8bce7920 |

For local previews, replace `https://krishutd.github.io/wedding-invitation-app/` with `http://127.0.0.1:5173/`. These links take effect on the public site only after deployment.

Use `i` for new sharing. Codes are case-sensitive and stable; do not regenerate them after sharing. A valid code takes priority over `side` and `invite`. Invalid, empty, or duplicate codes show a neutral request to use the complete invitation link, without falling back to legacy parameters.

Previously shared `side` and `invite` links continue working when no `i` parameter is present, with the same case-insensitive values and defaults as before (`groom` and `both`). Links without any parameters also retain that default. You do not need to resend existing links. Keeping legacy compatibility means those readable parameters can still be edited; coded links simply avoid advertising them to new recipients.

This obscures the selection from casual URL editing; it does not authenticate guests. Anyone with a link can forward it, and a technical visitor can inspect the client bundle for the code mapping. This file is also visible to anyone with repository access. Real access restrictions require server-side authorization.
