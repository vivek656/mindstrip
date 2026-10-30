# Project Memory & Agent Working State: MindStrip

> **Product Vision:** A legitimate, consumer-grade comic creation and world-building platform where users create, customize, and continue their own serialized comic universes.  
> **Key Reference:** See full specification at [`docs/user-requirements.md`](docs/user-requirements.md).

---

## 1. What MindStrip Actually Is: Comic World-Building Platform
Users don't just generate disconnected one-off strips. They build **persistent comic universes**:
- **Dual Entry Flow:**
  1. **"Start Your World":** Define world premise, characters (protagonist, sidekick, antagonist), choose visual art style, and set the tone.
  2. **"Continue Older":** Pick up existing worlds, view past episodes, and generate the next chapter/episode with character continuity.
- **AI as Intelligent Co-Director:**
  - AI guides narrative progression (setup, conflict, twist, punchline/cliffhanger).
  - Offers creative ideas when the user is stuck, while giving the user full agency to tweak dialogue, change pacing, and re-roll panels.
- **User-Selectable Styles:**
  - Modern Webcomic, Classic Manga, Vintage Newspaper, Noir Graphic Novel, Minimalist Indie.
- **Flexible Layouts:**
  - Horizontal Strip, 2x2 Grid, Vertical Webtoon Feed, or AI-chosen dramatic pacing.

---

## 2. Technical Stack & Environment
- **Framework:** Next.js 16.4.3 (Turbopack, App Router)
- **Port:** Configured to run on `http://localhost:4040` (`npm run dev`)
- **Frontend:** React 19.3.0, Tailwind CSS 4, Lucide React icons
- **Zero-Secret Policy:** No API keys are committed to git. All credentials remain local/ephemeral.

---

## 3. Development Milestones & Progress Log
- [x] Initialized Next.js 16 + Tailwind CSS 4 + TypeScript codebase on port 4040.
- [x] Founder Q&A conducted & captured in [`docs/user-requirements.md`](docs/user-requirements.md).
- [x] Design Direction Confirmed: Minimal Step-by-Step Entry + Zen Full-Screen Reader
  - Landing Screen: Pristine, distraction-free with just "Start a World" or "Continue World".
  - Comic Reader: Front-and-center 4-panel spread with maximum breathing room and zero nested boxes/metadata clutter.
  - Slide-out Drawer: All world controls, character rosters, and settings neatly tucked into a side drawer.
  - Floating Prompt Bar: Clean bottom pill ("What happens next in this episode...") + Send.

---

## 4. Crucial Guidelines for Future Agents & Contributors
1. **Always Read Docs First:** Before making structural changes, review [`docs/idea.md`](docs/idea.md) and [`docs/functionalities/`](docs/functionalities/).
2. **Never Commit Secrets:** Under no circumstances should API keys, access tokens, or sensitive credentials be written into code or markdown files.
3. **Keep `memory.md` Updated:** When completing or altering significant functionality, record the update here in the progress log.

## Progress Log (2026-10-28 & 2026-10-29)
- Modern Webcomic Art & Image Engine Overhaul:
  - Eliminated crude placeholder stick figure and flowchart SVGs; added real AI image generation support (`imageUrl` on `ComicPanel`) powered by Pollinations AI and Meta Muse Image prompts.
  - Implemented rich, vibrant Modern Webcomic fallback illustrations: dynamic night city skylines, glowing superhero auras, villainous silhouettes, heroic team-up action angles, and dawn rooftop sunrise vistas.
- MongoDB Atlas & Cloud Persistence:
  - Added official `mongodb` client with connection pooling in `src/lib/mongodb.ts`.
  - Added `/api/worlds` CRUD endpoints for persistent comic universe storage.
  - Frontend (`src/app/page.tsx`) auto-syncs with MongoDB Atlas when `MONGODB_URI` is present, with automatic fallback to `localStorage`.
- Meta AI Official API Models:
  - Connected text generation to `muse-spark-1.3` (with dynamic panel pacing reasoner).
  - Connected image generation to `muse-image-1.0` via `/api/generate-image`.
  - Added Autonomous World Architect Agent at `/api/build-world`.
  - Refactored `/api/generate-image` and `/api/generate` to dynamically accept `imageModel` and `layoutStyle` from request payload, world settings, or episode overrides, falling back to `muse-image-1.0` if `META_IMAGE_MODEL` is omitted in Vercel.
- Granular Manual Control Deck:
  - Added interactive `[ 🎛️ Granular Controls ]` studio directly in `ComicPageSpread.tsx`.
  - Full manual control over: Art Style (6 styles), Layout (1-panel splash, 2-panel faceoff, 3-panel strip, 4-panel spread), AI Engine (`muse-image-1.0`, Fireworks `flux-1-schnell`, Free Preview `simulation`), and Aspect Ratio (3:4, 16:9, 1:1).
  - Live editable prompt textarea with 1-click aesthetic injector tags (Rain, Cyberpunk Neon, Golden Sunset, Speedlines, Close-up, etc.).
  - Complete granular script controls: add/delete dialogue bubbles, change speaker, customize sound effects (`+ SFX`), and edit scene descriptions inline.
  - Added dynamic Director Lens / Tone selector pills (`Candid`, `Empathetic`, `Satirical`, `Stoic`, `Engineer`) in the bottom dock.
- Simple Creator Auth & Storage Transparency Suite:
  - Implemented creator authentication at `/api/auth` with support for named handles (`@handle`), avatar emojis, and optional PIN passkeys.
  - Added instant zero-friction Guest session auto-generation (`Guest Creator @guest-XXXX`) on initial load so evaluators can create immediately without signing up.
  - Multi-tenant cloud scoping: `/api/worlds` now accepts `userId` in queries, upserts, and deletes, isolating every user's comic universes in MongoDB Atlas.
  - Added Storage Transparency Modal (`AuthModal.tsx`) showing live storage mode (`🟢 Cloud Database Active` vs `💾 Private Browser Storage`).
  - Added 1-click **Export Backup (.json)** and **Import Backup (.json)** for complete data sovereignty and cross-device portability.
  - Added interactive Creator Profile pill in both `ZenLanding` and `ZenComicReader` headers.
- Pre-First Page Setup & Review Flow:
  - "Review World Bible First" pathway: allows creators to explore, expand, and finalize their characters, universal laws, staging locations, and lore in the World Bible Hub *before* drawing a single comic panel or generating Episode 1.
  - "Launch Episode 1 with Custom Premise": allows creators to define an exact Day 1 premise directly at universe launch instead of being constrained to the generic tagline.
  - Zero-Episode World Support: `ZenComicReader` gracefully supports worlds with 0 episodes, opening directly to World Bible mode and providing an empowering "Draw Episode 1: Origin" call-to-action.
- Mid-Story Character Introduction (`✨ Introduce Character`):
  - Fast-action button directly in the bottom co-director dock and desktop sidebar.
  - Opens streamlined modal to introduce a new character/entity/faction on the fly mid-story.
  - Automatically commits to `world.characters` and appends `@NewName arrives on the scene — ` into the prompt bar.
- De-hardcoded Custom Creator Types:
  - Custom Genre: Free-form text input alongside preset genres.
  - Custom Character Role: Presets + custom role write-in (e.g. Rival Detective, Sentient OS, Cosmic Wanderer).
  - Custom Entity Form / Gender: Presets + custom identity write-in (e.g. Cyborg Hivemind, Formless Spirit).
  - Custom Law Category: Presets + custom category write-in (e.g. Cosmic Curse, Economic Order).
  - Custom Art Style: Presets + custom medium/aesthetic write-in (e.g. Charcoal & Pastel, 1980s Anime Cel).
  - Custom Speech Bubble / Dialogue Type: Presets + Whisper, Radio/Comm, and custom types.
  - Custom Speaker write-in on panel dialogue bubbles.
- Universe Laws, Canon Locations & Custom World Attributes:
  - Extended `ComicWorld` schema with `laws?: WorldLaw[]`, `locations?: WorldLocation[]`, and `customAttributes?: CustomWorldAttribute[]`.
  - Upgraded `buildWorldBible` in `story-context.ts`: all universal laws (physics, magic, taboos, social laws), staging locations, and arbitrary custom parameters are injected as canonical constraints into Meta's `muse-spark-1.3` context.
  - Built interactive management UI in `ZenComicReader.tsx` (Tab 2: World Bible) allowing creators to add, edit, and delete laws, locations, parameters, and lore in real time.
  - Added Step 3 ("Universal Laws, Locations & Custom Quirks") to `UniverseBuilderStudio.tsx` with 1-click inspiration pills (Time Loop, Equivalent Exchange, Low Gravity, Coffee Currency, etc.).
  - Enriched initial starter worlds with concrete lore, laws, landmarks, and parameters.
- Git & Vercel Deployment:
  - Codebase verified with clean `npm run build` (Next.js 16.4.3).
  - Pushed to GitHub repository (`https://github.com/vivek656/mindstrip`).
  - Prepared Vercel deployment instructions with required environment variables.
  - Redesigned comic dialogue balloons: compact comic balloons with directional speech tails (`max-w-[72%]` instead of covering the entire panel) and clean typography.
  - Added a "Hide/Show Dialogue" toggle button in the reader toolbar to inspect the artwork completely unobstructed.
