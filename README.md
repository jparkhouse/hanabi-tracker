# Hanabi Tracker

A phone-sized scorekeeper for Hanabi played **in person**, with real cards, at a
table. You record every turn as it happens; it keeps the whole game state and
exports [hanab.live](https://hanab.live) JSON you can replay, upload, or feed to
an analysis bot afterwards.

Your own hand stays hidden, because that is the game. You never enter your own
cards until you play or discard one — and you can fill in whatever is left after
the hands go face up at the end.

**Live at <https://cupofjosiah.github.io/hanabi-tracker/>** · installable from
the browser's "Add to home screen", and it works offline once loaded.

There is a second copy at **<https://cupofjosiah.github.io/hanabi-tracker/bot/>**
with an H-Group convention bot reading the table alongside you — see
[The bot](#the-bot). The plain page has none of it.

## What it does

- **Records a whole game** — every play, discard and clue, with automatic turn
  order, clue tokens, strikes, play stacks, discard counts, pace and the
  end-of-deck final round.
- **Keeps your hand a mystery** — cards you hold are unknown until revealed. The
  app shows what you legitimately know: which slots each clue touched, and the
  identities still consistent with that plus every card you can see.
- **Exports hanab.live JSON** that both hanab.live and
  [scala-bot](https://github.com/WillFlame14/scala-bot) accept, so you can get a
  replay or a convention-aware review of a game played on cardboard.
- **Survives refreshes** — every tap writes straight to the device, and
  reopening the app drops you back on the table you were recording.
- **All 2,426 variants** hanab.live offers, named exactly as it names them —
  see [Variants](#variants).

## Recording a game

1. **New game** — list everyone in turn order starting with whoever goes first,
   tap your own seat, pick the variant.
2. **Deal** — enter everyone else's starting hand. Slot 1 is the end of the hand
   that new cards go into; keep drawing to that same end all game.
3. **Each turn** — tap `Play`, `Discard` or `Clue` for whoever is acting:
   - *Play / discard*: tap the card. If it was one of yours, name it now (it is
     face up, so this is not a spoiler) — you are only offered cards that are
     actually still possible. Then name the card the player drew, unless it was
     you who drew it.
   - *Clue*: pick the seat and the colour or rank. For other players the touched
     cards are worked out from the deck; when the clue is aimed at **you**, tap
     the slots they pointed at.
4. **Tap any card** to see what the player holding it can work out: the clues it
   has and has dodged, what it could still be *from their seat* (they cannot see
   their own hand, so their list differs from yours), and how those candidates
   stand against the board — playable now, needed later, already played,
   unreachable, or the last copy. That is the "did that clue land?" question,
   answered.
5. **Fixing a mistake**:
   - **Undo** in the header removes the last action, including the card drawn
     with it.
   - **Tapped in the wrong card?** Tap that card any time — on the board, or on
     the review screen's replay — and its sheet has *Wrong card? Change it*. The
     rest of the game is replayed from the corrected card, so the stacks,
     strikes and score follow, and nothing else you recorded is lost. Handy when
     a draw gets mistyped and you only notice three turns later.
6. **Review & export** when the game ends.

A misplay is just a play — record it as one, exactly as hanab.live does; the
strike follows from the card.

## The bot

`/bot/` is the same tracker with a convention bot alongside it. Same games,
same device storage, same export — a game recorded on one page is already there
on the other. **The plain page at `/` is untouched**: none of the bot's code is
loaded there, and it looks and behaves exactly as it did before.

- **A note under every card**, in scala-bot's format — `r1,r4,r5` for what it
  could be, `[f]` called to play, `[cm]` chop moved, `kt` known trash, `??` when
  the clue made no sense. These are **the bot's** notes: derived from the game
  every time, never stored, never mixed into the note you type, and never in the
  export.
- **Suggested moves with a value each**, best first. Values are expected points
  on one scale — a certain play is about 1.00, a clue is worth the plays it sets
  up, a discard is worth the clue token minus what it throws away. Tap a move to
  see the arithmetic that produced the number.
- **What each clue meant**, and what it is still waiting for. A clue that asks
  someone to blind-play is a claim about the next few turns; the panel says
  whose turn it is waiting on and for which card.
- **It follows a clue through other people's cards.** Most clues are not about a
  card you can play this second — they are about the one after the card someone
  else is already holding. The bot names the chain: *"play clue, through known r2
  (tyler slot 1) → known r3 (claire slot 4) → known r4 (josiah slot 4)"*, which
  is the same reading scala-bot gives that game.
- **It changes its mind.** If the blind play never comes, the reading was wrong,
  and the bot drops it and re-reads the whole game without it — so a finesse
  that nobody played into stops poisoning every note downstream of it.
- **Conventions you set.** H-Group levels 1&ndash;11, gated exactly as scala-bot
  gates them, plus a Good Touch switch. Levels 1&ndash;5 are fully reasoned
  about; the settings screen names the techniques above that it does not know
  yet rather than pretending.
- **Corrections, when your table plays off-book.** Tell it what a card is doing,
  or pick a different reading for a whole clue. See below.

### Correcting the bot

Tables play off-book, and a clue that means something at your table means
nothing to the convention. Rather than have the bot guess, tell it. There are
two ways, and the quick one is usually the second.

**Pick a different reading for the clue.** A clue almost never has one possible
meaning — the bot finds several and takes the one needing the least work. Open
*What each clue meant*, tap the clue, and its other readings are right there:
"r2 — play it", "g2 — after finesse g1 (claire slot 2)". Tap the one your table
meant and everything follows from it. Tap it again to hand the clue back.

**Or say what one card is doing:**

1. **Tap the card**, then **The bot has this wrong**.
2. **What is it doing?** Playing · Blind playing · Saved · Chop moved · Trash ·
   Nothing special.
3. **Is it a card you know?** Tap one of the identities it could be.

*Saved* and *Chop moved* are the two ways of saying "do not throw this away",
and they are not the same: a saved card has been touched, a chop-moved one has
not. Saying a card was saved also narrows it — it must be one of the cards worth
saving, so on a fresh board that is the 5s and the 2s.

A correction is attached to a **card**, not to a clue, because what each card
means *is* the bot's state — pin that and the notes, the connections it goes
looking for next, and the move values all follow from it. "That clue was a chop
move" is said by marking the chop card as chop moved.

Your word wins outright: an identity you name is kept even when the clues on the
card appear to rule it out, because if the two disagree it is the bot's model of
your table that is wrong. Corrections apply **from when you made them**, not
backwards, so stepping back through the game still shows what the table knew at
the time. Corrected cards are marked ✎ on the board and *yours* in the sheet,
and the conventions screen counts them and can clear them.

They live on the device, keyed by game, entirely outside the game record — so
they cannot reach the export, and they survive undo and a corrected card.

The bot reads the table from **common knowledge** — what every seat can work
out — so a note means the same thing to the player holding the card as it does
to you. Where it cannot justify a clue under your conventions it says *unclear*
instead of inventing a meaning.

It also plays from **your seat**, so it never looks at your own hand, even when
you have filled the cards in after the game. It reads the other hands, because
whoever gave the clue could see them too.

Move values are one move deep. scala-bot searches forward through the round
before scoring, so for a real review still run the export through it:

```
scala-cli . --main-class scala_bot.analyze -- file=game.json convention=HGroup11
```

## Getting the game out

**Review & export** gives you `Copy JSON`, `Download`, and the OS share sheet on
a phone.

- **hanab.live**: lobby → *Watch Specific Replay* → *JSON*, and paste. This needs
  a complete deck, so fill in any cards still marked hidden first — the review
  screen lists them, offers only the identities that fit, and can settle the ones
  with a single possibility in one tap.
- **scala-bot**, from your own seat, with your own cards hidden the way they were
  during the game:

  ```
  scala-cli . --main-class scala_bot.replay -- file=game.json index=<your seat> convention=HGroup11
  ```

  or for a whole-game review:

  ```
  scala-cli . --main-class scala_bot.analyze -- file=game.json convention=HGroup11
  ```

  The review screen prints both with your seat index already filled in. Unlike
  hanab.live, the bot does not mind unidentified cards — they are hidden from
  your seat anyway.

You can also import: paste a hanab.live export (or a backup of this app) from the
home screen's `⋯` menu to review a game here.

## Where your games live

In this browser's `localStorage`, one key per game, and nowhere else. There is no
account and no server. Clearing site data deletes them — the `⋯` menu has
**Back up all games**, which writes a single JSON file you can re-import.

## The export format

hanab.live's JSON is compact and a little unobvious, so the model matches it
directly rather than translating at the end:

```json
{
  "id": 0,
  "players": ["josiah", "claire", "matt", "tyler"],
  "deck": [{ "suitIndex": 4, "rank": 4 }, "..."],
  "actions": [{ "type": 3, "target": 2, "value": 1 }, "..."],
  "notes": [[], [], [], []],
  "options": { "variant": "No Variant" }
}
```

- `deck` is in **deal order**: seat 0's whole hand, then seat 1's, and so on,
  then the draw pile. Within a seat's block the *last* card is slot 1, because
  every draw becomes slot 1.
- A card's index in `deck` is its **order**, and that is what a play or discard
  points at.
- `actions[].type` is `0` play, `1` discard, `2` colour clue, `3` rank clue,
  `4` end game. For clues, `target` is the seat and `value` is the rank, or an
  index into the variant's colour list. That list is built the way hanab.live
  builds it: each suit's colours in suit order, deduplicated, skipping suits
  every colour touches. So Rainbow and White add no button, Ambiguous puts two
  suits on one colour, and Dual-Color puts one suit on two.
- A START card in Up or Down is `rank: 7`.
- An unidentified card is `{"suitIndex": -1, "rank": -1}`.
- Draws are not actions: they are implied by the deck growing, one per play or
  discard while cards remain.

`src/lib/hanabi/hanabLive.ts` is the whole of the format handling, and the tests
round-trip a real four-player game byte for byte.

## Variants

Every variant on hanab.live is here, under its own name, and the rules that make
each one different are implemented rather than approximated:

- **Suits that clue oddly** — Rainbow, Pink, White, Brown, Omni, Null, Prism,
  Muddy Rainbow, their Dark and Light forms, and the ambiguous and dual-colour
  families, where one colour names two suits or one suit answers to two colours.
- **Ranks that clue oddly** — the `-Ones` and `-Fives` families (Rainbow-Ones,
  Pink-Fives, Deceptive-Ones and the rest), Funnels and Chimneys, where a rank
  clue takes a whole range, Odds and Evens, and Synesthesia, where a colour clue
  doubles as a rank.
- **Decks that differ** — Critical Fours, Scarce Ones, and the one-of-each
  Dark suits.
- **Clues that are restricted** — Clue Starved (a discard is worth half a clue),
  Alternating Clues, Color Blind, Number Blind, Totally Blind, Color Mute,
  Number Mute, and Cow &amp; Pig and Duck, where the clue points at cards but the
  colour or number behind it never reaches the player.
- **Stacks that do not run 1-to-5** — Reversed suits, Up or Down with its START
  cards and undecided direction, and Sudoku, where every stack starts on a
  different rank and wraps.

Picking a variant on the setup screen lists what makes it unusual, so you do not
have to remember what "Chimneys &amp; Dark Omni (4 Suits)" means. The clue-touch
and deck rules are ports of hanab.live's own `isCardTouchedByClue` and
`getNumCopiesOfCard`, and a test holds the whole deck table against hanab.live's
second, independent deck-size formula across all 2,426 variants.

Two caveats worth knowing:

- **The bot stands down outside ordinary play.** H-Group's conventions assume
  ordinary stacks and ordinary clues, so on Up or Down, Sudoku, the special-rank
  families, Funnels, Chimneys, Odds and Evens, Synesthesia, Clue Starved,
  Alternating Clues, Throw It in a Hole, Cow &amp; Pig, Duck and the Blind and Mute
  variants it says so and withholds its notes rather than guessing. Variants
  whose oddness is only in the suits — including Ambiguous and Dual-Color — it
  still reads.
- **Analysis by [scala-bot](https://github.com/WillFlame14/scala-bot) is not
  guaranteed** for the variants beyond the ordinary ones. The export is still
  valid hanab.live JSON and replays there.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # engine, export and end-to-end UI tests
npm run check      # svelte-check
npm run build      # static site in dist/
```

Pushing to `main` builds and publishes to GitHub Pages (Settings → Pages →
Source: *GitHub Actions*). The build uses relative asset paths, so it works at a
project path, at a custom domain, or straight off disk.

`npm run gen:variants` regenerates `src/lib/hanabi/variantData.ts` from
hanab.live's upstream `variants.json`, `suits.json` and `colors.json`. The
generated file is committed, so the app never touches the network. Run it when
hanab.live adds variants; it prints how many it wrote.

See [docs/architecture.md](docs/architecture.md) for how the pieces fit together.

## Credits

Forked from [jparkhouse/hanabi-tracker](https://github.com/jparkhouse/hanabi-tracker),
which tracked a single player's hand; this rewrite tracks the whole table.
Variant and suit data come from
[Hanabi-Live/hanabi-live](https://github.com/Hanabi-Live/hanabi-live).
