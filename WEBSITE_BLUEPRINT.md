# EVRABO website blueprint

How to direct the creation of a website, from the first question to the last check.
It holds three things: **the questions** that must be answered first, **the formula** that has worked on EVRABO, and **the spec** that comes out of the answers and that the build follows.

**Read section 16 first ("The magic").** Sections 1 to 15 organise a page; section 16 is what makes it feel designed: derive the motion from the brand's own meaning (verbs), never copy another site's beats.

Technique recipes (video in letters, flips, sideways track, growing window) live in `SCROLLYTELLING_PLAYBOOK.md`. This file decides *what* to build and *why*; that one explains *how* a scroll scene is made.

---

## 0. How to use it

1. Answer the **intake questions** (section 2). Skip none of the starred ones (★). If the client doesn't know, write the default in the "If unsure" line.
2. Build the **one-page spec** (section 8) from the answers. Nothing is built before the spec exists.
3. Build following the **formula** (section 3) and the **rules** (sections 4 to 7).
4. Run the **checklist** (section 10) before anything is shown.

The rule above all: **the purpose decides everything.** If a section, effect or video does not push the visitor toward the one action in question 1.2, it is cut.

---

## 1. The formula (what has worked)

| Principle | In practice |
|---|---|
| **One purpose, one action** | Every page ends in a single clear action (reserve a prototype, buy, call). Secondary links stay quiet. |
| **Image carries, text points** | The picture or film delivers the idea. Text is a name, a number or three words. If it needs a paragraph, the visual is not doing its job. |
| **Big, direct, little** | Anton-style condensed caps, huge, one to three words. Small supporting line only when it adds a fact. |
| **Minimalist, brutal** | Black ground, white type, one accent (red). Hard edges, thin white frames, no gradients-as-decoration, no rounded cards. |
| **Show it being made** | The strongest scene on the site is the one that *proves* the offer on screen (a site going from sketch to live while you scroll). Prefer proof to claims. |
| **Real work over mockups** | Use the client's real photos, products, marks and films. Placeholders are listed and replaced before publishing. |
| **Few scenes, each earned** | 3 to 5 pinned scroll scenes plus plain sections. More scenes means less impact. |
| **Calm after loud** | After a big pinned scene, give a quiet panel or a plain section so the eye rests. |

What works on EVRABO now (live in `index.html`, `originals.html` and `prueba.html`):
- **Hero through letters:** the film shows only inside two giant black words on a white layer; one small line below; no timer, no rotation.
- **Question cards:** the client's question small, the answer giant, one picture, one line; black and white sections alternate; each plays once when it enters.
- Full-screen stacked chapters (one image or film plus one word each), a window that opens onto footage, tall photo panels with one big title, "In the oven" panels (photo, one name, one line), and the live builder as the close.
- **A product shown as the problem it solves,** with its name only as a small credit and one action.

What did **not** work, so don't repeat it: long scrollytelling with a lot of text per project (felt like a presentation), wide short project strips, per-image frames when the set should read as one block, hover that turns red when the message is "this goes to another page", a product shown only by its name, rotating hero headlines, and "live stream" gimmicks with invented viewers or chat.

---

## 2. Intake questions

Answer in short lines. Each question says why it matters and what to do if unsure.

### A. Purpose ★

| # | Question | Why | If unsure |
|---|---|---|---|
| 1.1 ★ | What is the site for, in one sentence? | Sets the whole structure. | "Show the work and get contact requests." |
| 1.2 ★ | What is the **one action** a visitor should take? (buy, reserve, message on WhatsApp, book, sign up, call) | Decides the CTA, the nav and the ending. | Contact form. |
| 1.3 ★ | Who is the visitor and what device are they on? (age, country, phone or desktop) | Decides weight, language, speed. | Phone first, Mexico/Spanish-English. |
| 1.4 | What do they believe before landing, and what should they believe after? | The story is the move from one to the other. | "Unknown brand" → "this team can build it." |
| 1.5 | How will we know it worked? (messages, sales, reservations per month) | Keeps the build honest. | Number of contact requests. |

### B. Brand and style ★

| # | Question | If unsure |
|---|---|---|
| 2.1 ★ | Three words for the feeling. Three words it must **not** feel like. | Raw, direct, fast / corporate, cute, busy. |
| 2.2 ★ | Theme: black, white, colour? Accent colour? | Black with white type, red accent. |
| 2.3 | Type direction: giant condensed caps, light elegant serif, clean grotesk? Any brand font? | Condensed caps for headlines, grotesk for support. |
| 2.4 | Three reference sites or images the client likes, and one they hate. | Ask for them; they speed up everything. |
| 2.5 | Words and effects that are **banned**. | Write them down; they become law. |
| 2.6 | Language(s) of the site. | One language per page. |

