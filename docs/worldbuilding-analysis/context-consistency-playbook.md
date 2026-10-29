# MindStrip Context-Consistency Playbook
*Worldbuilding analysis: how AI Dungeon, NovelAI, and visual-story tools stay consistent — and what we must copy.*

## 1. Why we lose context today (verified in code)

- **Episodes are generated blind.** `handleGenerateNextEpisode` in `src/app/page.tsx` sends the new premise, art style, character sheets, world title, and genre — but never the previous episodes' stories, outcomes, or open threads. Episode 5 has no idea what happened in episodes 1–4.
- **Characters are adjectives, not anchors.** The image prompt carries appearance text ("tired eyes, hoodie") but every generation starts from noise with no visual reference, so faces and outfits drift every episode. Text descriptions alone cannot lock a face.
- **No memory layer exists.** There is no rolling summary, no pinned facts, no story bible object anywhere in `src/lib/`. `localStorage` stores episodes but they are never fed back into generation.
- **Prompts are rebuilt from scratch each call.** Nothing assembles prior canon under a budget; when a story outgrows the window, the beginning silently falls off — exactly the failure AI Dungeon documents.

## 2. How the best do it

### AI Dungeon — layered memory, not one big prompt
- **Memory (pinned block):** a small always-on text block repeated at the top of every call. Holds the 5–10 facts that must never be forgotten (who the hero is, the core conflict, standing rules).
- **Story Cards / World Info:** a database of entries (character, place, rule) with trigger keywords. Only entries whose keywords appear in recent text get injected — relevance-gated, so the window never floods.
- **Plot Essentials + Story Summary:** AI-written running summary plus a short list of load-bearing plot facts, refreshed every few turns.
- **Embedding retrieval (modern system):** old-but-relevant facts pulled back by similarity when the current scene echoes them.
- **Context Viewer:** they show the user exactly what the model sees. Debuggability is a feature.
- Lesson: position matters (pinned facts first, recent story last) and injection must be budgeted — every layer has a token cap.

### NovelAI — the most disciplined context plumbing
- **Memory at the very top**, then **Lorebook entries after it**, then recent text. Order is deliberate: global truths outrank local color.
- **Lorebook = keyed encyclopedia.** Name + description + trigger keys per entry (character sheets, rules, timelines). Activation is keyword-driven and silent.
- **Author's Note = always-on steering.** Style and tone directives that never fall off, kept tiny.
- Lesson: separate *fixed facts* (memory/lorebook) from *tentative ideas*, and give every entry unique trigger keys so activation is deterministic, not vibes.

### Visual consistency (Dashtoon, Midjourney `--cref`, Ideogram Character, ComfyUI/InstantID)
- **Reference-image anchoring wins.** One approved portrait per character ("visual DNA"), reused as input on every generation. Text prompts alone are a lottery.
- **Fixed appearance anchors.** Same outfit sentence, same hair sentence, same style suffix on every prompt — verbatim, not paraphrased.
- **Fewer faces per frame.** More than ~3 characters per image confuses every model; distribute cast across pages.
- **Full-page implication for us:** our page is one image, so the anchor must be the *cast lineup + style suffix*, identical every episode.

## 3. The playbook for MindStrip

Build these four layers, in order. Each is small; together they are the whole trick.

### Layer 1 — Story bible object (pinned memory)
One per world, stored beside episodes in `localStorage`, edited in the Studio:
- `premise` (1–2 sentences, immutable after episode 1)
- `cast` with fixed `appearanceAnchor` (one verbatim sentence each — this exact string goes into every image prompt)
- `rules` (max 5 world rules, e.g. "Maya never removes her red hoodie")
- `styleSuffix` (one verbatim art-style sentence appended to every image prompt)
- Cap: ~400 tokens. Injected FIRST in every generation call, mirroring NovelAI's memory-at-top.

