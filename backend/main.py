"""
GreenMason Backend — AI-Powered Campus Sustainability Hub
FastAPI server with Gemini Vision, ElevenLabs TTS, MongoDB Atlas, and PatriotAI routing.

HackFax × PatriotHacks 2026
"""

import os
import base64
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models.schemas import (
    ClassificationRequest, ChatRequest, ChatResponse,
    VoiceRequest, UserCreate, ScoreAction,
    PledgeCreate,
)
from services import gemini, elevenlabs, mongodb, patriotai


# ── App Lifecycle ───────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    await mongodb.connect()
    print("🌿 GreenMason backend is running!")
    yield
    # Shutdown
    await mongodb.disconnect()


# ── FastAPI App ─────────────────────────────────────────────────

app = FastAPI(
    title="GreenMason API",
    description="AI-Powered Campus Sustainability Hub — HackFax × PatriotHacks 2026",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url:
    origins.append(frontend_url)
# Allow all Vercel preview URLs
origins.append("https://*.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon — open to all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/debug/env")
async def debug_env():
    key = os.getenv("ELEVENLABS_API_KEY", "NOT SET")
    return {
        "key_length": len(key),
        "key_preview": key[:5] + "..." + key[-5:] if len(key) > 10 else key,
        "has_quotes": key.startswith('"') or key.startswith("'"),
        "has_spaces": key != key.strip(),
    }

# ── Health Check ────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "GreenMason API",
        "tagline": "Fall in Love with a Greener Campus 💚🌿",
        "version": "1.0.0",
        "hackathon": "HackFax × PatriotHacks 2026",
        "endpoints": {
            "classify": "/api/classify",
            "chat": "/api/chat",
            "voice": "/api/voice/tip",
            "leaderboard": "/api/leaderboard",
            "pledges": "/api/pledges",
            "patriotai": "/api/patriotai/agents",
            "stats": "/api/stats",
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ═══════════════════════════════════════════════════════════════
# 1. SNAP & SORT — Waste Classification (Gemini Vision)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/classify")
async def classify_waste(request: ClassificationRequest):
    """
    Classify waste from a base64-encoded image.

    Send an image and get back:
    - Waste category (recyclable, compostable, landfill, e-waste, hazardous, reusable)
    - Disposal instructions
    - GMU-specific tips
    - Points earned
    """
    try:
        result = await gemini.classify_waste(request.image_base64, request.mime_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@app.post("/api/classify/upload")
async def classify_waste_upload(file: UploadFile = File(...)):
    """
    Classify waste from an uploaded image file.
    Alternative to base64 — accepts multipart file upload.
    """
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")
        mime_type = file.content_type or "image/jpeg"

        result = await gemini.classify_waste(image_base64, mime_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# 2. ECOCHAT — Sustainability Chat (Gemini + PatriotAI Routing)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with GreenMason's eco-assistant.

    The assistant will:
    - Answer sustainability questions
    - Provide GMU-specific eco-tips
    - Route campus-specific questions to PatriotAI agents
    """
    try:
        # First check if we should route to PatriotAI
        route_info = patriotai.detect_patriotai_route(request.message)

        # Get Gemini response (it also has routing logic in its system prompt)
        history = [{"role": m.role, "content": m.content} for m in request.history]
        result = await gemini.eco_chat(request.message, history)

        # Merge routing info (prefer Gemini's detection, fallback to keyword detection)
        if not result["route_to_patriotai"] and route_info:
            result["route_to_patriotai"] = True
            result["patriotai_agent"] = route_info["agent_key"]
            result["patriotai_reason"] = (
                f"{route_info['agent_emoji']} For the best answer, try "
                f"{route_info['agent_name']} on PatriotAI — "
                f"{route_info['agent_description']}"
            )

        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# 3. VOICE — Text-to-Speech (ElevenLabs)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/voice/speak")
async def voice_speak(request: VoiceRequest):
    """Convert text to speech. Returns MP3 audio."""
    try:
        audio_bytes = await elevenlabs.text_to_speech(request.text)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=greenmason_voice.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice generation failed: {str(e)}")


@app.get("/api/voice/tip")
async def voice_daily_tip():
    """Get a daily sustainability tip as audio."""
    try:
        # Generate tip text
        tip_text = await gemini.generate_daily_tip()

        # Convert to speech
        audio_bytes = await elevenlabs.text_to_speech(tip_text)

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=daily_tip.mp3",
                "X-Tip-Text": tip_text.replace("\n", " ")[:200],
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Daily tip failed: {str(e)}")


@app.get("/api/voice/tip/text")
async def voice_daily_tip_text():
    """Get a daily sustainability tip as text only (no audio)."""
    try:
        tip_text = await gemini.generate_daily_tip()
        return {"tip": tip_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tip generation failed: {str(e)}")


@app.get("/api/voice/score/{username}")
async def voice_score_summary(username: str):
    """Get an audio summary of a user's Green Score."""
    try:
        user = await mongodb.get_user(username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        rank = await mongodb.get_user_rank(username)
        display_name = user.get("display_name", username)

        audio_bytes = await elevenlabs.generate_score_summary_audio(
            display_name, user["total_score"], rank
        )

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=score_summary.mp3"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Score summary failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# 4. GREEN SCORE & LEADERBOARD (MongoDB Atlas)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/users")
async def create_user(request: UserCreate):
    """Create a new user or get existing one."""
    try:
        user = await mongodb.create_user(request.username, request.display_name)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User creation failed: {str(e)}")


@app.get("/api/users/{username}")
async def get_user(username: str):
    """Get user profile and score."""
    user = await mongodb.get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    rank = await mongodb.get_user_rank(username)
    user["rank"] = rank
    return user


@app.post("/api/scores")
async def log_score(request: ScoreAction):
    """Log a scoring action (sort, challenge, quiz, pledge, chat)."""
    try:
        result = await mongodb.log_action(
            request.username, request.action, request.points, request.description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Score logging failed: {str(e)}")


@app.get("/api/leaderboard")
async def get_leaderboard(limit: int = 20):
    """Get the campus-wide Green Score leaderboard."""
    try:
        leaderboard = await mongodb.get_leaderboard(limit)
        return {"leaderboard": leaderboard, "total_entries": len(leaderboard)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaderboard failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# 5. LOVE PLEDGES (Valentine's Feature)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/pledges")
async def create_pledge(request: PledgeCreate):
    """Create a Love Pledge to Earth (Valentine's feature)."""
    try:
        pledge = await mongodb.create_pledge(request.username, request.pledge_text)
        pledge.pop("_id", None)
        return pledge
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pledge creation failed: {str(e)}")


@app.get("/api/pledges")
async def get_pledges(limit: int = 50):
    """Get the Love Letters to Earth wall."""
    try:
        pledges = await mongodb.get_pledges(limit)
        return {"pledges": pledges, "total": len(pledges)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pledge retrieval failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# 6. PATRIOTAI INTEGRATION
# ═══════════════════════════════════════════════════════════════

@app.get("/api/patriotai/agents")
async def get_patriotai_agents():
    """Get all available PatriotAI agents and their descriptions."""
    agents = patriotai.get_all_agents()
    return {
        "platform": "PatriotAI",
        "provider": "Cloudforce nebulaONE® on Microsoft Azure",
        "url": "https://patriotai.gmu.edu",
        "agents": agents,
    }


@app.post("/api/patriotai/route")
async def route_to_patriotai(message: str = Form(...)):
    """Check if a message should be routed to a PatriotAI agent."""
    route_info = patriotai.detect_patriotai_route(message)
    if route_info:
        return {"should_route": True, **route_info}
    return {"should_route": False, "message": "No PatriotAI routing needed for this query."}


# ═══════════════════════════════════════════════════════════════
# 7. GLOBAL STATS
# ═══════════════════════════════════════════════════════════════

@app.get("/api/stats")
async def get_stats():
    """Get global GreenMason statistics."""
    try:
        stats = await mongodb.get_global_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# Run with: uvicorn main:app --reload --port 8000
# ═══════════════════════════════════════════════════════════════
