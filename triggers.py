class ShrinkTriggers:

    SPIRAL_KEYWORDS = [
        "revenge", "got back in", "doubled down", "can't stop",
        "blew", "blown", "overtraded", "emotional", "tilt", "tilting",
        "why did i", "so stupid", "one more", "recover",
        "missed it", "can't believe", "went back in", "fomo"
    ]

    PROP_FIRMS = {
        "ftmo": {
            "name": "FTMO",
            "daily_loss_pct": 0.05,
            "max_drawdown_pct": 0.10,
            "notes": "No minimum trading days on funded account."
        },
        "the5ers": {
            "name": "The5ers",
            "daily_loss_pct": 0.05,
            "max_drawdown_pct": 0.10,
            "notes": "Hyper: 4% daily, 8% max. Scaling plan available."
        },
        "fundednext": {
            "name": "FundedNext",
            "daily_loss_pct": 0.05,
            "max_drawdown_pct": 0.10,
            "notes": "Express: 3% daily, 6% max. News trading allowed."
        },
        "topstep": {
            "name": "Topstep",
            "daily_loss_pct": 0.01,
            "max_drawdown_pct": 0.06,
            "notes": "Trailing drawdown from peak. NO weekend holds."
        }
    }

    def check_spiral_keywords(self, message: str) -> bool:
        msg_lower = message.lower()
        return any(kw in msg_lower for kw in self.SPIRAL_KEYWORDS)

    def get_firm_rules(self, firm: str):
        return self.PROP_FIRMS.get(firm.lower())

    def calculate_drawdown_proximity(self, firm, account_size, drawdown_used):
        rules = self.get_firm_rules(firm)
        if not rules:
            return {"error": f"Firm '{firm}' not found"}

        daily_limit = account_size * rules["daily_loss_pct"]
        total_limit = account_size * rules["max_drawdown_pct"]
        daily_pct_used = (drawdown_used / daily_limit) * 100
        total_pct_used = (drawdown_used / total_limit) * 100

        return {
            "firm": rules["name"],
            "account_size": account_size,
            "daily_limit": daily_limit,
            "total_limit": total_limit,
            "drawdown_used": drawdown_used,
            "daily_pct_used": round(daily_pct_used, 1),
            "total_pct_used": round(total_pct_used, 1),
            "daily_remaining": round(daily_limit - drawdown_used, 2),
            "total_remaining": round(total_limit - drawdown_used, 2),
            "daily_alert": daily_pct_used >= 75,
            "total_alert": total_pct_used >= 80,
            "critical": daily_pct_used >= 100 or total_pct_used >= 100,
            "notes": rules["notes"]
        }