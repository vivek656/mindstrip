# MindStrip Product Specification: Comic World-Building Engine

> **Document Version:** 1.0.0  
> **Source:** Direct Founder & User Discovery Q&A (October 2026)  
> **Core Mission:** A legitimate consumer and creator web application where users build and grow their own comic worlds, create recurring characters, and generate serialized comic episodes with an intelligent AI co-director.

---

## 1. The Core Vision: World-Building & Serialized Comics

Unlike generic one-off meme generators, MindStrip is a **persistent Comic World-Building Platform**:
- Users don't just generate a single disconnected strip; they **build their own comic universes**.
- They define their world's theme, aesthetic, tone, and recurring cast of characters.
- Users can create episodic storylines: Episode 1 ➔ Episode 2 ➔ Episode 3, with character continuity, evolving lore, and narrative arcs.

---

## 2. Key User Journeys

### Entry Screen: "Enter the Multiverse"
- **Visual Atmosphere:** Comic-inspired, immersive backdrop that sets a creative storytelling mood.
- **Two Primary Gates:**
  1. **"Start a New World" 🌟**
     - World Name & Premise (e.g., *"The 2 AM Dev Lab"*, *"Clinic Chronicles"*, *"Mars Colony 7"*, *"Coffee & Catastrophes"*).
     - Genre & Tone (e.g., Tech Satire, Cozy Slice-of-Life, Sci-Fi Mystery, Dark Comedy, Whimsical Fantasy).
     - Character Roster (Protagonist, sidekick, recurring antagonist/foil).
     - Visual Art Style (User selects their preferred visual aesthetic).
  2. **"Continue Existing World" 📖**
     - Select from saved user worlds / comic series.
     - Browse previously created episodes and panel archive.
     - Add the next episode or storyline branch seamlessly.

---

## 3. Intelligent AI Co-Director & Story Progression
- **Interactive Prompts & Brain Dumps:** User enters what happens in this episode (e.g. *"Our hero tries to deploy on Friday afternoon despite warnings"* or *"Mom's lab numbers are stable today but the car broke down on the way to clinic"*).
- **AI Narrative Intelligence:**
  - AI understands the established world and character personalities.
  - Suggests intelligent narrative pacing: setup ➔ escalating conflict ➔ twist ➔ punchline / cliffhanger.
  - Generates panel descriptions, expressive scene cues, and dialogue tailored to each character's voice.
- **User Agency:** The user can tweak dialogue, re-roll individual panels, change the story direction, or ask AI for creative plot ideas.

---

## 4. Visual Art Styles (User Selectable)
Users can choose or switch the art style for their universe:
1. **Modern Digital Webcomic:** Clean, expressive flat vector art with vibrant colors (Webtoon / Tapas style).
2. **Classic Manga / Screentone:** Dynamic black-and-white ink with manga speed lines and emotional expressions.
3. **Newspaper Vintage (Peanuts / Calvin & Hobbes):** Warm nostalgic paper, clean outlines, and timeless strip charm.
4. **Cinematic Noir / Graphic Novel:** High contrast, dramatic shadows, moody atmospheric palette.
5. **Minimalist Indie Line Art:** Crisp monochrome elegance, expressive character sketches.

---

## 5. Page Format: One Image, One Page
Every episode renders as a **single full-page comic image**, like a printed comic book. No panel grids, no panel-by-panel flip view, no strip/grid/webtoon toggles.
- The episode's `pageImageUrl` is the page. Clicking it does nothing; there is nowhere to flip to.
- Fallback chain when no page image exists: first panel image, then the legacy 4-panel grid (rare, offline cases only).
- Rationale (founder decision, Oct 2026): real comic books turn pages, not panels. Panel UIs tested as confusing; a single image reads instantly.

---

## 6. Export & Continuity
- 1-Click High-Res Image Export (PNG/JPEG) for individual episodes or entire strips.
- Social share cards with episode numbering and author watermark.
- Local/cloud world persistence: Character sheets and episode history saved to continue anytime.
