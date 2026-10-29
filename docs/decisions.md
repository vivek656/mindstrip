# MindStrip Decisions

## UX

### 2026-10-28 — Bold webcomic art direction
- **Decision:** Full UI in bold webcomic style. Newsprint paper, thick ink frames, hard offset shadows, red/yellow/blue accents. Bangers for display type, Archivo for body.
- **Why:** The comic is the product. The previous monochrome minimalist look made panels feel cheap, which sank the whole concept. Judges decide in seconds, and humor needs loud visuals.
- **Alternatives considered:** Cozy paper journal (warm but low demo pop) and noir gallery (premium but fights the humor). Rejected for now; cozy could return as a panel style option.
- **Locked details:**
  - Light newsprint only, no dark mode. Comic paper is the identity.
  - SFX starbursts rendered from real `soundEffect` data, not decoration.
  - Speech balloons with tails; dashed for thoughts, heavy for shouts, yellow caption boxes for narration.
  - Provider settings gear in the masthead so the Meta API wiring stays reachable.
  - Unused minimalist components (Navbar, InputSection, old viewers) left in tree, to be deleted after visual sign-off.

### 2026-10-28 — Universe-builder UI replaced the minimalist/bold-webcomic screens
- **Decision:** The live app is now the world-building flow (landing → reader → studio) per `user-requirements.md`. The earlier minimalist screens and the bold-webcomic rewrite are orphaned in the tree, not deleted yet.
- **Why:** Founder-sanctioned pivot in the requirements doc: persistent worlds with recurring cast beat one-off strips for this product.

### 2026-10-28 — Single full-page image per episode, all panel views removed
- **Decision:** Each episode is exactly one `pageImageUrl` rendered as one image (`ComicPageSpread`). Removed from `ZenComicReader`: panel-focus flip view, layout-mode switcher (page/strip/grid/webtoon), per-panel inspect modal, speech-bubble overlays, Hide Text toggle, and click-through navigation. `ComicPageSpread` keeps a fallback chain (page image → first panel image → legacy grid).
- **Why:** Founder directive: a comic-book page is one image. Users were confused landing in panel-flip after tapping the page.
- **Known follow-up:** generated page images sometimes come back as character portraits instead of story pages. That is a page-image prompt problem, not layout. Existing episodes cache old URLs in `localStorage` (`mindstrip_worlds`), so prompt fixes only affect newly generated episodes unless the cache is cleared.
