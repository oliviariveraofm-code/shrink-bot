# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"The Shrink" is a Discord bot for a trading community ("The Trading Floor"). It acts as a cold,
clinical behavioral analyst that watches trader activity in specific channels, flags emotional/
"spiral" language, enforces prop-firm drawdown awareness, and uses the Anthropic API to generate
in-character responses, trade debriefs, and (eventually) behavioral pattern reports.

The bot's persona ("The Shrink") is strict: no sympathy, no encouragement, declarative statements
only, and every AI-generated reply must stay within the system prompt's rules (see
`shrink_api.py:SHRINK_SYSTEM_PROMPT`). When editing prompts or response copy, preserve this tone —
it's the product, not incidental flavor text.

## Running the bot

There is no test suite, linter, or build step in this repo — it's a single long-running process.

```bash
pip install -r requirements.txt
python bot.py
```

Requires a `.env` file (loaded via `python-dotenv`) with:
- `DISCORD_TOKEN` — required, bot will fail to start without it.
- `ANTHROPIC_API_KEY` — required for any AI-backed response (`shrink` chat, `/debrief`).
- `SUPABASE_URL` / `SUPABASE_KEY` — optional. If either is missing, `database.py` sets
  `supabase = None` and every DB function becomes a silent no-op (returns `[]` or does nothing).
  The bot is fully runnable without a database, just without history/logging.

Deployment is via Railway/Nixpacks + Heroku-style Procfile: `Procfile` declares `worker: python bot.py`,
`nixpacks.toml` pins `python311`, and `runtime.txt` pins `python-3.11.9`. There's no web process —
this is a worker-only deployment.

## Architecture

Four files, each with a single responsibility:

- **`bot.py`** — entry point. Owns all Discord wiring: intents, channel-name constants
  (`losses`, `journal`, `general-chat`, `check-in`, `shrink`), role names (`Prop`, `Core`), the
  `on_message` router, the `/shrink` and `/debrief` prefix commands, and the `daily_checkin`
  scheduled task (07:00 UTC, posts to the `check-in` channel of every guild).
- **`shrink_api.py`** — `ShrinkAPI` class wrapping the Anthropic client (`claude-sonnet-4-5`).
  Holds the full persona system prompt and three methods: `chat_with_context` (used by the
  `shrink` channel handler), `generate_debrief` (used by `/debrief`), and `analyze_behavior`
  (implemented but not currently called from `bot.py` — wire it up if adding a pattern-report
  feature).
- **`triggers.py`** — `ShrinkTriggers` class holding spiral keyword list, prop-firm rule table
  (FTMO/The5ers/FundedNext/Topstep), and drawdown math. **Note:** `bot.py` currently duplicates
  this logic inline (its own `SPIRAL_KEYWORDS` list and `calculate_drawdown_status` function)
  rather than calling into `ShrinkTriggers`. The two keyword lists have already drifted (bot.py's
  list is missing `"can't believe"` and `"went back in"`, which only exist in `triggers.py`). When
  touching spiral-keyword or drawdown logic, either update both places or consolidate onto
  `ShrinkTriggers` — don't fix only one copy.
- **`database.py`** — thin Supabase wrapper: `log_event`, `log_conversation`, `get_user_history`.
  Functions are declared `async def` but the Supabase client calls inside are synchronous
  (blocking) — there's no real async I/O happening, just an async-shaped interface to match the
  discord.py-cord event handler signatures that call them.

### Message flow (`on_message` in `bot.py`)

1. Ignore bot messages.
2. In `losses`: a top-level (non-reply) message logs a `loss_posted` event and triggers a canned
   "three questions" reply.
3. In `shrink`: every message goes to `handle_shrink_chat`, which pulls the user's event history
   from Supabase, summarizes loss/spiral counts into a context string, and forwards
   message + context to `ShrinkAPI.chat_with_context`. The response is sent back and logged via
   `database.log_conversation`.
4. Regardless of channel, message text is scanned for spiral keywords; hits in `general-chat`,
   `losses`, or `journal` log a `spiral_keyword` event and DM the user a private "Shrink is
   watching" notice (silently ignored if DMs are closed).

### Commands

- `/shrink [firm] [account_size] [drawdown_used]` — pure local math (no API call), returns a
  drawdown status block (`SAFE`/`CAUTION`/`CRITICAL`/`BREACHED`) for one of the four hardcoded
  prop firms.
- `/debrief <trade_details>` — gated to members with the `Prop` or `Core` role; calls
  `ShrinkAPI.generate_debrief` and DMs the result.

Prop-firm rules (daily/max drawdown %) are currently hardcoded in three places with the potential
to drift: `bot.py:calculate_drawdown_status`, `triggers.py:PROP_FIRMS`, and the
`SHRINK_SYSTEM_PROMPT` text in `shrink_api.py`. Update all three if firm rules change.