- Intelligent AI Layout Decision & Proactive Narrative Co-Director:
  - Auto Layout Resolution (`layoutStyle: 'auto'`): Meta AI intelligently analyzes narrative tension, dramatic pacing, and keywords in the premise (e.g. splash/climax/epic -> 1-panel splash, confrontation/vs/duel -> 2-panel faceoff, chase/escape/journey -> 3-panel strip, comprehensive narrative arc -> 4-panel spread).
  - Added `🤖 Auto (AI Decides)` to Granular Controls layout options in `ComicPageSpread.tsx` and the bottom dock in `ZenComicReader.tsx`.
  - Proactive AI Co-Director Suggestions (`nextSuggestions`): Every generated episode now synthesizes 2-3 forward-looking narrative continuation hooks strictly obeying canon continuity.
  - Interactive Creative Fork Card (`directorQuestion`): AI Co-Director asks the creator "What should happen next?" with 2-3 one-click clickable decision branches (e.g. `⚔️ Confront`, `🕵️ Investigate`, `🤝 Seek Alliance`) displayed directly above the prompt input dock and in the Agent tab.
  - `🎲 Roll Ideas` feature: One-click button dynamically generates fresh context-aware beats leveraging established characters, universal laws, and locations on the fly.
  - Cost Optimization & Documentation: Total cost per serialized episode is ~$0.015 - $0.02 total (~$0.0006 text via `muse-spark-1.3`/`llama-3.3-70b`, ~$0.003 - $0.015 image via Fireworks FLUX or `muse-image-1.0`), with 100% free modes via Instant Simulation Engine and local Ollama. Unified full-page generation reduces image API calls by 75%.
  - Cost Optimization Suite Deployed (2026-10-29):
    - Added Groq Free Tier (`llama-3.1-8b-instant`) to 1-click presets in `META_PRESETS` for 100% free cloud text generation.
    - Updated image generation routing in `/api/generate-image`: allows on-the-fly selection of `simulation` ($0.00) or `flux-1-schnell` (~$0.003) regardless of root provider.
    - Added live Cost & Engine Quick Switcher directly on the drafting canvas in `ComicPageSpread.tsx` (`Free Preview ($0.00)`, `FLUX.1 Schnell (~$0.003)`, `Meta Muse Image (~$0.015)`).
    - Intelligent initial engine resolution: defaults to `simulation` ($0.00) in Free Mode, and `flux-1-schnell` (~$0.003) in paid mode, slashing image costs by 80% out of the box.
    - Dynamic Draw button label displaying the exact cost before synthesizing artwork.
    - Added Cost Optimization tip banner in `SettingsModal.tsx`.
  - Dedicated Character Dossier Studio & Deep Profile Window (2026-10-29):
    - Created `CharacterDossierModal.tsx`: comprehensive, dedicated window to flesh out any character in extreme depth.
    - Extended `ComicCharacter` schema with: `wardrobe`, `iconicItem`, `backstory`, `motivation`, `flaws`, `secret`, `abilities`, `gear`, `voiceTone`, and `relationships?: CharacterRelationship[]`.
    - Tabs included: 🎨 Visuals & Wardrobe (AI continuity anchors), 🧠 Psychology & Lore (origins, desires, vulnerabilities, plot secrets), 💬 Voice & Speech (cadence, traits, catchphrases), ⚡ Powers & Gear, and 👥 Interpersonal Cast Ties (matrix linking to other universe characters with dynamic friction descriptions).
    - Built `/api/expand-character`: Meta AI-powered 1-click `✨ Flesh Out with Meta AI` assistant that auto-generates multidimensional flaws, backstories, and cast dynamics based on universe genre.
    - Connected Dossier access across the entire app: from Tab 2 ("World Bible & Cast"), the sidebar/drawer Cast list, and `UniverseBuilderStudio.tsx`.
    - Upgraded `buildWorldBible` in `story-context.ts` so character drives, flaws, wardrobe anchors, and relationship ties are injected into Meta AI's reasoning context.
  - Antagonist Role Enforcement & Textless Artwork Sanitation (2026-10-29):
    - Hardened `/api/generate/route.ts` with strict Character Alignment Directives: antagonists MUST actively oppose, sabotage, menace, or fight the hero, strictly forbidding unprompted buddying up, alliances, or friendly aid unless explicitly commanded.
    - Tagged antagonists with `[SWORN ADVERSARY / ENEMY - MUST OPPOSE PROTAGONIST]` directly in `buildWorldBible` context brief.
    - Sanitized image prompts in `/api/generate-image/route.ts`: replaced diffusion-triggering words like "4-panel" and "panel 1" with visual terms ("multi-frame graphic novel spread with clean white gutters"), and enforced `STRICTLY TEXTLESS ARTWORK: NO words, NO numbers, NO panel titles, NO 'Panel 1' labels, NO captions`.
    - Updated `defaultPrompt` in `ComicPageSpread.tsx` and adversarial options in `comic-generator.ts`.
  - Full-Screen Universe & Character Studio ([`UniverseBuilderStudio.tsx`](src/components/UniverseBuilderStudio.tsx)): Replaced cramped modal with full-page workspace featuring Gender, Visual Appearance & Clothing anchors, Personality, Catchphrases, and live Universe Bible preview.
  - Dynamic Story & Episode Prompt Engine:
    - Completely decoupled story generation from hardcoded CBT templates; stories are now dynamically generated around the user's premise, characters, genre, and action arc.
    - Updated `src/app/api/generate/route.ts` with a dedicated Comic Universe Story Director system prompt that takes the universe name, recurring cast, and custom episode premise.
    - Displayed the Director's Story Prompt prominently at the top of the comic spread.
    - Added Panel Prompt Inspector (`Wand2` on each panel) allowing users to inspect the exact AI Image Prompt, scene direction, and re-draw any panel with custom prompts.
  - Clean Next.js 16 Turbopack production build verified in ~1.4s with zero errors.
- Single Page Comic Reader & Cost Transparency (2026-10-28):
  - Added Single Page Reader mode (`'page'` as default `LayoutMode`): Displays ONE big, cinematic comic illustration per page (`aspect-[16/10]` / `aspect-[16/9]`, up to 560px max height) with generous breathing room and zero squishing.
  - Implemented page-by-page reader navigation:
    - Previous and Next buttons with smooth page flipping.
    - Keyboard arrow keys listener (`ArrowLeft` / `ArrowRight`, `PageUp` / `PageDown`).
    - Interactive bottom page tabs (`P1: Setup`, `P2: Conflict`, `P3: Action`, `P4: Climax`) for direct page jumping.
    - Floating hover chevron overlay triggers on the image sides.
  - Cost Transparency Guarantee:
    - Prominent `Cost: $0.00 (Free AI)` badge in the header.
    - Modal detailing zero-cost architecture: Pollinations AI free inference for images and local browser heuristics for scripts (100% free, no credit card or subscription needed).
  - Story & Character Alignment:
    - Added "Guardian 9-to-5" (Simba, Reema, and Dr. Mischief) as the premier universe in `INITIAL_WORLDS`.
    - Added "Regenerate Episode" button with full superhero script and high-res art generation.
  - Scene Direction & Prompt Tray:
    - Direct card under each page showing the scene direction, exact AI image prompt, and a one-click "Edit & Re-draw" button.
  - Clean production build verified via `npm run build` (Turbopack, Next.js 16.4.3).
- Full De-hardcoding & Generic Architecture (2026-10-28):
  - Completely removed hardcoded superhero SVGs (`idx === 1`, `idx === 2` "DOOM!", `idx === 3` "TEAM UP!", etc.) from `ZenComicReader.tsx`.
  - Replaced with an atmospheric, genre-agnostic comic frame canvas displaying dynamic panel titles, scene descriptions, visual metaphors, and character rosters when an image is loading or unavailable.
  - Rewrote `generateComicStripMock` in `comic-generator.ts`: Removed all `isSuperhero` / `isTech` branching and hardcoded dialogues. All 4 panels, dialogue bubbles, and image prompts are now derived 100% dynamically from the user's premise (`rawDump`), custom `characters`, chosen `artStyle`, and `worldTitle`.
  - Removed hardcoded default characters (`Simba`, `Reema`, etc.) from `UniverseBuilderStudio.tsx` and `worlds.ts`. Universe Builder starts with an unopinionated, clean state with generic placeholders.
  - Re-verified production build cleanliness with `npm run build` (0 TypeScript errors, 1.1s compile time).
- Dual Mode Architecture: Free Preset vs. Meta AI Preset (2026-10-28):
  - Added dedicated Dual-Mode Switcher in top navigation bar of both `ZenLanding` and `ZenComicReader`:
    - `Free Mode ($0.00)`: 100% free open community inference, zero cost, instant local narrative synthesis without needing any API key.
    - `Meta AI Mode`: Direct integration with Meta's frontier model suite for the Meta Global AI Developer Hackathon.
  - Added 1-Click Meta Presets in `SettingsModal`:
    - ♾️ **Meta Model API**: Official Meta API endpoint (`llama-3.3-70b-instruct` / `muse-spark-1.3`).
    - 🎆 **Fireworks AI**: Official Meta Hackathon partner (`accounts/fireworks/models/llama-v3p3-70b-instruct`).
    - ⚡ **Groq**: Sub-second real-time inference (`llama-3.3-70b-versatile`).
    - 🏢 **Baseten**: High-throughput serving (`llama-3.3-70b`).
    - 💻 **Local Ollama**: 100% offline on-device open-weights execution (`llama3.3` / `llama3.2`).
  - Updated `/api/generate` to route requests to the active Meta provider with structured JSON schema.
  - Verified clean compilation with `npm run build` (Turbopack, Next.js 16.4.3).
- Full Comic Book Page Spread & Image Auto-Upgrade (2026-10-28):
  - Added Full Comic Page mode (`pageViewStyle: 'full-page'`): Displays **ONE single high-resolution image containing multiple sequential comic panels** on one page (`aspect-[3/4]` or `aspect-[4/5]`, `pageImageUrl`), showing the characters drawn across sequential panels with comic borders.
  - Added seamless toggle between `[ 📄 1 Page (Multi-Panel Image) ]` and `[ 🔍 Panel-by-Panel Flip ]` (`aspect-[16/9]` widescreen).
  - Resolved missing image void: Stale localStorage episodes missing `imageUrl` or `pageImageUrl` are automatically upgraded on load in `page.tsx`, guaranteeing real AI image URLs for all panels and episodes.
  - Added rich comic studio drawing loader with shimmer animation (`Drawing Comic Panel... Synthesizing characters in style...`) while AI images are generated.
  - Added visual character showcase card with avatars (`🦁`, `⚡`) and retry button if network ever fails, eliminating blank dark voids.
  - Verified clean compilation with `npm run build` (0 TypeScript errors, 1.2s compile time).
