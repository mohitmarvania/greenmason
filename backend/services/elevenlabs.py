"""ElevenLabs Text-to-Speech service for GreenMason voice features."""

import os
import httpx

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel voice

# ElevenLabs API endpoint
TTS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"


async def text_to_speech(text: str) -> bytes:
    """
    Convert text to speech using ElevenLabs API.

    Args:
        text: Text to convert (max ~500 chars for free tier efficiency)

    Returns:
        bytes: MP3 audio data
    """
    # Truncate if too long to conserve free tier quota
    if len(text) > 500:
        text = text[:497] + "..."

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
    }

    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.3,
            "use_speaker_boost": True
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(TTS_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.content


async def generate_score_summary_audio(username: str, score: int, rank: int) -> bytes:
    """
    Generate an audio summary of a user's Green Score.

    Args:
        username: User's display name
        score: Total green score
        rank: Leaderboard rank

    Returns:
        bytes: MP3 audio data
    """
    text = (
        f"Hey {username}! Your Green Score is {score} points, "
        f"and you're ranked number {rank} on the campus leaderboard. "
        f"Keep making sustainable choices — every action counts! "
        f"Happy Valentine's Day from GreenMason."
    )
    return await text_to_speech(text)
