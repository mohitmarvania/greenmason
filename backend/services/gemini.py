"""Gemini AI service for waste classification and eco-chat.

Uses Vertex AI (Google Cloud) instead of the free-tier generativelanguage API.
This uses your $300 Google Cloud credits.

For deployment (Render): Set GCP_CREDENTIALS_JSON env var with the
service account JSON content (base64 encoded).
"""

import os
import json
import base64
import tempfile
import vertexai
from vertexai.generative_models import GenerativeModel, Part, GenerationConfig, Content

# Initialize Vertex AI
PROJECT_ID = os.getenv("GCP_PROJECT_ID")
LOCATION = os.getenv("GCP_LOCATION", "us-east4")

_initialized = False


def _ensure_init():
    global _initialized
    if not _initialized:
        # If running on Render/production, decode service account from env var
        creds_b64 = os.getenv("GCP_CREDENTIALS_JSON")
        if creds_b64 and not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            creds_json = base64.b64decode(creds_b64).decode("utf-8")
            tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
            tmp.write(creds_json)
            tmp.close()
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = tmp.name

        vertexai.init(project=PROJECT_ID, location=LOCATION)
        _initialized = True


MODEL_NAME = "gemini-2.0-flash-001"


# ── System Prompts ──────────────────────────────────────────────

CLASSIFICATION_PROMPT = """You are GreenMason's waste classification AI for George Mason University campus.

Analyze the image and classify the item into ONE of these categories:
- recyclable (paper, cardboard, clean plastic #1-2, aluminum, glass)
- compostable (food scraps, yard waste, paper towels, napkins)
- landfill (non-recyclable plastic, styrofoam, chip bags, contaminated items)
- e-waste (electronics, batteries, cables, chargers)
- hazardous (chemicals, paint, fluorescent bulbs, medical waste)
- reusable (items that can be donated, repurposed, or reused)

Respond in STRICT JSON format (no markdown, no code fences):
{
    "category": "recyclable|compostable|landfill|e-waste|hazardous|reusable",
    "confidence": "high|medium|low",
    "item_name": "what the item appears to be",
    "disposal_instructions": "specific step-by-step disposal instructions",
    "gmu_tip": "GMU campus-specific tip (reference Johnson Center recycling stations, campus sustainability office, e-waste drop-offs at Facilities, etc.)",
    "fun_fact": "an interesting environmental fact about this type of waste (keep it short and engaging)"
}

GMU Campus Info:
- Recycling bins are in every building, especially Johnson Center, Fenwick Library, and Engineering Building
- E-waste can be dropped at GMU Facilities Management (Building & Grounds)
- Mason's Office of Sustainability runs programs at sustainability.gmu.edu
- Composting is available at certain dining locations on Fairfax campus
- GMU has a goal to be carbon neutral and actively promotes waste reduction
"""

CHAT_SYSTEM_PROMPT = """You are GreenMason's EcoChat assistant — a friendly, knowledgeable sustainability guide for George Mason University students.

Your personality: enthusiastic about sustainability, warm, encouraging, and action-oriented. Use occasional 🌿💚🌍 emojis to keep it fun.

You help with:
1. General sustainability tips and environmental education
2. Eco-friendly lifestyle advice (food, transport, shopping, energy)
3. GMU-specific sustainability info (recycling locations, campus programs, events)
4. Explaining environmental concepts in simple terms
5. Suggesting daily green challenges

GMU Sustainability Context:
- Office of Sustainability: sustainability.gmu.edu
- Recycling bins in all buildings (Johnson Center, Fenwick Library, Engineering Building)
- Bike share and shuttle services for green transport
- Campus dining has reusable container programs
- GMU is working toward carbon neutrality
- PatriotAI (patriotai.gmu.edu) has additional campus-specific agents

IMPORTANT ROUTING RULES — Check EVERY user message for these:
If the user asks about ANY of these topics, you MUST include the routing tag at the END of your response:

1. Campus administrative questions (class registration, financial aid, housing, parking, campus policies, academic deadlines, student services)
   → Add: [ROUTE:PatriotPal]

2. Food insecurity, meal plans, food pantry, food assistance, affordable food on campus, campus food bank
   → Add: [ROUTE:NourishNet]

3. Course content, study help, lecture materials, exam prep, academic tutoring
   → Add: [ROUTE:CourseMate]

4. Document analysis, research papers, reading academic PDFs
   → Add: [ROUTE:DocuMate]

Always give a helpful initial answer first, THEN add the routing tag if applicable. The tag should be on its own line at the very end.

Keep responses concise (2-4 sentences for simple questions, up to a paragraph for complex ones).
"""