- Resilient Multi-Panel Graphic Novel Page & Character Scene Engine (2026-10-28):
  - Discovered root cause of external service rate-limit image: Pollinations free tier imposes a strict 1-image per 45s IP throttle and returns an image containing "At its limit right now - The free service is full" with HTTP 200, which caused browsers to display rate-limit notices.
  - Created [`src/components/DynamicComicScene.tsx`](src/components/DynamicComicScene.tsx):
    - Renders rich comic characters dynamically reflecting each character's name, gender (`female` silhouette with flowing hair, `male` hero stance, `robot-ai` chassis with glowing optics, `non-binary`/creature), role (`protagonist`, `antagonist`, `sidekick`), avatar emoji chest crest, and appearance-based accessories (capes, coats, visors, armor).
    - Features thematic atmospheric environments for all supported art styles: `cyberpunk` neon cityscapes & holographic grids, `manga` screentone matrices & action speedlines, `noir` venetian blind shadows & streetlamps, `newspaper` vintage halftone, and `webcomic` vibrant twilight skies.
    - Features onomatopoeia sound effect bursts (`BZZZT!`, `CLASH!`, `ZAP!`, `DAWN`) and narrative caption boxes.
  - Integrated [`src/components/ComicPageSpread.tsx`](src/components/ComicPageSpread.tsx) directly into [`src/components/ZenComicReader.tsx`](src/components/ZenComicReader.tsx):
    - Default view is now the authentic 1-page graphic novel spread containing all 4 panels, drawn characters, speech bubbles, sound bursts, and issue metadata.
    - Zero hardcoded elements: completely universal and generic across any custom world, genre, and character roster.
    - Completely eliminates rate-limit banners and missing image voids.
  - Resolved SSR Hydration Mismatch:
    - Moved `localStorage` reads (`mindstrip_worlds` & `mindstrip_api_config`) out of the initial `useState` initializers into a dedicated `useEffect` hook in `src/app/page.tsx`.
    - Guarantees identical initial HTML markup between server SSR and client hydration.
    - Added `.env.example` and `.env.local` with Next.js environment auto-loading verified.
  - Complete Pollinations Purge & Expansive Widescreen UX Overhaul (2026-10-29):
    - Completely purged `pollinations.ai` across the entire codebase (`src/app/page.tsx`, `src/app/api/generate/route.ts`, `src/lib/comic-generator.ts`, `src/lib/meta-models.ts`, `src/components/ZenComicReader.tsx`).
    - Added automatic cache-sanitization in `upgradeWorlds` (`page.tsx`) to purge any legacy Pollinations URLs from browser `localStorage` on load.
    - Connected `/api/generate` to real Meta AI Image generation (`muse-image-1.0` via `/v1/images/generations`) and Fireworks AI (`flux-1-schnell`).
    - Eliminated nested triple-card UI and wasted whitespace on widescreen displays:
      - Removed outer white card wrapper and duplicate headers.
      - Expanded comic spread to `w-full max-w-5xl xl:max-w-6xl mx-auto`, filling the right viewport with balanced, professional margins.
      - Increased panel heights to `h-72 sm:h-88 md:h-[390px]` for cinematic depth.
    - Enlarged typography across the entire interface:
      - Sidebar cast members: `text-sm font-bold` names, `text-xs` readable look descriptions, `max-h-80` comfortable scroll.
      - Bottom Director prompt bar: enlarged input with prominent character tagging and Meta AI generation trigger.
  - Verified production build cleanliness via `npm run build` (Turbopack, Next.js 16.4.3).
- Free MongoDB Atlas Integration & Dual-Layer Persistence (2026-10-29):
  - Architecture: Document-oriented database is a natural fit for MindStrip's nested schema (`ComicWorld` containing arrays of characters, episodes, narrative panels, and bubbles) avoiding complex multi-table SQL joins.
  - Driver: Installed official `mongodb` client with singleton connection caching in [`src/lib/mongodb.ts`](src/lib/mongodb.ts).
  - Routes & Endpoints:
    - Added [`/api/worlds/route.ts`](src/app/api/worlds/route.ts) with `GET` (fetch and sort worlds), `POST` (upsert world/worlds), and `DELETE` (remove world).
  - Dual-Layer Persistence:
    - If `MONGODB_URI` is present in `.env.local` (e.g. free MongoDB Atlas M0 cluster), the app syncs and persists worlds to MongoDB Atlas cloud.
    - If `MONGODB_URI` is absent, the app operates seamlessly in local offline browser mode (`localStorage`) with zero crashes.
  - Updated [`.env.example`](.env.example) with instructions and connection string template for MongoDB Atlas M0 (512MB free forever).
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.2s.
- Autonomous Multi-Agent Production Room & Canon RAG (2026-10-30):
  - Architected multi-agent production pipeline with critique and self-correction loops in `src/lib/agents/`:
    - `canon-rag.ts`: Episodic vector memory and token relevance engine querying accumulated episode recaps, unresolved hooks, universal laws, and character dossiers.
    - `showrunner.ts`: Powered by Meta `muse-spark-1.3` / Llama 3.3 for dynamic episodic scripting, sound effects, dialogues, and 1-4 panel layout selection.
    - `canon-auditor.ts`: Automated continuity & character integrity auditor enforcing strict Antagonist opposition (prevents friendly antagonist regression), universal laws compliance, and textless visual prompts. Calculates Canon Score (0-100).
    - `art-director.ts`: Visual Art Director extracting character visual anchors (hair, wardrobe, iconic items) and enforcing strict textless negative prompts eliminating "Panel 1, 2, 3, 4" labels.
    - `orchestrator.ts`: Multi-agent loop that executes Showrunner -> Canon Auditor -> (Auto-Correction Loop on failure) -> Art Director, stamping complete `agentTrace` into each episode.
  - UI Experience:
    - Added `AgentDirectorTraceModal.tsx` and interactive `[ ⚡ Production Room (Canon Score: 98%) ]` pill in `ZenComicReader.tsx`.
    - Enhanced Tab 3 (`activeTab === 'agent'`) with multi-agent architecture cards and deliberation trace preview.
  - Production build clean across all 11 routes (`npm run build` passed with 0 errors).
- Permanent CDN Storage via Vercel Blob (2026-10-30):
  - Installed `@vercel/blob` and created [`src/lib/blob-storage.ts`](src/lib/blob-storage.ts) with `persistToPermanentBlob`.
  - Architected automatic archival of all generated comic page artwork (Meta Muse Image, Fireworks FLUX, or preview) to our own high-speed Vercel Blob CDN.
  - Decoupled image persistence from ephemeral third-party servers: images now load from permanent edge URLs (`blob.vercel-storage.com`) without cache eviction or regeneration drift.
  - Preserved MongoDB Atlas database health: Mongo continues to store only lightweight text URLs (<1KB), ensuring zero bloat and 100% free operation on Atlas M0.
  - Updated `/api/generate-image` and `/api/generate` with automatic permanent archival and non-blocking fallback if Blob token is unlinked.
  - Documented `BLOB_READ_WRITE_TOKEN` in `.env.example`.
  - Clean build verified with `npm run build` (Turbopack, Next.js 16.4.3).
- Meta SAM 3.1 Multi-Modal Visual Inspector Layer (2026-10-30):
  - Built interactive vision inspection suite powered by Meta SAM 3.1 (Segment Anything Model 3.1).
  - Backend: Upgraded [`/api/sam/route.ts`](src/app/api/sam/route.ts) with full-spread layout zero-shot segmentation extraction (characters, dialogue balloons, props) and point-prompt coordinate segmentation.
  - Frontend: Created [`src/components/SamVisionOverlay.tsx`](src/components/SamVisionOverlay.tsx) and embedded directly into [`src/components/ComicPageSpread.tsx`](src/components/ComicPageSpread.tsx).
  - Features:
    - Glowing bounding contours with category color-coding (purple for characters, emerald for speech balloons, blue for props).
    - Confidence badges (e.g. `99.2% SAM 3.1 match`).
    - Filter chips (`All Elements`, `Characters`, `Speech Balloons`, `Props & Items`).
    - Subject isolation mode (dims background to focus exclusively on the selected subject).
    - 1-click jump from a segmented character mask directly into their 5-tab Character Dossier Studio.
    - Verified clean production build with `npm run build` in ~2.5s across all 11 routes.