### C. Story ★

| # | Question | If unsure |
|---|---|---|
| 3.1 ★ | The one-line promise (what the brand gives). | Use the client's own name for the offer. |
| 3.2 ★ | The three proofs: the strongest things the brand can show. (products, projects, numbers, people) | Pick the three most visual. |
| 3.3 | The enemy or the tension (what the brand is against). | Skip if none. |
| 3.4 | Order of the story: promise → proof → offer → action? | Yes, that order. |
| 3.5 | Short hard lines the brand already says (slogans, manifesto). | Collect them; never invent claims. |

### D. Scrolltelling ★

| # | Question | If unsure |
|---|---|---|
| 4.1 ★ | How many pinned scenes? (3 to 5 is the sweet spot.) | 3. |
| 4.2 ★ | Which scenes? Pick from the menu in section 5, one per proof. | Opener, Proof scene, Close. |
| 4.3 | Which part must stay **plain** (no pinned scroll) so people can read or buy? | Product grids, prices, forms. |
| 4.4 | Reduced-motion and slow phones: static fallback is mandatory. | Always yes. |
| 4.5 | Maximum total scroll length? | About 8 to 12 screens. |

### E. Images and video ★

| # | Question | If unsure |
|---|---|---|
| 5.1 ★ | List every photo, mark, product shot and film available, with file names. | Do not start until this is listed. |
| 5.2 ★ | Who owns each one? Licence for logos of third parties, music, fonts? | Replace what isn't cleared. |
| 5.3 | Original, full-quality files for each video (not the compressed versions). | Keep originals outside the deployed site. |
| 5.4 | Is there audio? Does the client want sound, and where? | Silent by default; sound only behind a click. |
| 5.5 | What is missing and has to be shot or generated? | List it with a deadline. |
| 5.6 | Crop notes: which subject must stay in frame on a tall phone crop? | Check each image at 2:3 and 16:9. |

### F. Navigation

| # | Question | If unsure |
|---|---|---|
| 6.1 | Pages needed (home, work, contact, shop, others). | Home, Work, Contact. |
| 6.2 | Nav items (keep to 2 to 4). | Work, Contact. |
| 6.3 | Is the nav fixed and does it need to stay readable on dark and light sections? | Fixed, difference blend. |
| 6.4 | Mobile menu style. | Full-screen overlay with big words. |
| 6.5 | Where does every outbound link go and does it open in a new tab? | External in a new tab. |
| 6.6 | Pages that are not ready: what should they show? | A real 404 or "soon" panel, never a dead link on the home page. |

### G. Functions

| # | Question | If unsure |
|---|---|---|
| 7.1 ★ | What must the site **do**? (form, WhatsApp order, checkout, booking, filters, calculator, 3D viewer) | Contact form that pre-fills from a builder. |
| 7.2 | Where does the data go? (email, sheet, CRM, WhatsApp, Shopify) | Email plus WhatsApp link. |
| 7.3 | Payments, stock, languages, accounts? | None unless stated. |
| 7.4 | Analytics and tracking needed? | Basic page-view analytics only. |
| 7.5 | Hosting and domain, and will it later move into a CMS (Shopify, etc.)? | Static now; keep each scene as an isolated section. |
| 7.6 | Who edits content later and how? | A short "how to change X" note in the repo. |

### H. Constraints

| # | Question | If unsure |
|---|---|---|
| 8.1 | Deadline and budget. | Ship scene by scene. |
| 8.2 | Performance budget: page weight and what phones it must run on. | First view under about 3 MB, videos load lazily. |
| 8.3 | Legal: privacy text, cookie notice, claims, prices. | Add if collecting data. |

---

## 3. From answers to structure

### 3.1 Pick the page skeleton by purpose

| Purpose (Q1.1) | Skeleton |
|---|---|
| **Agency / studio** (sell the service) | Hero through letters → the client's questions as question cards (designer? cost? scope? ownership?) → a product as a problem card if there is one → live builder → contact |
| **Single product or shop** | Hero product → proof scene (product in use) → sideways reel of variants → plain grid with prices → buy |
| **Catalog / WhatsApp store** | Hero → pinned product showcase (one hero product at a time) → plain filterable catalog → order via WhatsApp |
| **Event / launch** | Title card over trailer → dates and lineup as flipping words → tickets |
| **Portfolio** | Name opener → project panels (photo, name, one line) → contact |

### 3.2 Scene menu (pick one per proof)

