import discord
from discord.ext import commands, tasks
import os
import asyncio
from datetime import datetime, time
import pytz
from dotenv import load_dotenv
from triggers import ShrinkTriggers
from shrink_api import ShrinkAPI

load_dotenv()

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

LOSSES_CHANNEL = "losses"
JOURNAL_CHANNEL = "journal"
GENERAL_CHANNEL = "general-chat"
CHECKIN_CHANNEL = "check-in"
PROP_ROLE_NAME = "Prop"
CORE_ROLE_NAME = "Core"

intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.reactions = True

bot = commands.Bot(command_prefix="/", intents=intents)
shrink_api = ShrinkAPI(ANTHROPIC_API_KEY)
triggers = ShrinkTriggers()


@bot.event
async def on_ready():
    print(f"[THE SHRINK] Online. Watching {len(bot.guilds)} server(s).")
    daily_checkin.start()


@bot.event
async def on_message(message):
    if message.author.bot:
        return

    channel_name = message.channel.name
    user = message.author

    if channel_name == LOSSES_CHANNEL:
        if message.reference is None:
            await asyncio.sleep(30)
            await handle_loss_post(message)

    SPIRAL_KEYWORDS = [
        "revenge", "got back in", "doubled down", "can't stop",
        "blew", "blown", "overtraded", "emotional", "tilt", "tilting",
        "why did i", "so stupid", "one more", "recover",
        "missed it", "fomo"
    ]
    msg_lower = message.content.lower()
    if any(kw in msg_lower for kw in SPIRAL_KEYWORDS):
        if channel_name in [GENERAL_CHANNEL, LOSSES_CHANNEL, JOURNAL_CHANNEL]:
            await handle_spiral_keyword(message, user)

    await bot.process_commands(message)


@bot.event
async def on_reaction_add(reaction, user):
    if user.bot:
        return
    if reaction.message.author == bot.user:
        if "DAILY CHECK-IN" in reaction.message.content:
            score_map = {
                "1️⃣": 1, "2️⃣": 2, "3️⃣": 3, "4️⃣": 4, "5️⃣": 5,
                "6️⃣": 6, "7️⃣": 7, "8️⃣": 8, "9️⃣": 9, "🔟": 10
            }
            emoji = str(reaction.emoji)
            if emoji in score_map:
                print(f"[CHECKIN] {user.name} scored {score_map[emoji]}")


async def handle_loss_post(message):
    response = (
        "**[SHRINK REPORT]**\n"
        "Trade logged. Three questions. Answer them or don't.\n\n"
        "**1.** Was this trade in your plan before the session started?\n"
        "**2.** What was your mental state score before entry? *(1–10)*\n"
        "**3.** Was this trade taken within 15 minutes of a previous loss?\n\n"
        "*Your answers are logged. Pattern detection is running.*\n"
        "||The data is not concerned with how you feel about it.||"
    )
    await message.reply(response, mention_author=False)


async def handle_spiral_keyword(message, user):
    try:
        dm_response = (
            "**[SHRINK REPORT — PRIVATE]**\n"
            "Keyword flagged in your message. Pattern recognition active.\n\n"
            "This message does not require a response.\n\n"
            "If you are currently in a live trade entered after a loss: "
            "your historical win rate on trades taken in emotional states is being tracked.\n\n"
            "If you are not in a trade: the session data has been logged.\n\n"
            "*No action required. The Shrink is watching.*"
        )
        await user.send(dm_response)
    except discord.Forbidden:
        pass


@bot.command(name="shrink")
async def shrink_limit_check(ctx, firm: str = None, account_size: float = None, drawdown_used: float = None):
    if not firm or not account_size or drawdown_used is None:
        await ctx.send(
            "**[SHRINK REPORT]**\n"
            "Usage: `/shrink [firm] [account_size] [drawdown_used]`\n"
            "Example: `/shrink ftmo 100000 4500`\n"
            "Supported: `ftmo` `the5ers` `fundednext` `topstep`",
            ephemeral=True
        )
        return

    result = calculate_drawdown_status(firm.lower(), account_size, drawdown_used)
    if result is None:
        await ctx.send(f"Firm `{firm}` not recognised.", ephemeral=True)
        return
    await ctx.send(result, ephemeral=True)