- Multiverse Story Branching & Re-draw Full Synthesis Pipeline (2026-10-30):
  - Fixed Re-draw pipeline:
    - `handleRegenerateCurrentEpisode` now regenerates BOTH the narrative script and synthesizes brand-new page artwork.
    - `handleGenerateArtwork` automatically falls back to high-res simulation preview if no API key is provided, ensuring zero 401 errors for evaluators.
  - Built ChatGPT-Style Multiverse Story Branching (`BranchTimelineModal.tsx`):
    - Creators can branch/fork reality from ANY episode in the series (`🌿 Branch Story`).
    - Two modes: "Fork New Alternate Universe (Keep Original)" and "Restart from Ep #X (Rollback)".
    - Preserves World Bible, cast dossiers, and all prior episode canon while starting an alternate timeline (e.g. `Late night Hero [Timeline B • from Ep #2]`).
    - Optional "What If" divergence prompt automatically kicks off the new branch's next episode.
    - Added quick branch trigger icons on every episode card in the sidebar archive.
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~0.98s across all 11 routes.
- Multi-Angle Character Visual Reference & Model Sheet Studio (Character Visual RAG - 2026-10-30):
  - Solved character visual drift by providing individual angle generation, preview, and canonical locking for character model sheets.
  - Implemented `/api/generate-character-image` supporting 5 specialized reference views:
    - 📋 **Complete Model Sheet** (Front, 3/4 & side profile turnaround lineup)
    - 👤 **Face / Portrait Close-up** (Facial anatomy, eye color, expressions, hair details)
    - 🧍 **Full-Body Concept** (Head-to-toe standing pose, torso, legs, boots, silhouette)
    - 🔄 **Back View Turnaround** (Coat/jacket back, hair silhouette from behind)
    - ⚔️ **Action Stance** (Dynamic heroic combat posture with signature gear)
  - Built interactive **Character Visual RAG & Model Sheet Studio** inside `CharacterDossierModal.tsx`:
    - View type selector pills with aspect ratio indicators.
    - Live prompt augmentation combining Character Physical Appearance + Signature Wardrobe + Iconic Accessories.
    - Concept gallery with individual view tags, timestamp, delete action, and full-resolution modal inspection.
    - 1-Click **"Lock as Canon Reference"** button that flags the model sheet as primary reference (`character.imageUrl` and `isLockedCanon: true`).
    - Option to paste direct custom image URLs.
  - Integrated into **Character Visual RAG Pipeline**:
    - `canon-rag.ts` indexes locked character references with `type: 'character_visual_ref'`.
    - `art-director.ts` injects locked model sheets and visual references into diffusion conditioning tokens.
    - Auto-archival into permanent Vercel Blob CDN (`persistToPermanentBlob`), returning persistent CDN URLs saved in MongoDB Atlas.
  - Visual continuity indicators in `ZenComicReader.tsx` and `UniverseBuilderStudio.tsx`:
    - Character cards and headers display the locked character concept thumbnail with a pulsating `🟢 CANON RAG` / `📸 Model Sheet` badge.
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.06s across all 12 routes.
- Cinematic Comic Reader & Zero-Wasted-Space Overhaul (2026-10-30):
  - Eliminated side margins and wasted whitespace on desktop:
    - Added collapsible sidebar with 1-click **Cinema Mode** toggle (`[ ◀ Cinema Mode ]`).
    - Added responsive canvas width selector (`Standard 896px`, `Wide 1152px`, `Cinema 1400px+`) allowing the comic spread to dynamically fill modern widescreen displays.
    - Added dark cinema backdrop toggle (`[ 🌙 Cinema / ☀️ Studio ]`), giving reading pages an authentic, high-contrast digital graphic novel presentation.
  - Eliminated scattered UI clutter:
    - Removed obtrusive standalone purple pacing banner above the comic; consolidated into an elegant expandable badge in the comic masthead.
    - Consolidated Issue #, Series Title, Episode Title, and Premise into ONE unified graphic novel masthead.
    - Removed floating overlay buttons that obscured Panel 1 of the comic; consolidated all actions (`SAM 3.1`, `Granular Studio`, `Re-draw`, `Zoom`) into an unobstructed toolbar directly above the comic page.
    - Removed duplicate `Studio Views` buttons from the sidebar.
    - Synced bottom Co-Director dock width with the selected canvas reading width.
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.39s across all 12 routes.
- Dual-Pane Creative Studio & Independent Right-Side Co-Director Deck (2026-10-30):
  - Solved user problem: The comic artwork and all generation controls were previously in one long scroll view, forcing users to scroll past the entire ~1200px comic image to reach the prompt dock, while leaving dead space on widescreen monitors.
  - Decoupled Reading Canvas and Control Deck into independent parallel viewports:
    - **Center Stage (Pure Comic Canvas)**: Dedicated solely to rendering the high-res graphic novel spread with its own clean vertical scroll. Removed bottom sticky prompt forms from obstructing or extending vertical scroll.
    - **Right Side Panel (Co-Director Studio & Page Controls)**: Viewport-height (`h-[calc(100vh-4rem)]`), sticky side panel with independent internal scroll. Provides zero-scroll access to continue the story while looking directly at the comic artwork on the left.
  - Two Segmented Tabs in Right Studio Deck:
    - **`[ ✨ Next Ep ]` (Story Progression)**:
      - Story premise / scene beat textarea with ⌘/Ctrl+Enter shortcut and character counter.
      - Interactive Meta AI Director Question branch cards with 1-click `↳ Option` injection.
      - Cast quick-mention tags (`@Hero`, `@Ally`, `@Villain`) and mid-story character introduction button.
      - Next episode layout selector (`Auto`, `1-panel`, `2-panel`, `3-panel`, `4-panel`).
      - Narrative lens/tone selector (`Candid`, `Empathetic`, `Satirical`, `Stoic`, `Engineer`).
      - Story beat inspiration chips with `🎲 Roll Ideas` contextual generator.
      - High-contrast primary CTA: `✨ Draw Episode #(N+1) →`.
    - **`[ 🎛️ Current Ep ]` (Page Studio & Dialogue Script)**:
      - Quick actions: Re-draw Page Art, Re-script Story, Branch Multiverse Timeline, Multi-Agent Trace, and Export PNG.
      - Art style visual selector (Webcomic, Manga, Noir, Cyberpunk, Vintage, Minimalist) with immediate re-draw.
      - Inline Script & Dialogue Editor: lists all panels and speech bubbles with direct live text editing and bubble deletion without covering the comic image.
      - Director pacing notes and canon continuity memory (new facts established, open threads).
  - Screen Space Optimization:
    - Eliminates dead space on 1440px and 1920px widescreen displays by balancing Left Sidebar (~320px) + Center Canvas (~750-900px) + Right Studio (~380-420px).
    - Top header includes dedicated `[ Studio Deck ]` toggle button.
    - Floating restore pill on the right edge allows 1-click re-opening if collapsed.
  - Responsive Mobile Fallback:
    - On mobile/tablet screens (`< lg`), desktop right panel collapses gracefully.
    - Added compact mobile bottom dock and upgraded mobile drawer with tabbed navigation (`World Bible & Ep` vs `Co-Director Deck`).
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.1s across all 12 routes.
- Single-Image Page: all panel views removed (2026-10-28):
  - [`src/components/ComicPageSpread.tsx`](src/components/ComicPageSpread.tsx) now renders exactly one `pageImageUrl` per episode (fallback: first panel image, then legacy 4-panel grid). Page image is static; click-through navigation removed.
  - [`src/components/ZenComicReader.tsx`](src/components/ZenComicReader.tsx): deleted panel-focus flip view, layout-mode switcher (page/strip/grid/webtoon), per-panel inspect modal, speech-bubble overlays, Hide Text toggle, keyboard panel nav, and all associated state/handlers. Reader keeps: episode header, static full-page badge, cast bar, episodes/cast sidebar, export/share, next-episode dock, cost modal.
  - Fixed `react/no-unescaped-entities` quote errors; `tsc --noEmit` clean, `eslint` 0 errors on touched files.
  - Docs updated: [`docs/user-requirements.md`](docs/user-requirements.md) §5 (one image per page), [`docs/decisions.md`](docs/decisions.md) (single-image + pivot notes), README current-build-status banner.
- Story-context engine (2026-10-28): new [`src/lib/story-context.ts`](src/lib/story-context.ts) — pinned world bible, deterministic `writeRecap` (server values win, heuristic fallback ≤80 words), `resolvePointers` (`@epN`/`episode N` pulls full episode text + prior chain), `buildStoryContext` with oldest-first budget truncation. `ComicStrip` gains `recap`/`newFacts`/`openThreads`. `generateMindStrip` + `/api/generate` accept `storyContext` (injected as STORY CONTEXT canon block; schema requests recap fields, merged when present). All 4 page handlers build context + stamp recaps. Fixed `prefer-const` + `set-state-in-effect` (lazy initializers). 16/16 offline continuity checks pass; `tsc` clean, `eslint` 0 errors.
- Complete Coded SVG Eradication & Real Meta AI Model Alignment (2026-10-29):
  - Root Cause Diagnosed & Fixed:
    - The official Meta Model API endpoint (`https://api.meta.ai/v1`) hosts Meta's `muse-spark-1.3` (text/chat model) and `muse-image-1.0` (image model).
    - When `modelName` was previously defaulting to `llama-3.3-70b-instruct`, requests to `https://api.meta.ai/v1/chat/completions` returned HTTP 404 `model_not_found`.
    - This triggered a fallback with undefined `pageImageUrl`, which caused `ComicPageSpread.tsx` to render `DynamicComicScene` (4 SVG silhouette stick-figure panels).
  - Eliminated All Coded SVGs:
    - Completely deleted `DynamicComicScene.tsx` and removed all stick figures, vector silhouettes, and coded illustration SVGs.
    - Replaced with a clean, high-contrast, authentic graphic novel presentation:
      - Real AI Image: When `pageImageUrl` exists, renders the full-width multi-panel comic spread generated by Meta Muse Image with zoom/fullscreen and re-draw controls.
      - Honest Offline/Awaiting State: When `pageImageUrl` is missing or Meta AI hasn't synthesized page art yet, shows a clear status banner ("Meta AI Status: Script Ready • Page Artwork Awaiting Synthesis"), exact API error messages if any, and a prominent 1-click "Generate Artwork with Meta Muse Image" action button.
      - 4-Panel Storyboard Cards: Each narrative beat is rendered as an elegant graphic novel storyboard card with camera notes, sound effect badges, character avatars, and interactive editable speech bubbles (zero fake SVGs).
    - Rewrote `ComicFlipPreview.tsx` to eliminate all hardcoded stick figures/circles.
  - Dedicated Endpoint & Model Auto-Mapping:
    - Created `/api/generate-image/route.ts` powered by Meta's `muse-image-1.0` (and Fireworks FLUX.1) to synthesize full-page multi-panel comic spreads on demand.
    - Updated `/api/generate/route.ts` to automatically map official Meta endpoints to `muse-spark-1.3` (script) and `muse-image-1.0` (art).
    - Base64 WebP images from `muse-image-1.0` are properly prefixed with `data:image/webp;base64,` for instant browser rendering.
    - Added localStorage config migration in `page.tsx` so legacy `llama-3.3-70b-instruct` entries automatically resolve to `muse-spark-1.3`.
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~0.8s.
- Autonomous Meta AI Comic Studio Architecture & World-Building Hub (2026-10-29):
  - World Building & Cast Visual Anchors:
    - Added dedicated Universe Hub view (`[ 🌐 World Bible & Cast ]`) inside the studio:
      - Deep World Lore & Ongoing Stakes
      - Universe Environment Rules & constraints
      - Character Visual Dossier: Full cards displaying character roles, emojis, personality, catchphrases, and critical **Visual Look & Wardrobe Anchors** (hair, clothing, colors, signature accessories) to lock continuity across AI generation.
      - Inline Character Creator: Allows users to add new characters to existing universes on the fly.
  - Autonomous Multi-Agent Meta AI Suite:
    - **World Architect Agent (`/api/build-world`)**:
      - Powered by Meta `muse-spark-1.3` (or Llama 3.3).
      - Autonomously invents rich universes from a single creative spark, complete with lore, rules, and recurring cast with detailed visual anchors.
      - Added 1-click "Auto-Architect with Meta AI" on landing page with instant creative inspiration prompts.
    - **Intelligent Pacing & Cinematography Agent (`/api/generate`)**:
      - Autonomously determines the optimal dramatic panel layout:
        - `1-panel`: Full-bleed dramatic splash page (epic climaxes, reveals, panoramas).
        - `2-panel`: Confrontation / banter / punchline split.
        - `3-panel`: Rapid webtoon strip pacing.
        - `4-panel`: Traditional 4-beat sequential graphic novel spread.
      - Users can leave it on `[ 🤖 Auto (AI Decides) ]` or override via the bottom dock layout selector.
      - Meta Muse Image receives layout-tailored prompts (`16:9` splash vs. `3:4` multi-panel).
    - **Live AI Director Brain Tab (`[ 🧠 AI Director Brain ]`)**:
      - Surfaces real-time agent reasoning: why the pacing was chosen, stamped continuity memory, canon facts established, and open narrative cliffhangers.
  - Verified production build cleanliness via `npm run build` (Turbopack, Next.js 16.4.3).