### Layer 2 — Rolling episode summary (plot essentials)
- After each episode generates, a second tiny call (or the same call's extra JSON field) writes: `recap` (≤80 words), `newFacts` (bulleted canon additions), `openThreads` (unresolved hooks).
- Generation for episode N+1 receives: full text of episode N (recent story, highest weight) + recaps of N-1…N-3 + open threads. Older full text is dropped; recaps compress it. This is AI Dungeon's sliding window done right.
- Never regenerate a recap from the recap — always compress from full episode text once, then freeze it.

### Layer 3 — Relevance-gated lore injection (story cards lite)
- Character sheets already exist; add `triggers` (name + 2–3 aliases each).
- At generation time, scan the premise + last episode for trigger hits; inject ONLY matching sheets, each capped (~150 tokens). Our casts are small so this starts simple and grows into real keyword gating.
- Budget the whole assembled context (bible + recaps + sheets + premise) and truncate oldest-first when over cap.

### Layer 4 — Visual lock (one image per page)
- **Anchor lineup sentence**, identical every episode: "Cast: Maya — tired eyes, black hoodie, round glasses; Goblin — shadowy, yellow eyes…" built from `appearanceAnchor`s, never reworded.
- **Frozen style suffix** from the bible, e.g. "modern flat webcomic, bold ink outlines, halftone shading".
- **Seed discipline:** keep a per-world base seed; vary per episode deterministically (base + episode number) instead of random, so retries reproduce.
- **Continuity line in the page prompt:** "Same characters and outfits as previous pages. New scene: …" plus one line of last-episode recap so the art reflects story state (night, injuries, new items).
- Future upgrade path: reference-image input (character portrait stored at world creation, sent as image input where the provider supports it — Muse Image edits, `ideogram-character`-style endpoints).

### Continuity self-check (cheap, high value)
After generating episode text, run one assertion pass (regex + a tiny model call or even string match): every `appearanceAnchor` keyword present in the image prompt? Every open thread either continued or explicitly carried? Log violations to console and to the episode object. AI Dungeon's Context Viewer lesson: show the user what the model saw — add a "What the AI remembers" collapsible in the reader (bible + recap + injected sheets). It builds trust and makes drift debuggable.

## 4. Build order (smallest first)
1. `appearanceAnchor` + frozen `styleSuffix` in world creation; append verbatim to page prompts. (Half a day, kills the worst visual drift.)
2. Rolling `recap`/`openThreads` written per episode and injected into the next call. (Kills storyline amnesia.)
3. Trigger-gated character sheet injection + context budget with oldest-first truncation.
4. "What the AI remembers" viewer in the reader.
5. Seed discipline, then reference-image anchoring when a provider supports it.

## 5. Episode pointers: the chain, not just the last link (founder directive)

UX and internals are separate systems. The page shows one image; internally every
episode ever generated stays linked and reachable. Recency alone is not enough:
on episode 8, the AI must be able to go back to a named pointer ("in episode 3…")
and read what happened there and before it.

- **Full chain retention.** Every episode stores: full text, `recap` (≤80 words),
  `newFacts` (canon deltas introduced in that episode), and `episodeNumber`.
  Nothing is ever summarized away destructively — recaps compress, full text stays.
- **Assembled context per generation:** bible first, full text of latest episode,
  recaps of all earlier episodes (cheap, ~80 words each), plus canon deltas.
- **Pointer resolution (deterministic, no embeddings needed at our scale).**
  Parse the user's premise for references — `@ep3`, "episode 3", "when Maya
  first…" — and inject the FULL text of the referenced episode plus its recap
  chain up to that point. An episode mention is just a lorebook trigger whose
  entry is another episode.
- **"What happened before that pointer"** = recaps of episodes 1…N when the
  pointer is episode N. The AI gets the causal chain, not just the isolated scene.
- **Budget rule:** full texts included are latest + pointed-to only; everything
  else travels as recaps. Oldest recaps truncate first if the cap is hit.

## Sources
- [AI Dungeon memory system (three layers)](https://github.com/rjroy/adventure-engine-corvran/blob/HEAD/.lore/research/scene-boundaries.md)
- [AI Dungeon + NovelAI prompt-plumbing failure analysis](https://github.com/deathwalker-47/midnight-tavern-app/blob/HEAD/Audit/2026-08-02-PRODUCT-AUDIT/04-competitive-research.md)
- [AI Dungeon context assembly (memory, author's note, story cards)](https://discover.oreateai.com/discover/how-to-master-ai-dungeon-and-create-infinite-narrative-adventures)
- [NovelAI context ordering (memory top, lorebook after)](https://github.com/tapwavezodiac/novelaiukb/blob/HEAD/docs/Context.md)
- [NovelAI lorebook/memory/author's note guide](https://troiana.net/guides/novelai/)
- [Character consistency via reference images](https://www.aimagicx.com/blog/ai-comic-manga-generator-guide-2026)
- [Character consistency workflow (anchors, reference images)](https://github.com/robgruhl/hello-gpt-image/blob/HEAD/docs/06-consistency-workflow.md)
