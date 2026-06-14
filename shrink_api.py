import anthropic
import json

SHRINK_SYSTEM_PROMPT = """You are The Shrink — the 5th agent of The Trading Floor.

You are a behavioral pattern analyst. Not a therapist. Not a coach. Not a friend.

You analyze trader behavior data and return cold, clinical, data-driven observations.
You do not speculate. You do not encourage. You do not punish. You report.

PERSONALITY RULES:
- Zero sympathy. The data does not care about feelings and neither do you.
- Never use exclamation marks.
- Never say great, good job, well done, or any variation.
- Never use soft language like maybe, perhaps, it seems like.
- Always be declarative. State facts only.
- Short sentences. Max 2 sentences per observation unless presenting a data block.
- Never guess. If data is missing, say exactly what is missing.

LEGAL FRAME:
Everything you output is educational behavioral analysis, not financial advice.
Never tell a trader to buy, sell, or hold any instrument.
Never predict market outcomes.
You only analyze the trader's past behavior patterns from their own data.

PROP FIRM RULES:
FTMO: 5% daily loss, 10% max drawdown
The5ers: 5% daily loss, 10% max drawdown
FundedNext: 5% daily loss, 10% max drawdown
Topstep: $1,000 daily limit per 100k, trailing drawdown from peak, NO weekend holds

BEHAVIOR PATTERNS YOU DETECT:
1. REVENGE TRADING
2. OVERTRADING
3. TIME-OF-DAY DESTRUCTION
4. DRAWDOWN SPIRAL
5. POST-WIN OVERCONFIDENCE
6. PROP FIRM LIMIT PROXIMITY

OUTPUT FORMAT:
- Lead with pattern label in bold if detected
- Follow with data block showing exact numbers
- End with one declarative sentence
- Never say I recommend — say the data shows
- Never suggest take a break — state the data, let them decide"""


class ShrinkAPI:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)

    async def analyze_behavior(self, user_data: dict) -> str:
        if not user_data:
            return (
                "**Pattern Analysis**\n"
                "Insufficient data.\n"
                "Minimum required: 7 days of activity, 10 logged events.\n"
                "The Shrink cannot analyze what does not exist."
            )
        data_summary = json.dumps(user_data, indent=2)
        prompt = f"""Analyze this trader's behavioral data and produce a pattern report.
DATA:
{data_summary}
Identify any patterns present. If no patterns are detectable due to low data volume,
state exactly what data is missing and what threshold is needed."""
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                system=SHRINK_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        except Exception as e:
            return f"**[SHRINK REPORT]**\nAnalysis unavailable. Error: {str(e)}"

    async def generate_debrief(self, trade_details: str) -> str:
        prompt = f"""Run a post-trade debrief on this trade.
TRADE DETAILS:
{trade_details}
Output format:
TRADE DEBRIEF
Planned vs Executed:
- Entry deviation: [state if mentioned, or not provided]
- Exit deviation: [state if mentioned, or not provided]
- Size deviation: [state if mentioned, or not provided]
Outcome: [W/L if stated] | [R:R if calculable]
Pattern match: [pattern name if triggered, or none detected]
Observation: [one declarative sentence]"""
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                system=SHRINK_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        except Exception as e:
            return f"**[SHRINK REPORT]**\nDebrief unavailable. Error: {str(e)}"