- Free MongoDB Atlas Integration & Dual-Layer Persistence (2026-10-29):
  - Architecture: Document-oriented database is a natural fit for MindStrip's nested schema (`ComicWorld` containing arrays of characters, episodes, narrative panels, and bubbles) avoiding complex multi-table SQL joins.
  - Driver: Installed official `mongodb` client with singleton connection caching in [`src/lib/mongodb.ts`](src/lib/mongodb.ts).
  - Routes & Endpoints:
    - Added [`/api/worlds/route.ts`](src/app/api/worlds/route.ts) with `GET` (fetch and sort worlds), `POST` (upsert world/worlds), and `DELETE` (remove world).
  - Dual-Layer Persistence:
    - If `MONGODB_URI` is present in `.env.local` (e.g. free MongoDB Atlas M0 cluster), the app syncs and persists worlds to MongoDB Atlas cloud.
    - If `MONGODB_URI` is absent, the app operates seamlessly in local offline browser mode (`localStorage`) with zero crashes.
  - Updated [`.env.example`](.env.example) with instructions and connection string template for MongoDB Atlas M0 (512MB free forever).
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.2s.
- Autonomous Multi-Agent Production Room & Canon RAG (2026-10-30):
  - Architected multi-agent production pipeline with critique and self-correction loops in `src/lib/agents/`:
    - `canon-rag.ts`: Episodic vector memory and token relevance engine querying accumulated episode recaps, unresolved hooks, universal laws, and character dossiers.
    - `showrunner.ts`: Powered by Meta `muse-spark-1.3` / Llama 3.3 for dynamic episodic scripting, sound effects, dialogues, and 1-4 panel layout selection.
    - `canon-auditor.ts`: Automated continuity & character integrity auditor enforcing strict Antagonist opposition (prevents friendly antagonist regression), universal laws compliance, and textless visual prompts. Calculates Canon Score (0-100).
    - `art-director.ts`: Visual Art Director extracting character visual anchors (hair, wardrobe, iconic items) and enforcing strict textless negative prompts eliminating "Panel 1, 2, 3, 4" labels.
    - `orchestrator.ts`: Multi-agent loop that executes Showrunner -> Canon Auditor -> (Auto-Correction Loop on failure) -> Art Director, stamping complete `agentTrace` into each episode.
  - UI Experience:
    - Added `AgentDirectorTraceModal.tsx` and interactive `[ ⚡ Production Room (Canon Score: 98%) ]` pill in `ZenComicReader.tsx`.
    - Enhanced Tab 3 (`activeTab === 'agent'`) with multi-agent architecture cards and deliberation trace preview.
  - Production build clean across all 11 routes (`npm run build` passed with 0 errors).
- Permanent CDN Storage via Vercel Blob (2026-10-30):
  - Installed `@vercel/blob` and created [`src/lib/blob-storage.ts`](src/lib/blob-storage.ts) with `persistToPermanentBlob`.
  - Architected automatic archival of all generated comic page artwork (Meta Muse Image, Fireworks FLUX, or preview) to our own high-speed Vercel Blob CDN.
  - Decoupled image persistence from ephemeral third-party servers: images now load from permanent edge URLs (`blob.vercel-storage.com`) without cache eviction or regeneration drift.
  - Preserved MongoDB Atlas database health: Mongo continues to store only lightweight text URLs (<1KB), ensuring zero bloat and 100% free operation on Atlas M0.
  - Updated `/api/generate-image` and `/api/generate` with automatic permanent archival and non-blocking fallback if Blob token is unlinked.
  - Documented `BLOB_READ_WRITE_TOKEN` in `.env.example`.
  - Clean build verified with `npm run build` (Turbopack, Next.js 16.4.3).
- Meta SAM 3.1 Multi-Modal Visual Inspector Layer (2026-10-30):
  - Built interactive vision inspection suite powered by Meta SAM 3.1 (Segment Anything Model 3.1).
  - Backend: Upgraded [`/api/sam/route.ts`](src/app/api/sam/route.ts) with full-spread layout zero-shot segmentation extraction (characters, dialogue balloons, props) and point-prompt coordinate segmentation.
  - Frontend: Created [`src/components/SamVisionOverlay.tsx`](src/components/SamVisionOverlay.tsx) and embedded directly into [`src/components/ComicPageSpread.tsx`](src/components/ComicPageSpread.tsx).
  - Features:
    - Glowing bounding contours with category color-coding (purple for characters, emerald for speech balloons, blue for props).
    - Confidence badges (e.g. `99.2% SAM 3.1 match`).
    - Filter chips (`All Elements`, `Characters`, `Speech Balloons`, `Props & Items`).
    - Subject isolation mode (dims background to focus exclusively on the selected subject).
    - 1-click jump from a segmented character mask directly into their 5-tab Character Dossier Studio.
    - Verified clean production build with `npm run build` in ~2.5s across all 11 routes.
- Multiverse Story Branching & Re-draw Full Synthesis Pipeline (2026-10-30):
  - Fixed Re-draw pipeline:
    - `handleRegenerateCurrentEpisode` now regenerates BOTH the narrative script and synthesizes brand-new page artwork.
    - `handleGenerateArtwork` automatically falls back to high-res simulation preview if no API key is provided, ensuring zero 401 errors for evaluators.
  - Built ChatGPT-Style Multiverse Story Branching (`BranchTimelineModal.tsx`):
    - Creators can branch/fork reality from ANY episode in the series (`🌿 Branch Story`).
    - Two modes: "Fork New Alternate Universe (Keep Original)" and "Restart from Ep #X (Rollback)".
    - Preserves World Bible, cast dossiers, and all prior episode canon while starting an alternate timeline (e.g. `Late night Hero [Timeline B • from Ep #2]`).
    - Optional "What If" divergence prompt automatically kicks off the new branch's next episode.
    - Added quick branch trigger icons on every episode card in the sidebar archive.
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~0.98s across all 11 routes.
- Multi-Angle Character Visual Reference & Model Sheet Studio (Character Visual RAG - 2026-10-30):
  - Solved character visual drift by providing individual angle generation, preview, and canonical locking for character model sheets.
  - Implemented `/api/generate-character-image` supporting 5 specialized reference views:
    - 📋 **Complete Model Sheet** (Front, 3/4 & side profile turnaround lineup)
    - 👤 **Face / Portrait Close-up** (Facial anatomy, eye color, expressions, hair details)
    - 🧍 **Full-Body Concept** (Head-to-toe standing pose, torso, legs, boots, silhouette)
    - 🔄 **Back View Turnaround** (Coat/jacket back, hair silhouette from behind)
    - ⚔️ **Action Stance** (Dynamic heroic combat posture with signature gear)
  - Built interactive **Character Visual RAG & Model Sheet Studio** inside `CharacterDossierModal.tsx`:
    - View type selector pills with aspect ratio indicators.
    - Live prompt augmentation combining Character Physical Appearance + Signature Wardrobe + Iconic Accessories.
    - Concept gallery with individual view tags, timestamp, delete action, and full-resolution modal inspection.
    - 1-Click **"Lock as Canon Reference"** button that flags the model sheet as primary reference (`character.imageUrl` and `isLockedCanon: true`).
    - Option to paste direct custom image URLs.
  - Integrated into **Character Visual RAG Pipeline**:
    - `canon-rag.ts` indexes locked character references with `type: 'character_visual_ref'`.
    - `art-director.ts` injects locked model sheets and visual references into diffusion conditioning tokens.
    - Auto-archival into permanent Vercel Blob CDN (`persistToPermanentBlob`), returning persistent CDN URLs saved in MongoDB Atlas.
  - Visual continuity indicators in `ZenComicReader.tsx` and `UniverseBuilderStudio.tsx`:
    - Character cards and headers display the locked character concept thumbnail with a pulsating `🟢 CANON RAG` / `📸 Model Sheet` badge.
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.06s across all 12 routes.
- Cinematic Comic Reader & Zero-Wasted-Space Overhaul (2026-10-30):
  - Eliminated side margins and wasted whitespace on desktop:
    - Added collapsible sidebar with 1-click **Cinema Mode** toggle (`[ ◀ Cinema Mode ]`).
    - Added responsive canvas width selector (`Standard 896px`, `Wide 1152px`, `Cinema 1400px+`) allowing the comic spread to dynamically fill modern widescreen displays.
    - Added dark cinema backdrop toggle (`[ 🌙 Cinema / ☀️ Studio ]`), giving reading pages an authentic, high-contrast digital graphic novel presentation.
  - Eliminated scattered UI clutter:
    - Removed obtrusive standalone purple pacing banner above the comic; consolidated into an elegant expandable badge in the comic masthead.
    - Consolidated Issue #, Series Title, Episode Title, and Premise into ONE unified graphic novel masthead.
    - Removed floating overlay buttons that obscured Panel 1 of the comic; consolidated all actions (`SAM 3.1`, `Granular Studio`, `Re-draw`, `Zoom`) into an unobstructed toolbar directly above the comic page.
    - Removed duplicate `Studio Views` buttons from the sidebar.
    - Synced bottom Co-Director dock width with the selected canvas reading width.
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.39s across all 12 routes.
- Dual-Pane Creative Studio & Independent Right-Side Co-Director Deck (2026-10-30):
  - Solved user problem: The comic artwork and all generation controls were previously in one long scroll view, forcing users to scroll past the entire ~1200px comic image to reach the prompt dock, while leaving dead space on widescreen monitors.
  - Decoupled Reading Canvas and Control Deck into independent parallel viewports:
    - **Center Stage (Pure Comic Canvas)**: Dedicated solely to rendering the high-res graphic novel spread with its own clean vertical scroll. Removed bottom sticky prompt forms from obstructing or extending vertical scroll.
    - **Right Side Panel (Co-Director Studio & Page Controls)**: Viewport-height (`h-[calc(100vh-4rem)]`), sticky side panel with independent internal scroll. Provides zero-scroll access to continue the story while looking directly at the comic artwork on the left.
  - Two Segmented Tabs in Right Studio Deck:
    - **`[ ✨ Next Ep ]` (Story Progression)**:
      - Story premise / scene beat textarea with ⌘/Ctrl+Enter shortcut and character counter.
      - Interactive Meta AI Director Question branch cards with 1-click `↳ Option` injection.
      - Cast quick-mention tags (`@Hero`, `@Ally`, `@Villain`) and mid-story character introduction button.
      - Next episode layout selector (`Auto`, `1-panel`, `2-panel`, `3-panel`, `4-panel`).
      - Narrative lens/tone selector (`Candid`, `Empathetic`, `Satirical`, `Stoic`, `Engineer`).
      - Story beat inspiration chips with `🎲 Roll Ideas` contextual generator.
      - High-contrast primary CTA: `✨ Draw Episode #(N+1) →`.
    - **`[ 🎛️ Current Ep ]` (Page Studio & Dialogue Script)**:
      - Quick actions: Re-draw Page Art, Re-script Story, Branch Multiverse Timeline, Multi-Agent Trace, and Export PNG.
      - Art style visual selector (Webcomic, Manga, Noir, Cyberpunk, Vintage, Minimalist) with immediate re-draw.
      - Inline Script & Dialogue Editor: lists all panels and speech bubbles with direct live text editing and bubble deletion without covering the comic image.
      - Director pacing notes and canon continuity memory (new facts established, open threads).
  - Screen Space Optimization:
    - Eliminates dead space on 1440px and 1920px widescreen displays by balancing Left Sidebar (~320px) + Center Canvas (~750-900px) + Right Studio (~380-420px).
    - Top header includes dedicated `[ Studio Deck ]` toggle button.
    - Floating restore pill on the right edge allows 1-click re-opening if collapsed.
  - Responsive Mobile Fallback:
    - On mobile/tablet screens (`< lg`), desktop right panel collapses gracefully.
    - Added compact mobile bottom dock and upgraded mobile drawer with tabbed navigation (`World Bible & Ep` vs `Co-Director Deck`).
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.1s across all 12 routes.

