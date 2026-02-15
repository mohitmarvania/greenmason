"""MongoDB Atlas service for Green Score tracking and leaderboard."""

import os
import ssl
import certifi
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

# MongoDB connection (initialized in main.py startup)
client: Optional[AsyncIOMotorClient] = None
db = None


async def connect():
    """Connect to MongoDB Atlas."""
    global client, db
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable is not set")

    # Fix macOS SSL certificate issues
    client = AsyncIOMotorClient(
        mongo_uri,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=10000,
    )
    db = client["greenmason"]

    # Test the connection first
    await client.admin.command("ping")
    print("✅ Connected to MongoDB Atlas")

    # Create indexes for performance
    await db.users.create_index("username", unique=True)
    await db.users.create_index("total_score")
    await db.actions.create_index("username")
    await db.actions.create_index("created_at")
    await db.pledges.create_index("created_at")


async def disconnect():
    """Disconnect from MongoDB."""
    global client
    if client:
        client.close()
        print("🔌 Disconnected from MongoDB Atlas")


# ── User Management ─────────────────────────────────────────────

async def create_user(username: str, display_name: str = None) -> dict:
    """Create a new user or return existing one."""
    now = datetime.now(timezone.utc)
    existing = await db.users.find_one({"username": username})

    if existing:
        existing["_id"] = str(existing["_id"])
        return existing

    user = {
        "username": username,
        "display_name": display_name or username,
        "total_score": 0,
        "actions_count": 0,
        "created_at": now,
        "last_active": now,
    }
    result = await db.users.insert_one(user)
    user["_id"] = str(result.inserted_id)
    return user


async def get_user(username: str) -> Optional[dict]:
    """Get a user by username."""
    user = await db.users.find_one({"username": username})
    if user:
        user["_id"] = str(user["_id"])
    return user


# ── Score Actions ───────────────────────────────────────────────

async def log_action(username: str, action: str, points: int, description: str = None) -> dict:
    """
    Log a scoring action and update user's total score.

    Action types: sort, challenge, quiz, pledge, chat
    """
    now = datetime.now(timezone.utc)

    # Ensure user exists
    user = await get_user(username)
    if not user:
        user = await create_user(username)

    # Log the action
    action_doc = {
        "username": username,
        "action": action,
        "points": points,
        "description": description,
        "created_at": now,
    }
    await db.actions.insert_one(action_doc)

    # Update user score
    await db.users.update_one(
        {"username": username},
        {
            "$inc": {"total_score": points, "actions_count": 1},
            "$set": {"last_active": now}
        }
    )

    updated_user = await get_user(username)
    return {
        "username": username,
        "points_added": points,
        "new_total": updated_user["total_score"],
        "action": action,
    }


# ── Leaderboard ─────────────────────────────────────────────────

async def get_leaderboard(limit: int = 20) -> list[dict]:
    """Get the top users by score."""
    cursor = db.users.find(
        {"total_score": {"$gt": 0}},
        {"_id": 0, "username": 1, "display_name": 1, "total_score": 1, "actions_count": 1}
    ).sort("total_score", -1).limit(limit)

    leaderboard = []
    rank = 1
    async for user in cursor:
        leaderboard.append({
            "rank": rank,
            "username": user["username"],
            "display_name": user.get("display_name", user["username"]),
            "total_score": user["total_score"],
            "actions_count": user.get("actions_count", 0),
        })
        rank += 1

    return leaderboard


async def get_user_rank(username: str) -> int:
    """Get a user's rank on the leaderboard."""
    user = await get_user(username)
    if not user:
        return 0

    # Count users with higher scores
    count = await db.users.count_documents(
        {"total_score": {"$gt": user["total_score"]}}
    )
    return count + 1


# ── Love Pledges ────────────────────────────────────────────────

async def create_pledge(username: str, pledge_text: str) -> dict:
    """Create a Love Pledge to Earth."""
    now = datetime.now(timezone.utc)

    user = await get_user(username)
    if not user:
        user = await create_user(username)

    pledge = {
        "username": username,
        "display_name": user.get("display_name", username),
        "pledge_text": pledge_text,
        "created_at": now,
        "likes": 0,
    }
    result = await db.pledges.insert_one(pledge)
    pledge["_id"] = str(result.inserted_id)

    # Award points for making a pledge
    await log_action(username, "pledge", 20, f"Love Pledge: {pledge_text[:50]}...")

    return pledge


async def get_pledges(limit: int = 50) -> list[dict]:
    """Get recent pledges (Love Letters to Earth wall)."""
    cursor = db.pledges.find(
        {},
        {"_id": 0, "username": 1, "display_name": 1, "pledge_text": 1, "created_at": 1, "likes": 1}
    ).sort("created_at", -1).limit(limit)

    pledges = []
    async for pledge in cursor:
        pledges.append(pledge)

    return pledges


async def like_pledge(username: str, pledge_created_at: datetime) -> bool:
    """Like a pledge."""
    result = await db.pledges.update_one(
        {"username": username, "created_at": pledge_created_at},
        {"$inc": {"likes": 1}}
    )
    return result.modified_count > 0


# ── Stats ───────────────────────────────────────────────────────

async def get_global_stats() -> dict:
    """Get global GreenMason statistics."""
    total_users = await db.users.count_documents({})
    total_actions = await db.actions.count_documents({})
    total_pledges = await db.pledges.count_documents({})

    # Total points across all users
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_score"}}}]
    result = await db.users.aggregate(pipeline).to_list(1)
    total_points = result[0]["total"] if result else 0

    # Actions breakdown
    action_pipeline = [
        {"$group": {"_id": "$action", "count": {"$sum": 1}}}
    ]
    action_breakdown = {}
    async for doc in db.actions.aggregate(action_pipeline):
        action_breakdown[doc["_id"]] = doc["count"]

    return {
        "total_users": total_users,
        "total_actions": total_actions,
        "total_pledges": total_pledges,
        "total_points": total_points,
        "action_breakdown": action_breakdown,
    }