| Scene | What it shows | Source of the idea |
|---|---|---|
| **Hero through letters** | Giant black words on a white layer; the looping film shows only inside the letters. Two words, one small line, no timer | `index.html` / `prueba.html` hero |
| **Question card** | The client's question small, the answer in one to three giant words, one picture, one line. Black and white cards alternate | `prueba.html` |
| **Problem card (for a product)** | Same card, but the answer is what the product does for them ("Matched."); a diagram or screenshot shows it; the product name is a small credit; one action ("Ask for a demo") | `prueba.html` `#vad` |
| **Live build** | A site going from sketch to design to code to live inside a window, one word per stage | EVRABO "How a site gets built" (archived) |
| **Stacked chapters** | Full-screen image or film per chapter, one word each, next chapter slides up over the last | `index.html` "AID" |
| **Window opens** | A tiny window of footage grows to full screen while two giant words slide in and lock into a diagonal | `index.html` "Free prototype" |
| **Tall panel row** | Three tall photos side by side under one centred word, one white frame around the whole block | `originals.html` / EVRABO "Originals" |
| **Oven panels** | Tall full-bleed photo panels, grey until hover, one name, one line, one arrow | `originals.html` |
| **Live builder (close)** | The visitor picks what, feel and name; a preview takes shape; the button carries the choices to the form | `prueba.html` `.pb` |
| **Sideways reel** | Cards travel sideways in 3D | Playbook recipe |

Rule of thumb: **one proof, one scene, one word.** If a scene needs three paragraphs it is the wrong scene.

**Showing a product (rule).** A stranger doesn't know the product, so a name alone sells nothing. Order: the problem as a question → the result as one word → a picture or diagram of it working → the name as a small credit → one action. Real screenshots replace any example diagram as soon as they exist, and an example is always labelled "Example".

### 3.3 Hover and interaction language

- Links that leave the page: a white underline draws across the word and an arrow slides in. No colour change to red.
- Photo panels that are links: grey until hover, then colour, only when the photo is decorative. If the photo *is* the product, keep it in full colour all the time.
- Buttons: solid white with black type, inverting on hover.
- Cursor: custom dot on desktop only, hidden on touch.

---

## 4. Copy rules