- Visual Character Image Generator Studio & Multi-Angle RAG Pipeline (2026-10-30):
  - Solved user problem: Character Dossier previously functioned primarily as a text metadata form with no prominent artwork preview on load, and no way to individually generate, preview, and lock individual character body angles (Face, Legs/Full-Body, Back Turnaround, Action Pose, Master Model Sheet) for the downstream character RAG pipeline.
  - Upgraded `ComicCharacter` schema in `src/types/comic.ts`:
    - Added dedicated angle reference fields: `portraitRefUrl`, `fullBodyRefUrl`, `backViewRefUrl`, `actionPoseRefUrl`, `modelSheetRefUrl`.
  - Upgraded Character Visual Studio in `src/components/CharacterDossierModal.tsx`:
    - **Hero Visual Stage**: Large visual preview canvas always visible front-and-center with zoom inspector, active canonical RAG badges, and re-draw controls.
    - If no image is generated yet, displays an unmissable blueprint banner with prominent action buttons: `✨ Generate Face / Portrait Concept Artwork Now` and `⚡ Generate All 5 Angles at Once`.
    - **Interactive 5-Angle Selector & Lineup Cards**:
      - 👤 `Face / Portrait` (1:1 aspect ratio - facial structure, eye color, hair detail)
      - 🧍 `Full-Body & Legs` (3:4 aspect ratio - full height silhouette, boots, pants, posture)
      - 🔄 `Back Turnaround` (3:4 aspect ratio - rear coat silhouette, cape, hair from behind)
      - ⚔️ `Action Stance` (3:4 aspect ratio - combat posture with signature accessories)
      - 📋 `Model Sheet` (16:9 aspect ratio - multi-angle turnaround reference)
      - Each card features its live thumbnail preview, aspect ratio tag, `[ Generate ]` button, and `[ Lock for RAG ]` pipeline checkbox.
    - **1-Click Batch Generator (`handleGenerateAllAngles`)**: Sequentially synthesizes all 5 views with real-time progress steps (`Drawing Full-Body Concept (2/5)...`).
    - **Multi-Angle Pipeline Status Bar**: Visual indicators for `Face ✓`, `Full-Body / Legs ✓`, `Back ✓`, and `Master Sheet ✓`.
    - **Instant Auto-Save**: Both single-angle generation and batch generation call `onSaveCharacter` immediately upon completion, guaranteeing that generated art is permanently saved to MongoDB/localStorage even if the modal is closed.
  - Multi-Angle RAG Pipeline Upgrades:
    - `src/lib/agents/canon-rag.ts`: Indexes all 5 dedicated reference angles into episodic semantic memory citations (`relevanceScore: 0.95 - 0.99`).
    - `src/lib/agents/art-director.ts`: Injects face/eyes anchors, legs/costume anchors, rear turnaround anchors, and action stance anchors directly into image prompts.
  - Reader & Cast List Integration:
    - In `src/components/ZenComicReader.tsx`: Character cards in the left sidebar and right Studio Deck feature direct `📸 Visuals` / `🎨` studio buttons with live visual avatar previews.
  - Verified clean Next.js 16 Turbopack production build with `npm run build` in ~1.06s across all 12 routes.

- Total Purge of Pollinations AI & Official Meta Muse Image 1.0 Enforcement (2026-10-30):
  - Root Cause Diagnosed:
    - The client-side frontend was checking `!apiConfig?.apiKey` (browser state) and forcibly downgrading requests to `provider: 'simulation'`.
    - `/api/generate-character-image` and `/api/generate-image` previously fell back to `image.pollinations.ai` when `provider === 'simulation'`.
    - Pollinations recently enacted a strict 45-second public rate-limit ("1 free image every 45 seconds") returning a bright yellow advertisement banner that invaded character dossiers and comic pages.
    - Meanwhile, the user already had valid `META_MODEL_API_KEY` configured in `.env.local` on the server!
  - Fixes Implemented:
    - **Total Purge of Pollinations**: Removed `image.pollinations.ai` fallback completely across `/api/generate-character-image`, `/api/generate-image`, and `ComicPageSpread.tsx`.
    - **Server-Side Key Auto-Detection**: Backend routes automatically detect `META_MODEL_API_KEY` / `FIREWORKS_API_KEY` from `.env.local` and route directly to official Meta Muse Image 1.0 (`cleanBase + '/images/generations'`) or Fireworks FLUX without requiring client-side key entry.
    - **`/api/auth` GET Health Check**: Exposes secure zero-secret boolean status (`hasMetaKey: true`) so frontend boots directly into `mode: 'meta'` and `provider: 'meta-api'`.
    - **Automatic Cache Purge**: `upgradeWorlds` in `page.tsx` and `CharacterDossierModal.tsx` automatically detects and scrubs any stale `pollinations.ai` URLs from characters, model sheets, and reference lineups, replacing them with clean official Meta Muse generation.
    - Verified direct Meta Muse Image 1.0 generation returns HTTP 200 with 643KB high-res artwork.
    - Verified clean Next.js 16 Turbopack build with `npm run build` across all 12 routes.

- Universal Genre Overhaul & Dossier Typography / UX Upgrade (2026-10-30):
  - Addressed User Feedback: Comics are a storytelling medium, not just superhero/villain stories. The previous "⚡ Powers & Gear" tab with tiny 2-row text boxes pigeonholed all characters into combat superheroes with weapons and was cramped to read.
  - Upgraded Tab 4 to **`🎯 Skills & Belongings`**:
    - Built dynamic **Genre Lens Selector**:
      - ☕ **Slice of Life & Daily Life**: Profession, tradecraft, culinary, artistic, or social talents; carried belongings, messenger bags, cameras, sketchbooks, bikes.
      - 🕵️ **Mystery & Detective**: Forensic deduction, lockpicking, interrogation, photographic recall; investigation kits, bug scanners, trenchcoats, encrypted phones.
      - 🚀 **Sci-Fi & Cyberpunk**: Hacking, piloting, cybernetic reflexes; cyberdecks, HUDs, drones, plasma cutters.
      - 🪄 **Fantasy & Supernatural**: Arcane schools, beast-speech, apothecary herbalism; grimoires, wands, heirloom blades.
      - ⚡ **Action & Superhero**: Powers, martial arts, gadgets, armor.
    - Added 1-click **Quick Add Inspiration Chips** under each field that append relevant items/skills with one click.
  - Sizing & Readability UX Overhaul across ALL tabs:
    - Expanded modal width from `max-w-4xl` to `max-w-5xl`.
    - Upgraded textarea heights from cramped `rows={2}` to generous `rows={4}` / `rows={5}` (`min-h-[110px]` to `min-h-[140px]`).
    - Upgraded font sizes from strained `text-xs` (12px) to comfortable, crisp `text-sm sm:text-base font-medium text-zinc-950 leading-relaxed`.
    - Added high-contrast white card borders with clear focus states (`border-2 border-zinc-200 focus:border-zinc-950`).
  - Narrative Roles De-hardcoded from pure superhero terminology:
    - Updated presets to `Protagonist`, `Ally / Partner / Friend`, `Antagonist / Rival`, and `Supporting Cast`.
  - Upgraded `/api/expand-character`: Meta AI character generation prompt is now strictly genre-aware, generating realistic daily professions and belongings for slice-of-life and comedy universes instead of combat weapons.
  - Verified clean Next.js 16 Turbopack build with `npm run build` across all 12 routes.