@bot.command(name="debrief")
async def trade_debrief(ctx, *, trade_details: str):
    has_access = any(r.name in [PROP_ROLE_NAME, CORE_ROLE_NAME] for r in ctx.author.roles)
    if not has_access:
        await ctx.send(
            "**[SHRINK REPORT]**\nTrade debrief requires Core or Prop membership.",
            ephemeral=True
        )
        return
    await ctx.send("**[SHRINK REPORT]**\nAnalyzing. Stand by.", ephemeral=True)
    debrief = await shrink_api.generate_debrief(trade_details)
    try:
        await ctx.author.send(f"**[SHRINK REPORT — TRADE DEBRIEF]**\n\n{debrief}")
    except discord.Forbidden:
        await ctx.send("Enable DMs to receive your debrief.", ephemeral=True)


def calculate_drawdown_status(firm, account, used):
    FIRM_RULES = {
        "ftmo": {"name": "FTMO", "daily_pct": 0.05, "total_pct": 0.10},
        "the5ers": {"name": "The5ers", "daily_pct": 0.05, "total_pct": 0.10},
        "fundednext": {"name": "FundedNext", "daily_pct": 0.05, "total_pct": 0.10},
        "topstep": {"name": "Topstep", "daily_pct": 0.01, "total_pct": 0.06}
    }
    if firm not in FIRM_RULES:
        return None

    rules = FIRM_RULES[firm]
    daily_limit = account * rules["daily_pct"]
    total_limit = account * rules["total_pct"]
    daily_remaining = daily_limit - used
    total_remaining = total_limit - used
    daily_pct_used = (used / daily_limit) * 100
    total_pct_used = (used / total_limit) * 100

    if daily_pct_used >= 100 or total_pct_used >= 100:
        status = "🔴 BREACHED"
    elif daily_pct_used >= 75 or total_pct_used >= 80:
        status = "🟠 CRITICAL"
    elif daily_pct_used >= 50 or total_pct_used >= 60:
        status = "🟡 CAUTION"
    else:
        status = "🟢 SAFE"

    return (
        f"**[SHRINK REPORT — LIMIT ANALYSIS]**\n"
        f"Firm: **{rules['name']}** | Account: **${account:,.0f}**\n\n"
        f"**Daily Loss Limit:** ${daily_limit:,.0f}\n"
        f"Used: ${used:,.0f} ({daily_pct_used:.1f}%) | Remaining: **${daily_remaining:,.0f}**\n\n"
        f"**Max Drawdown Limit:** ${total_limit:,.0f}\n"
        f"Used: ${used:,.0f} ({total_pct_used:.1f}%) | Remaining: **${total_remaining:,.0f}**\n\n"
        f"Status: {status}\n\n"
        f"*The account rules do not care about your conviction on the next trade.*"
    )


@tasks.loop(time=time(hour=7, minute=0, tzinfo=pytz.UTC))
async def daily_checkin():
    for guild in bot.guilds:
        channel = discord.utils.get(guild.channels, name=CHECKIN_CHANNEL)
        if not channel:
            continue
        today = datetime.utcnow().strftime("%A %d %B %Y")
        msg = (
            f"**[SHRINK REPORT — DAILY CHECK-IN]**\n"
            f"Date: **{today}**\n\n"
            f"Three inputs. One minute. React with a number 1–10.\n\n"
            f"🧠 **Mental clarity today**\n"
            f"1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟\n\n"
            f"😴 **Sleep quality last night**\n"
            f"1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟\n\n"
            f"💰 **Emotional attachment to yesterday's P&L**\n"
            f"1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟\n\n"
            f"*The Shrink is watching.*"
        )
        await channel.send(msg)


bot.run(DISCORD_TOKEN)