1. **Words are big and few.** One to three words per beat. A supporting line is one short sentence.
2. **Facts, not adjectives.** "Free first prototype", not "amazing solutions".
3. **No explaining what the company does** inside a scene; show it.
4. **Never invent proof**: no made-up viewer counts, reviews, chat, numbers or logos. Use only real, cleared material.
5. **Banned list from Q2.5** is checked against every line before publishing.
6. **Years and facts are verified** with the client (e.g. a project's year).
7. One language per page; check accents and special characters render.

---

## 5. Images and video rules

**Images**
- Source at least 2x the largest displayed size; export JPG or WebP (PNG only for marks with transparency).
- Check every image at both shapes it will appear in: tall (2:3, phone) and wide (16:10). Set `object-position` per image so the subject stays in frame.
- Marks and logos on photos: use `mix-blend-mode: screen` on a white mark so the photo shows through the black.
- Every image has real `alt` text unless it is purely decorative.

**Video**
- Keep the **original** master outside the deployed site. Deploy a web version.
- Web version: H.264 MP4, `faststart`, muted for autoplay with `playsinline`. A poster image for every video.
- **Quality floor:** full-screen film needs a healthy bitrate. About 2.5 Mbps at full-screen size looks soft; aim for roughly 5 to 8 Mbps at 1080p for hero and manifesto films, and weigh that against the size budget. Small windows and loops can be lighter.
- Short loops (under 20 s) for hero and scene backgrounds; long films get their own page and a play button.
- Load lazily: set the source only when the video is near the viewport; pause when it leaves.
- Sound only after a click. If a film has timed words, retime them whenever the film is swapped and write the timing in a table.
- Videos must be rights-cleared (footage, music, third-party logos).

---

## 6. Navigation rules

- Two to four items. The home logo goes to `/`.
- Fixed nav with `mix-blend-mode: difference` so it reads on dark and light.
- No link on the home page may lead to a missing page. Unfinished pages are removed from the home page or point to a real "soon" panel.
- Every external link opens in a new tab with `rel="noopener noreferrer"`.
- Anchor links scroll smoothly and land below the fixed nav.
- Each page has its own `<title>`, description, canonical URL and social image. Update `sitemap.xml` when a page is added or removed.

---

## 7. Technical rules (learned the hard way)

1. **Pinned scenes need `position: sticky` to work.** Never put `overflow-x: hidden` on `html` or `body` of a page with pinned scenes: it makes them scroll containers and the pinned scene scrolls away. Use `overflow-x: clip`.
2. **One scroll value per scene.** Each scene is a pure function of its progress (0 to 1). Only `transform`, `opacity` and `clip-path` change per frame. No timers fighting the scroll.
3. **Static fallback is part of the build.** The pinned behaviour only exists when a class is added from JavaScript and motion is not reduced. Without it, the same content shows as normal sections.
4. **Only update what is on screen.** Skip scenes outside the viewport, use `requestAnimationFrame`, play and pause videos with an `IntersectionObserver`.
5. **Phones are their own layout.** Taller, narrower panels; smaller type clamps; scenes that depend on width get a phone variant or a plain stack.
6. **Don't leave dead code.** When a section is replaced, remove its CSS, JS and unused assets in the same change.
7. **Keep each scene isolated** (own section, own CSS block, own script block, relative asset paths) so it can move into a CMS theme later.
8. **Check scripts parse** and the page loads over `http://`, not `file://`.
9. **Assets are verified**: every `src` and `url()` points to a file that exists; large originals stay out of the deployed folder.
10. **Version the decisions.** Commit each approved direction, so any version can be restored (the previous index came back from git history).

---

## 8. The one-page spec (output of the questions)

Fill this before building. It is the document the build follows.

```
SITE: <name>                         DATE: <>
PURPOSE: <1.1>
ONE ACTION: <1.2>
VISITOR: <1.3>
FEELING: <2.1 three words>   NOT: <three words>
THEME: <colours, accent>     TYPE: <fonts>
BANNED: <words / effects>

SKELETON: <from 3.1>
SCENES (in order):
  1. <name> | purpose: <proof> | words: <1 to 3> | media: <files> | plain fallback: <>
  2. ...
PLAIN SECTIONS: <grids, forms, prices>

NAV: <items>                  PAGES: <list + status>
FUNCTIONS: <form, whatsapp, shop...> | data goes to: <>
MEDIA LIST: <file | owner/licence | status | crop notes>
MISSING: <what must be made | who | when>
PERFORMANCE: <budget>        HOSTING: <>
OPEN QUESTIONS: <>
```

---

## 9. Build order

1. Spec approved.
2. Skeleton with real text and real media, no effects. Check on a phone.
3. Nav, footer, metadata, fallbacks.
4. Functions (form, links, order flow) working end to end.
5. Scenes, one at a time. Each is shown and approved before the next.
6. Polish: type, spacing, hover language, loading.
7. Rights and content pass.
8. Checklist (section 10), then publish.

---

## 10. Checklist before showing anything

**Purpose**
- [ ] The one action is clear in the first screen and at the end.
- [ ] Every section earns its place against the purpose.

**Story**
- [ ] The scenes read as promise → proof → offer → action.
- [ ] No scene needs more than three words to be understood.
- [ ] No invented proof anywhere.

**Visual**
- [ ] Theme, accent and type match the spec.
- [ ] Every image checked at tall and wide crops.
- [ ] Videos are sharp at full screen and have posters.
- [ ] The image, not the text, carries each panel.

**Navigation**
- [ ] No link leads to a missing page.
- [ ] Nav readable on every section; mobile menu works.
- [ ] Titles, descriptions, canonical URLs and sitemap updated.

**Function**
- [ ] Form, ordering or checkout works end to end.
- [ ] Data reaches the right place.

**Technical**
- [ ] Pinned scenes stay pinned (no `overflow-x: hidden` on `html`/`body`).
- [ ] Reduced motion shows the same content without pinning.
- [ ] Phone layout checked for every scene.
- [ ] Scripts parse, assets exist, dead code removed.
- [ ] Page weight within the budget.

**Rights**
- [ ] Footage, images, fonts and sound are cleared.
- [ ] Third-party logos and sponsors replaced or approved.

---

## 11. Fast brief (copy, fill, send)

```
Build a site for <brand>. Purpose: <one sentence>. One action: <action>.
Feel: <3 words>. Not: <3 words>. Theme: <black/white>, accent <colour>.
Scenes: <e.g. hero film, live build, tall panels, close>.
Media: <files and owners>. Pages: <list>. Functions: <list>.
Banned: <words/effects>. Language: <>. Phone first: <yes/no>.
Follow WEBSITE_BLUEPRINT.md. Ask me the starred questions before building.
```

---

## 12. General design quality (applies to any website)

These hold regardless of brand. Check every page against them.

**Hierarchy**
- One thing is biggest on every screen. If two things compete, shrink one.
- Three type levels are enough: giant (headline), small caps with wide tracking (label), plain (support). More levels means noise.
- The eye should land in this order: image, headline, action. Never on a paragraph.

**Space and alignment**
- One side margin for the whole page (here 4vw; 3vw on full-bleed panel pages). Everything aligns to it.
- Spacing comes from a small set of steps (about 1rem, 2rem, 4vh, 8vh, 14vh). Don't invent a new gap for each block.
- Empty space is part of the design. Give a big headline room equal to its own height.
- Edges are hard: straight rectangles, 1 to 2px lines, 2px gaps between panels. No rounded cards, no soft shadows as decoration.

**Type**
- Headlines: condensed display caps, line-height 0.82 to 0.95, slight positive tracking. Support text: grotesk, 0.7 to 1rem, wide tracking (0.2 to 0.5em) when uppercase.
- Size with `clamp()` so it scales from phone to wide screen; check the longest word fits at 360px.
- Text over images always gets a shade or shadow that guarantees contrast. Body text keeps at least 4.5:1.

**Colour**
- Neutral ground, one accent used sparingly (red appears on dots, badges and tiny marks, not on large areas).
- If the accent is used for hover, it must not collide with the meaning of that hover (link-out feedback is an underline and an arrow, not a colour).

**Imagery**
- One idea per image. Crop for the subject, not for the grid.
- Treat all photos the same way (same brightness and grain) so the page feels like one piece.
- Never stretch; never upscale small files; never use a watermark, a stock-looking image or someone else's logo.

**Motion**
- Motion explains something (it builds, reveals or leads to the next thing). If it only decorates, cut it.
- One easing family (`cubic-bezier(0.16, 1, 0.3, 1)` for settles); short durations for entries (0.16 to 0.22s), longer for reveals (0.5 to 1.2s).
- Only `transform`, `opacity` and `clip-path` animate per frame.
- Never more than one thing moving to get attention at a time.

**Consistency**
- Same button, same label style, same arrow icon, same hover everywhere.
- Same words for the same thing across pages (one name per product, one name per action).

**Finish**
- Real focus styles, real `alt` text, correct `<title>` per page, a favicon, no console errors, no layout jump on load, no horizontal scroll at any width.

---

## 13. Design tokens (EVRABO defaults; change per brand, keep the structure)

```css
:root {
  --black: #050505;   /* ground */
  --white: #f0f0f0;   /* type and lines */
  --red:   #ff1a1a;   /* accent: dots, badges, thin marks only */
  --gray:  #1a1a1a;   /* hairlines, footer rule */
}
```

| Token | Value |
|---|---|
| Display font | `Anton` (local file `assets/fonts/anton.css`), caps |
| UI / body font | `Space Grotesk` 300 to 700 |
| Japanese or secondary mark | `Zen Kaku Gothic New` 300, `letter-spacing: 0.12em`, katakana line under at `0.6em` tracking |
| Huge heading | `clamp(3.4rem, 12vw, 12rem)`, line-height 0.9, tracking 0.02 to 0.03em |
| Word-of-the-beat | `clamp(3.6rem, 14vw, 15rem)`, line-height 0.82 |
| Panel name | `clamp(1.3rem, 2vw, 2rem)`, tracking 0.1em |
| Label / kicker | 0.65 to 0.75rem, tracking 0.3 to 0.5em, uppercase, opacity 0.6 to 0.85 |
| Support line | `clamp(0.85rem, 1.2vw, 1.05rem)`, tracking 0.22em, uppercase |
| Nav | padding `2rem 4vw`, logo Anton 1.8rem tracking 0.15em, links 0.85rem tracking 0.1em, `mix-blend-mode: difference` |
| Side margin | 4vw (3vw on full-bleed panel pages, 5vw on phones) |
| Section rhythm | 8 to 14vh vertical padding |
| Lines | 1px at 25% white for rows; 2px solid white for frames |
| Panel gap | 2px on a black ground |
| Primary button | solid `#fff`, black Anton text 1.1 to 1.2rem, tracking 0.14em, inverts on hover with a 2px white outline |
| Quiet link | 0.8rem, tracking 0.35em, 1px underline at 50% white, full on hover |
| Link-out hover | underline scales from 0 to 100% and a small arrow slides in; no colour change |
| Image hover (decorative photos) | grayscale + brightness 0.4 to 0.55 at rest, colour + 0.6 to 0.85 on hover (touch: colour while on screen) |
| Entry animation | `punch` 0.16 to 0.22s: from translateY 0.12em, skewX -8deg, blur 8px to sharp |
| Settle easing | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Overlays | noise at 0.04 opacity; scanlines at 0.03 (optional, off for clean brands) |
| Cursor (desktop) | 12px dot + 40px ring, difference blend; hidden on touch |
| Breakpoints | 768px (nav, stacks), 700px (scene variants), 640px (panels) |

Tall panel row, the working snippet (three images under one centred word, one frame around the block):

```css
.og-row { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: #000; }
.og-p   { aspect-ratio: 2 / 3; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.og-title { position: absolute; z-index: 5; left: 50%; top: 50%; transform: translate(-50%, -50%); white-space: nowrap;
            font: 400 clamp(3.4rem, 15vw, 15rem)/0.9 'Anton'; text-transform: uppercase; color: #fff; text-shadow: 0 0 5vw rgba(0,0,0,.6); }
.og-row::after { content: ''; position: absolute; z-index: 3; inset: clamp(.8rem, 1.6vw, 1.6rem); border: 2px solid #fff; pointer-events: none; }
@media (max-width: 700px) { .og-p { aspect-ratio: 3 / 5; } }
```

Question card, the working snippet (the client's question small, the answer giant, one picture; it plays when it enters the screen, nothing is pinned):

```css
.q { min-height: 100svh; padding: 16vh 4vw 10vh; display: grid; grid-template-columns: minmax(0,1.25fr) minmax(0,1fr); gap: 4vw; align-items: center; }
.q.dark { background: #050505; color: #f0f0f0; }  .q.light { background: #f0f0f0; color: #050505; }
.q-ask { position: absolute; left: 4vw; top: 13vh; font-size: .8rem; letter-spacing: .4em; text-transform: uppercase; opacity: .7; }
.q-ans { font: 400 clamp(5rem, 19vw, 21rem)/.84 'Anton'; text-transform: uppercase; opacity: 0; }
.q.in .q-ans { opacity: 1; animation: punch .28s cubic-bezier(.16,1,.3,1) both; }
/* JS: an IntersectionObserver (threshold .35) adds .in; reduced motion shows everything at once */
```

Hero through letters, the working snippet:

```css
.hero { position: relative; height: 100svh; background: #050505; overflow: hidden; }
.hero video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-mask { position: absolute; inset: 0; background: #fff; mix-blend-mode: screen; display: flex; flex-direction: column; justify-content: center; padding: 0 4vw; }
.hero-mask b { font: 400 clamp(5rem, 23vw, 26rem)/.82 'Anton'; text-transform: uppercase; color: #000; }  /* black = window onto the film */
```

---

## 14. Reference implementations (where each thing already exists)

Open these before rebuilding anything similar. Paths are in this repository.

| Pattern | Where |
|---|---|
| Hero: film shows through the letters, "You bring / the name", Ascend triangle | `index.html` and `prueba.html`: `.hero`, `.hero-mask` |
| Question card (question small, answer giant, one picture, one line) | `prueba.html`: `.q`, `.q-ask`, `.q-ans`, `.q-vis` |
| Problem card for a product (VADMatch: invoices vs payments) | `prueba.html`: `#vad`, `.mt` |
| Live builder as the close (type, feel, name, reserve) | `prueba.html` and `originals.html`: `.pb` |
| Online Identity block | `index.html`: `.identity` |
| Stacked full-screen chapters | `index.html`: `.s-aid` and `stack('aid')` in the story-engine script at the bottom |
| Window that opens + diagonal giant words | `index.html`: `.s-offer` and the offer block in the same engine |
| Story engine (one progress value per stage) | `index.html`, last `<script>` |
| "In the oven" panels | `originals.html`: `.oven`, `.oven-panel` |
| Project panels (tall, image-first) | `originals.html`: `.ship-panel` |
| Timed words over a film (one cue table + punch) | `ascend.html`: `CUES`, `.word.on`; the text is in `MANIFESTO.md` |
| Sketch → design → code → live scene | git `b8bf57a:index.html`, `#build` (`.s-build`) |
| Camera across a canvas ("What we build") | git `b8bf57a:index.html`, `#all` (`.s-all`) |
| Live build room (livestream look) | `katana.html` (current; rejected as a final direction) |
| Original Katana issue page | `git show HEAD:katana.html` |
| Scroll scene technique notes | `SCROLLYTELLING_PLAYBOOK.md` |

Restore any old version with `git show <commit>:<file>`.

---

## 15. Rejected list (and the reason)

Don't propose these again without a new reason.

| Rejected | Why |
|---|---|
| Long scrollytelling per project (pinned scene with a paragraph and buttons) | Too much information; felt like a presentation, not like the brand |
| Wide, short project strips | The image loses weight; projects should be tall |
| A frame on each image | The set should read as one block with one frame |
| Red colour change on hover for links | Should signal "this goes to another page" (underline + arrow) |
| Colour reacting to the cursor on the Originals row | Those images should stay in full colour |
| Hero kicker "Your online studio" over the video | Removed on purpose; the headline and one line are enough |
| Livestream room with LIVE badge, clock and status | Didn't land as a direction; viewer counts or chat would be invented |
| Placeholder cards linking to the 404 page from the home page | Dead links; unfinished pages must not be linked |
| Third-party stock images on the home page (external CDN) | Rights and reliability |
| Manifesto film compressed to about 2.5 Mbps | Looked low quality full-screen |
| `overflow-x: hidden` on `html` and `body` with pinned scenes | Breaks `position: sticky`; the scene scrolled away |
| Faster, one-word-per-beat Ascend cues | The approved words and timing stay as committed |
| "FUTURE IS ON / We are Champions / NO FEAR" hero headlines | Replaced by the studio's own message |

| A product shown only by its name (VADMatch as a project title) | A stranger can't act on a name. Show the problem, the one-word answer, a picture of it working; the name is a small credit and there is one action |
| Rotating headlines over the hero film | Replaced by the film showing through two giant words ("You bring / the name"); one message, no timer |
| prueba.html as a copy of index.html | prueba is the lab for new ideas; the index is the real home page |

Add a line here whenever something is turned down, with the reason in the client's words.

---

## 16. The magic: how a site feels designed (do not copy a site, derive from the brand)

Studied: the AID Shopify theme (`AIDWP`: `assets/home.css`, `assets/home.js`). The lesson is **not** its beats (coin, sliding rows, growing image). Copying those makes a clone. The lesson is the **six things it does**, which any brand can do with its own meaning.

### A. The six things (analysis of what moves and why)

| Dimension | What AID does | The principle (brand-neutral) |
|---|---|---|
| **Movement** | Scroll drives everything. Pinned stages, one progress value each, damped so it feels heavy. Only transform, opacity, clip-path change. | The scroll is the director. Motion is a function of position, never a timer. Heavy, slow, confident. |
| **Meaning of the motion** | "One of one" = one coin turning against repeating rows. "Bold" = an image breaking out to full-bleed, a word slamming in front. The line between AID and EVRABO draws itself. | **The movement is the message.** Choose the motion that physically acts out the sentence. If the motion could carry any other sentence, it is decoration. |
| **Font** | One display face (Anton) at wall-to-wall scale, tight line-height, caps; small wide-tracked grotesk only as labels. Hollow (outline) versus solid. | Few words, giant. Hollow vs solid is a state change: "not yet" vs "done". |
| **Storytelling** | Five beats, each a different mechanism, each understood in about two words. Calm beat between loud ones. | One idea per beat. No two beats move the same way. The sequence is the story; words only accompany. |
| **Colour** | Black ground, near-white type, red used for one thing at a time (a line, a dot, a flag). A white stage as contrast. | Neutral world, one accent with a job. Alternating black and white stages give rhythm. |
| **Image participation** | Images are material the motion works on (a frame that grows, a drifting full-bleed), never a picture beside a title. Posters and films are shown at full colour. | The image is an actor or a material: it is revealed, built, grown. Never decoration. |

### B. How to make it your own (the method)

1. **Write the brand's meaning as verbs.** EVRABO: *you bring a name; we build it; it goes live; it becomes a site, a shop, an app, a tool; AID draws, EVRABO builds; the proof is free; one team.*
2. **Find the physical event for each verb.** Build = parts assemble from wireframe to filled. Bring a name = the visitor types it. Live = a red dot starts blinking. One team = two halves slide together and lock. Free = the real work plays through the number.
3. **Find the one object that carries the whole story.** AID: its mark. EVRABO: **the visitor's own name** and **one window** that is built, goes live and changes into everything. The object persists across beats (and across pages).
4. **Give each beat a different mechanism** (type-in, draw, wipe, slide-and-lock, film inside letters, fill) and at most three words.
5. **Image as material.** Real work fills the blocks as they are built; it is never placed next to text.
6. **Static fallback** and a phone variant for every beat.

### C. The rules (kept from the analysis)

1. Tall section, sticky pin, one progress value; draw is a pure function of it.
2. Smooth the progress: `K = 1 - exp(-dt / 80)`, `sm += (target - sm) * K`; ease in-out; no CSS transitions on scroll-driven things.
3. Only transform, opacity, clip-path, stroke-dashoffset per frame; reads before writes; skip off-screen stages; never transform a playing film (move its container or use a poster).
4. Hand-offs: the end state of a beat is the start state of the next (black to black, full-bleed to full-bleed).
5. Scale is the style: type and objects bigger than the viewport (`min(46vw, 80svh)`).
6. Hollow vs solid carries meaning; red once per beat at most.
7. The visitor is part of it: if the brand sells something personal, let them type, pick or drop something that the page then uses.
8. A calm, plain beat between loud ones.

### D. EVRABO_static: meaning to motion (this is the reference implementation)

| Beat | Meaning | Motion | Where |
|---|---|---|---|
| Hero | You bring the name | The visitor types it; the film plays only inside the letters; the name is saved | `index.html` `#hero`, `assets/site.js` |
| The build | We build it, it goes live, it becomes everything | One window: frame draws, url types, wireframe dashes fill with real photos, red LIVE blinks on, then the same window wipes into a shop, an app, a tool. Giant word changes: Sketch, Build, Live, Shop, App, Tool, One team | `#build` |
| Two hands | AID draws, EVRABO builds, no designer needed | Two halves slide in from the edges, a red seam draws between them, a giant NO. punches across both | `#duo` |
| $0 | The first prototype is free | The real work plays inside the number and drifts as you pass | `#zero` |
| Matched | VADMatch: every invoice matched to its payment | Three lines draw one by one, the word fills hollow to solid, unmatched rows are flagged red | `#match` |
| Close | Your name is next | Your typed name fills from hollow to solid; the reserve button carries it to the form | `#close`, `contact.html` |
| Originals | Projects born in the void | Letters rise from the floor; three tall panels rise one after another; the oven bars fill with the real progress and light the photo | `originals.html` |
| Contact | Get in touch | Title lines rise; the name typed on the home page pre-fills the prototype form | `contact.html` |

The scroll engine is `EVRABO_static/assets/story.js` (`Story.add(section, draw, 'pin' | 'pass')`). Reuse it unchanged.

### E. What the first blueprint got wrong

- It described content blocks, so pages were stacks of blocks. A stack never feels designed.
- It treated motion as decoration ("punch in when visible"). Here motion is the content.
- It let the picture sit beside the text. Here the picture is what gets built.
- Then a second attempt copied another site's beats. Copying beats is not understanding; derive them from the brand's own verbs (method B).

### F. Checklist for a "wow" page

- [ ] The brand's meaning is written as verbs, and each beat acts one out physically.
- [ ] One object (here the visitor's name and one window) carries the story across beats and pages.
- [ ] No two beats share a mechanism; none is borrowed unchanged from another site.
- [ ] A beat reads in under three words.
- [ ] Hollow and solid both appear; red appears once per beat at most.
- [ ] Images are built, revealed or grown, never placed beside text.
- [ ] Motion is damped (heavy), not 1:1.
- [ ] Static fallback and phone variant exist for every beat.

## 17. Bold toolkit (what actually made EVRABO_static feel loud)

Section 16 explains how to think. This is the kit. One mechanism per beat, never repeated on a page.

| Tool | What it is | Where |
|---|---|---|
| Film through type | White layer, `mix-blend-mode: screen`, black giant word; film shows only inside the letters. Swell the word, then fade the layer: the film takes the screen. | index hero, contact |
| Velocity marquee | Two walls of type (solid red band, hollow white). Speed and lean (`skewX`) follow scroll velocity. | index |
| Word-fill manifesto | One huge sentence, words go from 16% to 100% opacity in order; key words red. | index |
| Hover index | Giant rows; hover floods the row white; one photo follows the pointer (lerp + tilt). Touch: thumbnail inline. | index services, originals |
| Draw to build | Sketch image (grayscale, grid) eaten by the finished film behind a red divider. | duo |
| Struck-out price | A paper quote; each line gets a red strike; total falls to 0; stamp. | free |
| Rail | Films on a sideways track under a slower giant hollow word. | reel |
| Conversation form | One giant question per screen, Enter to advance, red progress bar, mailto at the end. | contact |
| Cursor ring | Difference-blend ring that grows on links and shows a word (`data-cur`). Mouse only. | site.js |

Rules learned the hard way:
1. A pinned stage must start with something to look at. Black space between two stages is the worst bug; start the next stage already visible, or put the header inside the stage and lift it away as the next thing rises.
2. Never put difference-blend titles over busy photos. If a title must sit over images, give it its own clean area or let it lift away.
3. Do not ask visitors for things they have no reason to give (a name input on a studio home page).
4. Before building a new idea, check the last one got a reaction. Remaking everything each time throws away what worked (Duo, "Yours.").
5. Test over http, never `file://`: fonts are blocked there and every giant word renders wrong.