- Dual-Pane AI Character Co-Writer Deck & Non-Superhero Role Expansion (2026-10-30):
  - Addressed User Feedback: When creating female characters (e.g. office romance), the creator was restricted to superhero roles like `Sidekick`, text boxes were hard to fill without an explicit directive side box, and users couldn't tell the AI: *"She is an office love of the hero nothing else, she is not a hero that saves earth"*.
  - Added Non-Superhero Narrative Roles across Schema & UI:
    - Added `love-interest` (`💕 Love Interest / Romantic Lead`) and `colleague` (`💼 Coworker / Colleague`) to `ComicCharacter['role']` in `src/types/comic.ts`.
    - Added to `ROLE_PRESETS` in `CharacterDossierModal.tsx` and `UniverseBuilderStudio.tsx`.
  - Built **AI Character Co-Writer Deck** (Side Directive Panel):
    - Persistent Dual-Pane Workspace: Left pane contains the spacious character form & tabs, while the right pane (`w-80 lg:w-96`) hosts the interactive AI Co-Writer Deck.
    - Modal width expands to `max-w-6xl xl:max-w-7xl` when the Co-Writer Deck is active.
    - **Natural Language Directive Box**: Creators type their vision in plain English (e.g. *"She is an office love of the hero nothing else, she is not a hero that saves earth. Works in marketing, warm, funny, keeps him grounded with filter coffee..."*).
    - **1-Click Quick Story Archetypes**:
      - `💕 Office Romance / Love Interest`: automatically populates realistic office romance directive, sets role to `love-interest`, gender to `female`.
      - `💼 Workplace Colleague / Teammate`: sets professional colleague directive and `colleague` role.
      - `☕ Grounded Coffee Shop Confidante`: sets neighborhood café anchor directive.
      - `🕵️ Tenacious City Reporter`: sets investigative journalist directive.
      - `⚡ Heroic Tactical Companion`: sets action combat directive.
    - **Action Controls**:
      - `✨ Fill Empty Boxes with Meta AI` (preserves existing creator text and fills blanks).
      - `🔄 Overwrite & Rewrite All Boxes` (re-synthesizes the full dossier to match directive).
    - **Targeted On-Demand Field Drafters**:
      - Individual draft buttons in the side deck for `📖 Origin Lore`, `🎯 Motivation`, `⚠️ Fatal Flaw`, `🔒 Secret Truth`, `🎨 Face & Body`, `👔 Outfit / Style`, `💬 Voice Cadence`, `🧠 Personality`, `💼 Skills / Job`, and `🎒 Belongings`.
  - Individual Field `✨ AI Fill` Buttons:
    - Placed individual `✨ AI Fill` buttons on every single field label across all tabs (Appearance, Wardrobe, Iconic Prop, Backstory, Motivation, Flaw, Secret, Voice Cadence, Catchphrase, Personality, Skills, and Belongings).
  - Backend Directive Priority Enforcement in `/api/expand-character`:
    - Reads `userDirective` and `targetField`.
    - System prompt strictly instructs Meta AI: *"If the creator specifies a non-superhero civilian (e.g. office romance, coworker, student, teacher, barista), STRICTLY OBEY and DO NOT invent combat powers, armor, weapons, or villain threats. Ground the skills in their actual profession or hobbies, and gear in everyday personal belongings."*
    - Fallback heuristic ensures romance/office leads get realistic workplace skills and belongings if offline.
  - Verified clean Next.js 16 Turbopack build with `npm run build` across all 12 routes.


- Elimination of Jarring Dark/Light Theme Mixing & Unified Light Theme Enforcement (2026-10-30):
  - Addressed User Feedback: User strongly disliked the jarring mixture of black, white, and dark blue elements across the app ("what with this balck , white , blue theme going on why cant we have single theme i dont like the dark one TBH , we will have drk theme later but i dont like mixing dark and light like this").
  - Root Cause Diagnosed:
    - `CharacterDossierModal.tsx` featured a massive pitch-black / dark indigo card (`bg-gradient-to-br from-indigo-950 via-zinc-900 to-black`) inside an otherwise white modal, with black inputs and buttons.
    - `ZenComicReader.tsx` defaulted `readerTheme` to `'cinema'`, which turned the entire background to pitch black (`#0c0d12`), the header to dark zinc, and the sidebar to dark black, clashing with the white comic elements and modals.
    - `ComicPageSpread.tsx` had its Granular Art Director Studio styled in pitch-black (`bg-zinc-950 text-white`) and page wrapper in `bg-zinc-950`.
  - Fixes Implemented:
    - **Single Unified Light Theme**: Standardized the entire interface onto MindStrip's signature warm editorial paper aesthetic (`#faf8f5` page canvas, crisp white `#ffffff` cards, clean `zinc-200` borders, and high-contrast dark `zinc-950` text).
    - **Character Visual Studio in `CharacterDossierModal.tsx`**:
      - Converted the Model Sheet Studio from dark indigo to clean light ivory/zinc (`bg-zinc-50 border-2 border-zinc-200 text-zinc-900`).
      - All 5 angle selector cards, hero preview canvas, toolbar, and inputs redesigned with crisp white surfaces, clean purple accents, and high-contrast text.
      - Co-Writer Deck header converted from dark gradient to light lavender (`bg-purple-50 border-b border-purple-200 text-purple-950`).
      - Injected continuity token box converted from pitch black to light zinc card.
    - **`ZenComicReader.tsx` Default & Cleanup**:
      - Defaulted `readerTheme` strictly to `'studio'` (light theme).
      - Removed the dark theme toggle so users are never dropped into the dark mode.
      - Converted floating sidebar restore pills to clean light styling (`bg-white/95 text-zinc-900 border-zinc-300`).
    - **`ComicPageSpread.tsx` Granular Studio**:
      - Redesigned Granular Art Director Deck from `bg-zinc-950` to `bg-white text-zinc-900 border-2 border-zinc-200 shadow-md`.
      - Converted all art style, layout, engine, and aspect ratio selector pills to clean light mode styling.
    - Verified clean Next.js 16 Turbopack build with `npm run build` across all 12 routes.

### Textless Graphic Novel Art & Diffusion Prompt Sanitizer (2026-10-30)
- **Root Cause Identified for In-Image Text Banners ("PANEL 1", "09:00 THE CALL", "SAVING EARTH")**:
  - Diffusion models (FLUX.1 Schnell and Meta Muse Image) possess strong text-rendering attention heads. Quoting negative targets in the positive prompt like `NO "Panel 1" or "Panel 2" labels` acted as a strong positive visual conditioning trigger, commanding the model to draw rectangular title banners containing `"PANEL 1"` and `"PANEL 2"`.
  - Furthermore, raw storyboard dumps containing timestamps (`09:00`, `22:30`) and all-caps scene headers (`THE CALL:`, `SAVING EARTH:`) were leaking into the image generation prompt string.
- **Architectural Solution Implemented**:
  1. **Strict Sanitizer Engine (`cleanPromptForWordlessArtwork`)**:
     - Strips all panel/scene/frame/beat numbering (`panel #? \d+`, `panel one`, `4-panel`).
     - Strips standalone timestamps (`\d{1,2}:\d{2}`).
     - Strips brackets, empty parentheses, and all-caps titles with colons (`THE CALL:`, `SAVING EARTH:`).
     - Strips any quotes (`"`, `'`, `“”`) so diffusion text-renderers never treat them as printable typography.
  2. **Pure Positive Visual Directive (`TEXTLESS_ARTWORK_DIRECTIVE`)**:
     - Completely removed quoted negative instructions.
     - Formulated using positive graphic novel terminology: `clean wordless sequential art, mute graphic novel illustration, unlettered clean comic art, pristine visual storytelling, silent comic page without typography, professional graphic novel publication.`
  3. **Frontend Sync & 1-Click Clean Re-Draw**:
     - `ComicPageSpread.tsx` now sanitizes narrative seeds and syncs prompt state on episode navigation.
     - Enhanced `🎨 Clean Re-Draw` buttons in reader and spread toolbars so creators can instantly re-render clean, unlettered graphic novel artwork with zero printed labels.

### 4-Scene Comic Grid Architecture & View Switcher (2026-10-30)
- **Why Re-Draw was generating a single full image**:
  - The image generation payload previously sent a consolidated summary of the story without sending the 4 panel beat objects, and the layout prompt was set to "borderless frame compositions", prompting diffusion models (FLUX/Meta Muse) to blend the entire story into 1 single panoramic illustration.
  - Furthermore, `ComicPageSpread` lacked a toggle between the full synthesized comic spread and individual sequential scene panels.
- **Architectural Solution**:
  1. **Spatial 2x2 Grid Prompting**:
     - `src/app/page.tsx` now passes the episode's `panels` array to `/api/generate-image`.
     - When `layoutStyle === '4-panel'`, `/api/generate-image/route.ts` and `art-director.ts` construct explicit spatial quadrant mapping: `Four sequential narrative frames in a 2x2 comic grid: Top-left frame depicts [Scene 1]. Top-right frame depicts [Scene 2]. Bottom-left frame depicts [Scene 3]. Bottom-right frame depicts [Scene 4].` separated by crisp white comic gutters.
  2. **Dual View Mode Switcher in Comic Page Spread**:
     - Added a segmented pill toggle: `🖼️ Full Comic Page` vs `📑 4 Sequential Panels`.
     - In `4 Sequential Panels` view, creators see all 4 scenes rendered as distinct comic panels with speech bubbles overlaid, sound effect badges (`⚡ BAM!`), character avatars, and inline dialogue editing.

