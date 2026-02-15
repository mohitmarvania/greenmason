"""Pydantic models for GreenMason API."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Snap & Sort (Waste Classification) ──────────────────────────

class ClassificationRequest(BaseModel):
    """Request for image-based waste classification."""
    image_base64: str = Field(..., description="Base64-encoded image data")
    mime_type: str = Field(default="image/jpeg", description="MIME type of the image")


class ClassificationResult(BaseModel):
    """Result from waste classification."""
    category: str = Field(..., description="Waste category: recyclable, compostable, landfill, e-waste, hazardous, reusable")
    confidence: str = Field(..., description="Confidence level: high, medium, low")
    item_name: str = Field(..., description="Identified item name")
    disposal_instructions: str = Field(..., description="How to properly dispose of this item")
    gmu_tip: str = Field(..., description="GMU campus-specific disposal tip")
    fun_fact: str = Field(..., description="Fun environmental fact related to this item")
    points_earned: int = Field(default=10, description="Green Score points earned")


# ── EcoChat ─────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    """A single chat message."""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class ChatRequest(BaseModel):
    """Request for chat completion."""
    message: str = Field(..., description="User's message")
    history: list[ChatMessage] = Field(default=[], description="Conversation history")


class ChatResponse(BaseModel):
    """Response from chat."""
    reply: str = Field(..., description="Assistant's response")
    route_to_patriotai: bool = Field(default=False, description="Whether to redirect to PatriotAI")
    patriotai_agent: Optional[str] = Field(default=None, description="Which PatriotAI agent to redirect to")
    patriotai_reason: Optional[str] = Field(default=None, description="Why we're redirecting")


# ── Voice (ElevenLabs TTS) ──────────────────────────────────────

class VoiceRequest(BaseModel):
    """Request for text-to-speech."""
    text: str = Field(..., description="Text to convert to speech")


# ── Green Score & Leaderboard ───────────────────────────────────

class UserCreate(BaseModel):
    """Create a new user."""
    username: str = Field(..., min_length=2, max_length=50)
    display_name: Optional[str] = None


class ScoreAction(BaseModel):
    """Log a scoring action."""
    username: str
    action: str = Field(..., description="Action type: sort, challenge, quiz, pledge, chat")
    points: int = Field(default=10)
    description: Optional[str] = None


class UserScore(BaseModel):
    """User's score data."""
    username: str
    display_name: str
    total_score: int
    actions_count: int
    rank: Optional[int] = None
    created_at: datetime
    last_active: datetime


class LeaderboardEntry(BaseModel):
    """Single leaderboard entry."""
    rank: int
    username: str
    display_name: str
    total_score: int
    actions_count: int


class PledgeCreate(BaseModel):
    """Create a Love Pledge to Earth."""
    username: str
    pledge_text: str = Field(..., max_length=280, description="The pledge message")


class Pledge(BaseModel):
    """A Love Pledge to Earth."""
    username: str
    display_name: str
    pledge_text: str
    created_at: datetime
    likes: int = 0
