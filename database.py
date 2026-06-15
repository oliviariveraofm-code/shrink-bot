from supabase import create_client
import os
from datetime import datetime

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if url and key:
    supabase = create_client(url, key)
else:
    supabase = None
    print("[DB] No Supabase credentials — running without database")


async def log_event(user_id: str, username: str, event_type: str, metadata: dict = None):
    if not supabase:
        return
    try:
        supabase.table("shrink_events").insert({
            "user_id": user_id,
            "username": username,
            "event_type": event_type,
            "metadata": metadata,
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print(f"[DB ERROR] {e}")


async def log_conversation(user_id: str, username: str, message: str, response: str):
    if not supabase:
        return
    try:
        supabase.table("shrink_conversations").insert({
            "user_id": user_id,
            "username": username,
            "message": message,
            "response": response,
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print(f"[DB ERROR] {e}")


async def get_user_history(user_id: str) -> list:
    if not supabase:
        return []
    try:
        result = supabase.table("shrink_events")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("timestamp", desc=False)\
            .limit(50)\
            .execute()
        return result.data or []
    except Exception as e:
        print(f"[DB ERROR] {e}")
        return []