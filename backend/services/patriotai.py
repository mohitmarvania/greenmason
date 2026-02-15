"""PatriotAI agent routing service.

PatriotAI (patriotai.gmu.edu) is GMU's enterprise AI platform powered by
Cloudforce's nebulaONE on Microsoft Azure. It provides 6 specialized agents.

Since PatriotAI is a web-based platform behind GMU SSO (no public API),
our integration works by:
1. Detecting when a user's query is best handled by a PatriotAI agent
2. Providing a deep link + context to redirect the user
3. Logging the routing for our demo/judges
"""

# Agent definitions with routing keywords
AGENTS = {
    "PatriotPal": {
        "name": "PatriotPal",
        "emoji": "🎓",
        "description": "Your virtual assistant for campus services, academic policies, and student life at GMU.",
        "url": "https://patriotai.gmu.edu/chat/agents",
        "keywords": [
            "register", "registration", "class", "classes", "enrollment",
            "financial aid", "fafsa", "scholarship", "tuition",
            "housing", "dorm", "residence", "parking", "permit",
            "campus", "building", "office hours", "advising", "advisor",
            "graduation", "degree", "transcript", "gpa",
            "library", "fenwick", "student services",
            "health center", "counseling", "disability",
            "mason id", "patriot pass", "blackboard", "canvas",
        ],
        "example_queries": [
            "How do I register for classes?",
            "Where is the financial aid office?",
            "What are the parking rules on campus?",
        ]
    },
    "NourishNet": {
        "name": "NourishNet",
        "emoji": "🍎",
        "description": "Compassionate guidance on food access programs, meal plans, and food insecurity resources at GMU.",
        "url": "https://patriotai.gmu.edu/chat/agents",
        "keywords": [
            "food", "hungry", "meal", "meal plan", "dining",
            "food pantry", "food bank", "food insecurity",
            "grocery", "snap", "food stamps", "ebt",
            "campus dining", "southside", "ike's", "blaze",
            "affordable food", "free food", "food assistance",
            "nutrition", "eat", "lunch", "dinner", "breakfast",
        ],
        "example_queries": [
            "Where can I get free food on campus?",
            "How do I access the campus food pantry?",
            "What meal plan options are available?",
        ]
    },
    "CourseMate": {
        "name": "CourseMate",
        "emoji": "📚",
        "description": "Your learning assistant — understand lectures, analyze research articles, and prepare for exams.",
        "url": "https://patriotai.gmu.edu/chat/agents",
        "keywords": [
            "study", "exam", "test", "midterm", "final",
            "lecture", "textbook", "homework", "assignment",
            "understand", "explain concept", "tutoring",
            "research article", "paper", "reading",
            "quiz", "practice", "review",
        ],
        "example_queries": [
            "Help me understand this lecture topic",
            "How should I prepare for my CS exam?",
            "Can you explain this research article?",
        ]
    },
    "DocuMate": {
        "name": "DocuMate",
        "emoji": "📄",
        "description": "Analyze documents, summarize papers, extract key concepts, and do cross-document analysis.",
        "url": "https://patriotai.gmu.edu/chat/agents",
        "keywords": [
            "document", "pdf", "summarize", "summary",
            "analyze paper", "research paper", "key concepts",
            "cross-document", "extract", "literature review",
        ],
        "example_queries": [
            "Summarize this research paper for me",
            "Extract key concepts from my reading",
        ]
    },
}


def detect_patriotai_route(message: str) -> dict | None:
    """
    Analyze a user message and determine if it should be routed
    to a PatriotAI agent.

    Args:
        message: The user's chat message

    Returns:
        dict with agent info if routing is needed, None otherwise
    """
    message_lower = message.lower()

    # Score each agent based on keyword matches
    scores = {}
    for agent_key, agent in AGENTS.items():
        score = 0
        matched_keywords = []
        for keyword in agent["keywords"]:
            if keyword in message_lower:
                score += len(keyword)  # Longer keyword matches are more specific
                matched_keywords.append(keyword)
        if score > 0:
            scores[agent_key] = {"score": score, "keywords": matched_keywords}

    if not scores:
        return None

    # Get the best matching agent
    best_agent_key = max(scores, key=lambda k: scores[k]["score"])
    best_agent = AGENTS[best_agent_key]

    # Only route if we have a meaningful match (at least one multi-word keyword or 2+ single keywords)
    match_info = scores[best_agent_key]
    if match_info["score"] < 4:  # Minimum threshold
        return None

    return {
        "agent_key": best_agent_key,
        "agent_name": best_agent["name"],
        "agent_emoji": best_agent["emoji"],
        "agent_description": best_agent["description"],
        "agent_url": best_agent["url"],
        "matched_keywords": match_info["keywords"],
        "example_queries": best_agent["example_queries"],
    }


def get_all_agents() -> list[dict]:
    """Get info about all PatriotAI agents."""
    return [
        {
            "key": key,
            "name": agent["name"],
            "emoji": agent["emoji"],
            "description": agent["description"],
            "url": agent["url"],
            "example_queries": agent["example_queries"],
        }
        for key, agent in AGENTS.items()
    ]
