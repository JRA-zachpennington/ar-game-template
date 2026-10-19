# Trail briefing instructional design

Elf & Seek is a mobile web AR scavenger hunt for ages 4–10 (a parent usually nearby). Before the camera opens, setup shows a 4-step safety “trail briefing.” This note records why the stepper works as it does.

## Question

What instructional-design / CBT approach best makes young players attend to and acknowledge each safety step rather than tapping through? The first product idea was a full-width OK button whose background fills left-to-right over a few seconds (forced dwell) before it becomes tappable.

## Decision

A fill-timer was built first, then removed after research. The briefing is now tap-the-target acknowledgment with read-aloud narration and no timer.

Active response has the strongest evidence for this age band. The illustrations already have an obvious tap target, so no new art was needed. A timer would add 12+ s of forced waiting with no comprehension benefit.

Research recommended narrated step + active-response check, with a short dwell only as a secondary guard. We dropped the dwell.

## Evidence

**Timers and dwell**

- Fixed timing raised instruction-following, not comprehension; audiovisual delivery raised both ([Grant et al. 2025](https://journals.sagepub.com/doi/10.1177/15562646251321132)).
- Consent-dialog timer nudge: no significant effect on button choice (n=167; [Gerber et al. 2023](https://www.athene-center.de/en/research/publications/don-t-accept-all-and-continue-exploring-nudges-for-4085)).
- Pokémon GO surroundings screen ~15 s/launch, widely ignored ([GameRant](https://gamerant.com/pokemon-go-dangers/)).
- If a fill is kept: 2–3 s after narration; >4 s teaches “wait then tap.”

**Active recall**

- Retrieval practice doubles preschool recall; ~half the gain is active retrieval ([doi:10.1080/17470210600823595](https://doi.org/10.1080/17470210600823595)).
- Works at 5–6 only when retrieval success is high — scaffold the question ([doi:10.1111/cdev.70018](https://doi.org/10.1111/cdev.70018); [practitioner guide](https://pdf.retrievalpractice.org/EarlyChildhoodGuide.pdf)).
- Acknowledgment = micro-choice, not OK. Doing the task beats watching it; walkthroughs fit novel AR ([NN/g onboarding](https://www.nngroup.com/articles/onboarding-tutorials/)).

**Children’s UX**

- Kids skip long paragraphs; youngest do not read; 6–8 read tentatively; 14 pt minimum ([NN/g children’s websites](https://www.nngroup.com/articles/childrens-websites-usability-issues/)).
- Under 9: ≥ 2 cm targets; tap/swipe/drag only; visual + audio; literal ([physical development](https://www.nngroup.com/articles/children-ux-physical-development/), [kids cognition](https://www.nngroup.com/articles/kids-cognition/)).
- Audio alone is ignored; pair with highlight; payoffs motivate; no bottom-corner hotspots ([Sesame Workshop 2012](https://joanganzcooneycenter.org/wp-content/uploads/2020/02/SesameWorkshop-2012.pdf)).
- [BBC GEL](https://www.bbc.co.uk/gel/features/how-to-design-for-children-2) / [Google kids guidance](https://developers.google.com/building-for-kids/designing-engaging-apps): less text, be heard, celebrate effort, forgive errors, multi-modal hints, bring parents in.
- One idea per screen, four max; ≤ 8 words, imperative; illustration first.

**Habituation**

- Static-warning brain response drops after exposure #2; polymorphic appearance resists habituation ([Anderson/Vance CHI 2015](https://doi.org/10.1145/2702123.2702322)).
- 3-week field study: adherence 87% → 64% for static warnings ([doi:10.25300/misq/2018/14124](https://doi.org/10.25300/misq/2018/14124)).

## What we avoid

- Bare fill-timer on OK: trains wait-then-tap, no comprehension gain, disabled-button confusion ([NN/g](https://www.nngroup.com/videos/why-disabled-buttons-hurt-ux-and-how-to-fix-them/)), and [WCAG 2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable) time-limit obligations with no upside.
- Dwell > 4 s or stacked dwells across four screens (16+ s of waiting; parents tap through for the child).
- Identical screens on every launch (habituation after exposure #2).
- Punitive wrong-answer feedback or blocking on a wrong tap.
- Text-only “I understand”: meaningless to pre-readers. No ICO-style prominence/colour nudges that rush consent ([ICO Children’s Code, Standard 13](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/13-nudge-techniques/)).
- Audio as the sole channel: many devices are muted; most under-5s cannot un-mute.

## Implementation

- `src/components/Home.jsx`: `TrailBriefing` in `Setup` after the location gate. Old trail-prep heading hidden. `BRIEFING_ART` = image + hotspot `[left%, top%, width%, height%]`: bear (grown-up), walking pup, STOP sign, printed code.
- Per step: “Step n of 4”; 4-segment `.quest-track`; one 512 px illustration; rule as `h2`; prompt (`role="status"`) with 44 px “Read it aloud”. Steps 1–3 have no continue button: the hotspot tap is the acknowledgment. Step 4’s “Open camera & begin” stays disabled until the hotspot is tapped, because that button opens the camera.
- Correct tap: green ring + sparkle, `chime("find")`, “Yes! That's it.” Steps 1–3 then advance on their own (~700 ms, so the yes can land). A second tap on an already-found step advances immediately. Wrong tap on the picture: gold pulse, the rule and prompt stay as they were and rock once (`.briefing-words.is-quake`, remounted per miss), and the step's line replays (`playBriefing(step, { rule: false })`). No “Not quite” sentence, no miss sting, no penalty. Back on steps 2–3; a finished step stays put and shows “Next”.
- Narration: `playBriefing()` / `hush()` in `src/game/audio.js`. Pre-rendered MP3 in `public/instructions/` (`N-rule.mp3` Matthew neural, then a 500 ms breath; `N-line.mp3` Joanna generative). Synthesized in us-east-1 at 24 kHz; us-east-2 has only the standard engine. Regenerate with `node scripts/briefing-speech.mjs`. Auto-plays when sound is on; the speaker replays (rule only, once the step is found). Mute stops playback. A correct tap hushes the line so the chime can land.
- Copy in `src/game/themes/elf/theme.js` and `src/game/themes/unicorn/theme.js` under `briefing` (`{ rule, prompt }`), plus `tapYes`, `readAloud`, `stepOf`, `next`, `back`. `tests/themes.test.js` requires identical keys.
- Art: 1024 px in `notes/instructions/`; 512 px in `public/instructions/` (~135–195 KB). Current image only in the DOM; next preloaded.
- Tests: `tests/e2e/adventure.spec.js` `arrive()` asserts steps 1–3 advance on the hotspot tap (no continue button) and step 4’s camera button stays disabled until the tap.

| Step | Rule | Prompt |
| --- | --- | --- |
| 1 | Stay with a grown-up. | Tap the grown-up. |
| 2 | Walk, don't run. | Tap the one who's walking. |
| 3 | Stop walking before you use the camera. | Tap the Stop sign. |
| 4 | Find the secret codes! Scan them with the camera. | Tap the secret code. |

## Accessibility and fallbacks

Targets ≥ 44 px; card fits 390×844 with no scroll. Two keyframes, the hint pulse and the miss quake; `prefers-reduced-motion` turns both off (global `animation: none` in `index.css`), leaving a static outline and the replayed line ([WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)). State is colour and label, not motion; a miss is the one case where the words do not change, so its feedback is the quake plus audio (a screen-reader-only miss cue is a known gap). Muted, or autoplay blocked: the pictures and words stay; the speaker replays. Nothing advances on a timer before the tap ([WCAG 2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable)). After a correct tap, steps 1–3 move on; step 4 waits for the camera button. Hotspots are real buttons with full-sentence labels; a live region announces the result.

## Not built

- Parent long-press co-sign after step 4 (“Grown-up: tap and hold to start,” ~1.5 s).
- One-screen recap on repeat visits (habituation defence).
- Fifth step: “Stay on the host's property and away from the road” (still in How-to-play).
- Unused step 2 hotspot on the standing figure (`[62, 20, 36, 66]`). The tap target is the walking pup.
- Stale GPS mid-briefing resets to the location card (devices refresh every 15 s; left as is).

## Sources

- [Grant et al. 2025](https://journals.sagepub.com/doi/10.1177/15562646251321132)
- [Gerber et al. 2023, ACM TOCHI](https://www.athene-center.de/en/research/publications/don-t-accept-all-and-continue-exploring-nudges-for-4085)
- [Anderson/Vance CHI 2015](https://doi.org/10.1145/2702123.2702322)
- [Static-warning field study](https://doi.org/10.25300/misq/2018/14124)
- [Retrieval practice, preschoolers](https://doi.org/10.1080/17470210600823595)
- [Retrieval success in 5–6-year-olds](https://doi.org/10.1111/cdev.70018)
- [Early childhood retrieval-practice guide](https://pdf.retrievalpractice.org/EarlyChildhoodGuide.pdf)
- [Pokémon GO surroundings warning](https://gamerant.com/pokemon-go-dangers/)
- [NN/g children’s websites](https://www.nngroup.com/articles/childrens-websites-usability-issues/)
- [NN/g children physical development](https://www.nngroup.com/articles/children-ux-physical-development/)
- [NN/g kids cognition](https://www.nngroup.com/articles/kids-cognition/)
- [Sesame Workshop 2012](https://joanganzcooneycenter.org/wp-content/uploads/2020/02/SesameWorkshop-2012.pdf)
- [BBC GEL: design for children](https://www.bbc.co.uk/gel/features/how-to-design-for-children-2)
- [Google: designing engaging apps for kids](https://developers.google.com/building-for-kids/designing-engaging-apps)
- [NN/g disabled buttons](https://www.nngroup.com/videos/why-disabled-buttons-hurt-ux-and-how-to-fix-them/)
- [NN/g onboarding tutorials](https://www.nngroup.com/articles/onboarding-tutorials/)
- [ICO Children’s Code, Standard 13](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/13-nudge-techniques/)
- [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)
- [WCAG 2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable)
