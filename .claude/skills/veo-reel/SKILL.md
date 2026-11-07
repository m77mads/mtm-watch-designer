---
name: veo-reel
description: >-
  Daily reel production for MTM and معاليك with Veo 3. Use when the user gives
  the day's idea ("ريل اليوم عن ...", "سوّ ريل عن ...", "أبي prompt لـ veo") or
  uploads Veo/Gemini clips to be turned into the finished reel. Step 1 writes the
  script cards, the Veo 3 prompts (each clip under 10 seconds) and the caption.
  Step 2 assembles the user's clips with the text cards and the logo end card
  into a 1080x1920 MP4.
---

# veo-reel — the daily routine

The user sends an idea, then generates the clips in Veo 3 and uploads them.
You write everything around the clips and you cut the final reel. Veo makes
the pictures; the words, the timing and the brand are yours.

## Before anything

1. Copy the voice profile if it is missing:
   `mkdir -p ~/.claude/instagram && cp .claude/instagram/voice.md ~/.claude/instagram/voice.md`
   and read it. Silent reels, Kuwaiti dialect, text cards, keyword CTA.
2. Decide the brand, and ask if it is not obvious:
   - **MTM**: editions and national/heritage designs, 30–100 KD, limited to 100 pieces.
   - **معاليك**: one of one, a full custom design, 150–500 KD.
   Never mix the two in one reel.
3. If the idea touches history, a place, an event or a number, research it
   first (WebSearch) and keep the sources. Never invent a fact, a price, a
   customer or a number. Use `{{placeholder}}` and flag it.

## Step 1: idea → the package (one reply)

Deliver these four things, in Arabic for the user, with the Veo prompts in English:

**A. The script cards.** Use the ig-reel shape: hook at 0–2.6 s, then one idea per card, about
2.4–2.6 s per card, ≤ 6 words in the title, an optional small subline, then the
logo + «اكتب «كلمة» بالتعليقات» end card (about 2.4 s). The whole reel is usually 12–22 s.

**B. The Veo 3 prompts: one per clip, each clip under 10 s (Veo makes 8 s).**
One clip usually covers 2–3 cards; plan which seconds of which clip go under
which card. Usually 2–4 clips in a reel.

Every prompt follows this template, in English (Veo follows English best):

```
[SHOT] Vertical 9:16, 8 seconds, photorealistic cinematic, 4K look.
[SUBJECT] <one consistent subject, described the same way in every clip of the reel>
[TIMELINE] 0-3s: <action>. 3-6s: <action>. 6-8s: <action>.
[CAMERA] <one move: slow dolly-in / low tracking shot / static macro / orbit>, <lens: 35mm / 85mm / 100mm macro>
[LIGHT] <golden hour backlight / soft studio key light / moonlight>, <palette>
[SETTING] <place, Gulf-specific details>
[AUDIO] Ambient sound only (<wind, hooves on sand, ticking>). No music, no voices, no dialogue.
[AVOID] No text, no captions, no subtitles, no logos, no watermarks, no brand names, no people's faces, no extra limbs, no distorted hands.
```

Rules for the prompts:
- **Leave the top third calm.** The cards sit at y≈330–600 px. Ask for "subject in the lower two-thirds of the frame, clean sky/background in the upper third".
- **No text inside the video.** Veo garbles Arabic. All words come from the cards.
- **Motion in the first second** of the hook clip (gallop, dust, a hand moving, light sweeping).
- **One camera move per clip.** Two moves in 8 seconds look like AI.
- **Keep it consistent.** Write a SUBJECT line once (horse colour, jewelry, watch case, strap, clothing) and paste it unchanged into every clip.
- **Watches: Veo cannot draw the real dial.** For any shot where the product must be accurate, tell the user to use image-to-video (Flow → "Frames to video" / Gemini with an uploaded photo) with a real photo of the watch as the first frame, and keep the motion small (slow push-in, light sweep, wrist turn). Write that prompt for image-to-video.
- **Real people:** never ask for an identifiable real person (a ruler, a historical figure, a celebrity) or a customer. Use silhouettes, hands, backs, horses, places.
- **Trademarks:** no third-party logos or names (Al Shaqab, Rolex …) in the picture.
- Also give a one-line **Arabic explanation** under each prompt (what the clip shows, which cards it serves, which seconds to use).

**C. The caption.** Run the ig-caption process: line one is the keyword ask,
3–4 short body lines with the search terms written as normal sentences, ≤ 5 hashtags.

**D. The upload list:** "send me clip 1 … clip N", what to name them, and which brand.

Save the package to `content/reels/<date>-<slug>.md` and commit it.

## Step 2: clips uploaded → finished reel

1. Look at every clip first (ffprobe + a frame strip:
   `ffmpeg -i clip.mp4 -vf "fps=8/$(dur),scale=-2:480,tile=8x1" -frames:v 1 strip.jpg`)
   and pick the best seconds for each card: motion, the subject in the lower part, no glitches
   (extra legs, melted jewelry, text). Say if a clip is unusable and rewrite its prompt.
2. Copy the clips to `content/reels/src/<slug>/footage/`.
3. Write `content/reels/src/<slug>/spec.json`:

```json
{ "brand": "maalik",
  "shots": [ { "clip": "footage/clip1.mp4", "start": 0.0, "dur": 2.6 },
             { "clip": "footage/clip1.mp4", "start": 5.0, "dur": 2.4, "grade": "warm" } ],
  "cards": [ { "t0": 0.0,  "t1": 2.6, "tag": "قطعة وحدة بالعالم", "title": "سطر أول..\nسطر **ذهبي**" },
             { "t0": 2.75, "t1": 5.0, "title": "عنوان", "sub": "سطر صغير" } ],
  "end": { "dur": 2.4, "cta": "كلمة", "sub": "ونرسلك تفاصيل ساعتك" } }
```
   Card times follow the shots: card *i* runs from the start of its shot +0.15 s to the shot's end.
   `**word**` = accent colour (gold for معاليك, yellow for MTM); `\n` = line break; `grade`: `warm` | `dark` | `none`.
4. Render: `node .claude/skills/veo-reel/assemble.js content/reels/src/<slug>/spec.json content/reels/<date>-<slug>.mp4`
   (≈1 min per 12 s; needs Node, Playwright and ffmpeg).
5. Check a frame strip of the output, then send the MP4 with SendUserFile and commit.
6. Remind the user: mark it with Instagram's **AI info** label when posting (the clips are AI-generated
   and carry Google's invisible SynthID mark), and add music in the app if they want it.

## Reference
- `specs/example-asil.json`: a working spec (the «الأصيل» reel).
- `cards.html`: the card and end-card design (dark pill, white bold Tajawal, gold or yellow accent, Amiri معاليك wordmark / yellow MTM box).