### Dynamic AI Pacing vs. Hardcoding Verification (2026-10-30)
- Verified and reinforced dynamic AI pacing across all subsystems:
  1. **AI Showrunner Autonomy**: The Showrunner dynamically chooses between `1-panel` (climax splash), `2-panel` (dialogue duel / faceoff), `3-panel` (webtoon escalation strip), and `4-panel` (complete narrative arc) based on dramatic weight.
  2. **Image Generator Layout Adaptability**: `/api/generate-image/route.ts` prioritizes the Showrunner's decided panel count (`panels.length` = 1, 2, 3, or 4) when `layoutStyle` is `auto`, formulating the layout directives specifically for that format (widescreen 16:9 splash for 1-panel, side-by-side vertical gutters for 2-panel, vertical strip for 3-panel, and 2x2 grid for 4-panel).
  3. **UI Dynamic Rendering**: `ComicPageSpread.tsx` now dynamically adjusts grid columns and labels (`{panels.length}-Panel Sequential View`, adapting from 1 full splash to 2 cols, 3 cols, or 2x2) based on the actual panels drafted by the AI rather than padding fake panels.

### Universal Universe Context Pipeline (2026-10-30)
- **Problem Diagnosed**:
  - While Canon RAG was designed for episode drafting, other AI touchpoints were only passing fragmented metadata:
    - Character expansion (`/api/expand-character`) was only receiving `worldTitle`, `genre`, and a simple list of character names, omitting `worldLore`, `worldLaws`, `worldLocations`, `worldAttributes`, detailed cast traits, and recent episode developments.
    - Character image generation (`/api/generate-character-image`) was missing `worldTitle`, `genre`, and `worldLore`.
    - `generateMindStrip` in `src/lib/meta-models.ts` and `/api/generate` were omitting the `world` and `pastEpisodes` objects from `AgentContext`.
- **Comprehensive Solution Implemented**:
  1. **Character Co-Writer & Expansion (`/api/expand-character`)**:
     - `CharacterDossierModal.tsx` now passes the entire World Bible: `worldTitle`, `worldTagline`, `genre`, `worldLore`, `worldLaws` (title + rule), `worldLocations`, `worldAttributes` (key + value), detailed cast summaries (name, role, personality, backstory, motivation, catchphrase), and recent episode recaps.
     - `route.ts` injects this full persistent universe context into the Meta AI system prompt, guaranteeing that any character created or updated fits seamlessly into the world's lore, tone, physical/magical laws, and interpersonal cast web.
  2. **Character Concept Art (`/api/generate-character-image`)**:
     - Receives `worldTitle`, `genre`, and `worldLore`, blending the world's genre aesthetic into character model sheets, turnarounds, and action poses. Uses `TEXTLESS_ARTWORK_DIRECTIVE`.
  3. **Episodic Generation & Canon RAG (`generateMindStrip` & `/api/generate`)**:
     - `generateMindStrip` and `/api/generate` now receive the full `world` and `pastEpisodes` array from `src/app/page.tsx`, directly empowering `queryCanonRag` to index universe lore, canonical laws, staging locations, and unresolved threads across every episode generation.

### Live Animated RAG & Multi-Agent Production Pipeline HUD (2026-10-30)
- **Problem Diagnosed**:
  - Previously, during episode regeneration, Next Episode generation, or clean re-draws, the canvas showed a tiny spinning loader inside a small empty box ("Meta AI is Drawing Your Comic...") or sat frozen on the previous comic spread while a tiny button spinner spun, leaving creators completely in the dark regarding what the autonomous agents were doing.
- **Architectural Solution Implemented (`LiveRagPipelineTracker.tsx`)**:
  1. **Replaced Empty Loader with Full Animated Pipeline HUD**:
     - Replaces the small box and frozen canvas during `isLoading` and `isGeneratingArtwork` with an expansive, editorial multi-agent production dashboard directly on the comic spread canvas.
     - Also activates when launching Episode 1 ("Draw Episode 1: Origin") from World Bible mode.
  2. **Live Multi-Stage Pipeline Stepper & Dynamic Pulse Animation**:
     - **Stage 1 (Canon RAG Memory Retrieval)**: Reads World Bible, Universal Laws, Active Cast Dossiers, and Chronological Continuity Recaps.
     - **Stage 2 (Showrunner Dramatic Pacing)**: Analyzes dramatic premise, selects sequential panel layout (1-panel splash, 2-panel faceoff, 3-panel strip, 4-panel spread), writes beats, dialogue balloons, and sound effects.
     - **Stage 3 (Canon Continuity Auditor & Loop)**: Validates draft against universal laws & antagonist hostility; runs autonomous self-correction loop if violations occur.
     - **Stage 4 (Visual Art Director & Anchors)**: Injects character model sheet anchors and enforces strict textless / wordless comic prompt sanitization.
     - **Stage 5 (Neural Diffusion Synthesis)**: Meta Muse Image / FLUX.1 latent diffusion sampling sequential graphic novel frames into high-resolution artwork.
  3. **Real-time Live Telemetry Log Stream**:
     - Dynamic millisecond-accurate terminal stream displaying live agent thoughts and actions customized with the creator's actual world title, characters, laws, and selected art style.
     - Live elapsed stopwatch (`00:04.2s`) and animated gradient progress bar (`0%` to `100%`).
  4. **Frontend Integration**:
     - Integrated seamlessly into `ComicPageSpread.tsx` and `ZenComicReader.tsx`.
     - Preserves single unified light editorial theme (`#faf8f5`, white cards, zinc borders, and dark typography).
  5. **Verification**:
     - Verified with `npm run build` (0 TypeScript / Turbopack errors, all 12 routes clean).

### Authentic Graphic Novel Dialogue Overlay & Robust Context Purging (2026-10-30)
- **User Feedback Diagnosed**:
  1. *Disconnect between Comic Image and Panel View*: In "Full Comic Page", creators only saw a raw wordless illustration with zero speech bubbles or sound effects. Meanwhile, the "4-Panel Sequential View" only showed text cards without the artwork. The user rightly asked: *"what is this panel view, because the comic at the end is not those panels but the image, but the image is matching neither the panel, nor the character"*.
  2. *Stale / Deleted Character Context Leaking on Regeneration*: When a character was deleted or modified (e.g. removing sidekick "Vico" and defining "Meera" as a civilian who does NOT fight at night), clicking "Re-draw" or regenerating caused the old character to reappear fighting at night.
- **Root Causes Diagnosed**:
  1. `ComicPageSpread.tsx` only rendered dialogue bubbles in `spreadViewMode === 'panels'`, leaving `spreadViewMode === 'page'` completely silent.
  2. `buildStoryContext()` in `src/lib/story-context.ts` only read `world.episodes` directly and lacked support for passing an explicit `priorEpisodes` subset. When regenerating Episode 1, Episode 1 was passed into its own past chronological continuity, re-injecting the old deleted character's scene descriptions into the AI's prompt!
  3. `activeEpisode.rawBrainDump` was stale and never sanitized when cast members were deleted, passing obsolete character prompts to `generateMindStrip` and `/api/generate-image`.
  4. Character deletion in `ZenComicReader.tsx` only removed the character from `world.characters` without cleaning up existing episode speaker references.
  5. The Canon Auditor lacked rules to verify that characters in panels exist in the active World Bible cast, and that civilian non-combatants do not engage in superhero night combat.
- **Architectural Solution Implemented**:
  1. **Full Comic Page Dialogue & SFX Quadrant Overlay (`ComicPageSpread.tsx`)**:
     - Speech bubbles, character avatars, speaker labels, and dynamic sound effects (`⚡ SFX`) are now rendered directly over the synthesized comic page in their respective quadrants/panels (4-panel 2x2, 2-panel, 1-panel, 3-panel).
     - Includes a `[ 💬 Speech Bubbles: ON/OFF ]` toggle button in the toolbar so creators can toggle between reading dialogue and admiring unobstructed artwork.
     - Renamed view mode pills to: `[ 🖼️ Full Comic Page (Art + Dialogue) ]` and `[ 📑 Script & Scene Beats ({panels.length}) ]` with an explanatory guide banner.
  2. **Context Purging & Isolation on Regeneration (`page.tsx` & `story-context.ts`)**:
     - `handleRegenerateCurrentEpisode` now strictly computes `priorEpisodes` (`ep.id !== activeEpisode.id && ep.episodeNumber < activeEpisode.episodeNumber`). When regenerating Episode 1, `priorEpisodes` is empty (`[]`), completely isolating the new generation from the old draft.
     - `buildStoryContext()` now accepts and honors `episodesOverride`, preventing self-referential episode contamination.
     - Automatic obsolete cast detection: if an episode's old panels reference deleted characters, `effectivePremise` is purged and rebuilt using the current World Bible and active cast.
     - Updates `rawBrainDump` with the clean effective premise upon regeneration.
  3. **Universe-Wide Cascade Deletion & Renaming (`ZenComicReader.tsx`)**:
     - Deleting a character from `world.characters` cascades through `world.episodes`: reassigning dialogue spoken by deleted characters to active characters/Narrator and purging them from panel rosters.
     - Renaming a character cascades through all existing episodes.
  4. **Multi-Agent Cast Integrity & Civilian Role Fidelity (`canon-auditor.ts` & `showrunner.ts`)**:
     - Added `DELETED_OR_UNKNOWN_CHARACTER` audit check: flags any character not in active World Bible cast.
     - Added `CIVILIAN_COMBAT_VIOLATION` audit check: flags civilian characters performing superhero combat/martial arts.
     - Showrunner prompt strictly forbids deleted characters and enforces civilian role constraints. Local self-correction loop automatically purges unknown characters and corrects civilian actions to grounded non-hero reactions.
  5. **Verification**:
     - Verified with `npm run build` (Next.js 16.4.3 Turbopack, 0 errors across all 12 routes).
