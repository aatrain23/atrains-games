# You're the Ref: how this repo works

A static GitHub Pages site (https://aatrain23.github.io/youre-the-ref/). No build step.

- `index.html`: the game UI, leaderboard client and the day loader.
- `engine.js`: draws the six playing surfaces and plays keyframed scenarios. Do not change it for a routine new day.
- `slates/day-N.js`: the six plays for day N. Day 2 was 19 Nov 2026 in US Eastern time, and N goes up by one each calendar day. The site loads today's file at midnight Eastern; if it is missing, it falls back to the newest earlier day. So publishing tomorrow's file tonight is safe: it does not appear until midnight.
- `leaderboard/Code.gs`: the Google Apps Script behind the leaderboard (already deployed; do not change).
- `tools/check.js`: `node tools/check.js` validates every slate. Must pass before pushing.
- `tools/stills.py`: `python3 tools/stills.py N /tmp/out` screenshots day N in headless Chrome (optional, needs playwright; preview any day in a browser with `?day=N`).

## Adding a day

Create `slates/day-N.js` with exactly six plays in this order: NFL, NBA, NHL, MLB, PGA, LAX (men's lacrosse). Copy the structure of the newest existing slate.

Rules for every play:
1. Pick a real, counter-intuitive or obscure rule. Never reuse a rule already used in any earlier slate (read the earlier slate files first).
2. Verify the ruling with a web search against the league's official rulebook or official rules site before writing it. `law` must cite the rulebook and rule number you verified. If you cannot verify a ruling, pick a different rule. Never write a ruling from memory.
3. Players are numbered circles: Blue is team `"a"`, Red is team `"b"`, goalie `"gk"`, official `"ref"`. No real player names, team names or logos in the play itself.
4. Exactly one option is correct. Wrong options must be plausible.
5. Plain wording a casual fan understands. No em dashes.
6. `clip` is optional: only a real https link to the league's own site or official video rulebook showing a real example, found by search. Leave it out otherwise. Never invent a URL.

## Play format

```js
{ id: "nfl-short-unique-id", sport: "nfl", league: "NFL", title: "Short title", dur: 4.6,   // seconds of animation
  view: [x0, y0, x1, y1],            // world rectangle to show (see coordinates)
  good: 1,                           // optional: green ruling stamp (use when the surprising answer is "it's allowed/it counts")
  setup: "One or two short sentences shown before the play.",
  caps: [[0, 1.5, "Caption..."], [1.5, 4.7, "Caption..."]],   // [from, to, text]; must start at 0 and cover dur
  after: "The question, shown when the play ends.",
  actors: [ { team: "a", n: "22", k: [[t, x, y], [t, x, y, 0, "lin"]] }, ... ],  // keyframes; default easing is smooth, "lin" is linear
  ball: [[t, x, y, height], [t, x, y, height, "arc", peak], ...],                // "arc" adds a lob of `peak` height
  marks: [ { t0, t1, type: "label", x, y, text: "FUMBLE!" }, { t0, t1, type: "ringAt", x, y }, { t0, t1, type: "ring" } ],  // t1: 9 = stays until the end; "ring" follows the ball
  options: ["A", "B", "C"], answer: 2, stamp: "TOUCHBACK",
  why: "The ruling in 1 to 3 short sentences.", law: "NFL Rulebook · Rule 8, Section 7, Article 3",
  twist: "One sentence: how a small change flips the call." }
```
Optional actor objects: `{ shape: "stick" | "glove" | "ball", from: t, k: [...] }` (a thrown hockey stick, a thrown glove, a second golf ball). `sunkAt: t` on a golf play makes the ball drop into the hole at that time. A `{type:"timer"}` mark exists for golf (see day 1).

Length limits (enforced by check.js): option 34 characters, stamp 16, law 60, why 260, twist 120.

## Coordinates (y grows down the screen; the scoring end is at the top)

- **nfl** (yards): field is x 0 to 53.33. End line y=0, goal line y=10, then the N-yard line is y=10+N. Goalposts on the end line at x 23.6 to 29.75.
- **nba** (feet): half court x 0 to 50, baseline y=0, basket at (25, 5.25), three-point arc radius 23.75, half court line y=47.
- **nhl** (feet): rink x 0 to 85, end boards y=0, goal line y=11, net centred at x=42.5, blue line y=75, centre line y=100.
- **mlb** (feet): home plate (100,190), first base (162,126), second (100,63), third (38,126), mound (100,129.5). Foul lines run from home through first and third.
- **pga** (metres): close-up of a green, hole at (1.0, 0.75). Typical view about 1.7 wide.
- **lax** (yards): field x 0 to 60, end line y=0, goal line y=15 with the goal at x=30 (crease radius 3), restraining line y=35, midfield y=55.

Keep the ball's path clear of players it is not supposed to touch, keep every actor and label inside `view`, and keep labels away from the top-left corner (league chip) and top-right corner (Watch again button).

## Before pushing

Run `node tools/check.js`. If Chrome and playwright are available, run `tools/stills.py` for the new day and look at the images. Commit and push to `main`. Do not change the leaderboard address in `index.html`.