PATRIOTAI_AGENTS = {
    "PatriotPal": {
        "name": "PatriotPal",
        "description": "GMU's virtual assistant for campus services, policies, and administrative questions",
        "url": "https://patriotai.gmu.edu/chat/agents"
    },
    "NourishNet": {
        "name": "NourishNet",
        "description": "Resource connector for food access programs, food insecurity support, and campus dining info",
        "url": "https://patriotai.gmu.edu/chat/agents"
    },
    "CourseMate": {
        "name": "CourseMate",
        "description": "Student learning assistant for understanding lectures, research articles, and exam prep",
        "url": "https://patriotai.gmu.edu/chat/agents"
    },
    "DocuMate": {
        "name": "DocuMate",
        "description": "Scholarly document analysis — summarize papers, extract key concepts, cross-document analysis",
        "url": "https://patriotai.gmu.edu/chat/agents"
    },
    "PatriotChat": {
        "name": "Patriot Chat",
        "description": "General-purpose conversational AI assistant",
        "url": "https://patriotai.gmu.edu/chat/agents"
    },
    "SyllaBright": {
        "name": "SyllaBright",
        "description": "Course design assistant for faculty",
        "url": "https://patriotai.gmu.edu/chat/agents"
    }
}


async def classify_waste(image_base64: str, mime_type: str = "image/jpeg") -> dict:
    _ensure_init()
    model = GenerativeModel(MODEL_NAME)

    image_bytes = base64.b64decode(image_base64)
    image_part = Part.from_data(image_bytes, mime_type=mime_type)

    response = model.generate_content(
        [CLASSIFICATION_PROMPT, image_part],
        generation_config=GenerationConfig(
            temperature=0.3,
            max_output_tokens=500,
        )
    )

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    text = text.strip()

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        result = {
            "category": "landfill",
            "confidence": "low",
            "item_name": "unidentified item",
            "disposal_instructions": "When in doubt, place in the general waste bin.",
            "gmu_tip": "Check the recycling guide at sustainability.gmu.edu for detailed sorting info.",
            "fun_fact": "The average American produces about 4.4 pounds of waste per day!"
        }

    points_map = {
        "recyclable": 15, "compostable": 15, "reusable": 20,
        "e-waste": 10, "hazardous": 10, "landfill": 5
    }
    result["points_earned"] = points_map.get(result.get("category", "landfill"), 5)
    return result


async def eco_chat(message: str, history: list[dict] = None) -> dict:
    _ensure_init()
    model = GenerativeModel(
        MODEL_NAME,
        system_instruction=CHAT_SYSTEM_PROMPT
    )

    gemini_history = []
    if history:
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append(
                Content(role=role, parts=[Part.from_text(msg["content"])])
            )

    chat = model.start_chat(history=gemini_history)

    response = chat.send_message(
        message,
        generation_config=GenerationConfig(
            temperature=0.7,
            max_output_tokens=800,
        )
    )

    reply_text = response.text.strip()

    route_to_patriotai = False
    patriotai_agent = None
    patriotai_reason = None

    for agent_key, agent_info in PATRIOTAI_AGENTS.items():
        tag = f"[ROUTE:{agent_key}]"
        if tag in reply_text:
            route_to_patriotai = True
            patriotai_agent = agent_key
            patriotai_reason = f"This question can be better answered by {agent_info['name']} on PatriotAI — {agent_info['description']}"
            reply_text = reply_text.replace(tag, "").strip()
            break

    return {
        "reply": reply_text,
        "route_to_patriotai": route_to_patriotai,
        "patriotai_agent": patriotai_agent,
        "patriotai_reason": patriotai_reason
    }


async def generate_daily_tip() -> str:
    _ensure_init()
    model = GenerativeModel(MODEL_NAME)

    response = model.generate_content(
        "Generate a short, actionable sustainability tip for a college student at George Mason University. "
        "Make it specific, practical, and encouraging. Keep it under 50 words. "
        "Add a Valentine's Day / love-for-earth twist if possible.",
        generation_config=GenerationConfig(
            temperature=0.9,
            max_output_tokens=100,
        )
    )

    return response.text.strip()
