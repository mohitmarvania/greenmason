# 🌿💚 GreenMason — AI-Powered Campus Sustainability Hub

> _"Fall in Love with a Greener Campus"_ 💕🌍

**GreenMason** is a multimodal AI platform that makes sustainability personal, actionable, and engaging for George Mason University students. Built for **HackFax × PatriotHacks 2026** (Valentine's Day Edition).

![GreenMason](https://img.shields.io/badge/HackFax-PatriotHacks%202026-green) ![Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue) ![PatriotAI](https://img.shields.io/badge/Integrated-PatriotAI-purple) ![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen) ![ElevenLabs](https://img.shields.io/badge/Voice-ElevenLabs-orange)

---

## ✨ Features

### 📸 Snap & Sort (Gemini Vision AI)

Take a photo of any waste item — our AI classifies it as recyclable, compostable, landfill, e-waste, hazardous, or reusable. Get GMU campus-specific disposal instructions, fun facts, and earn Love Points!

### 💬 EcoChat Hub (Gemini + PatriotAI)

Ask sustainability questions powered by Google Gemini. When campus-specific queries are detected, GreenMason intelligently routes you to the right **PatriotAI** agent:

- 🎓 **PatriotPal** — Campus services & policies
- 🍎 **NourishNet** — Food sustainability & resources
- 📚 **CourseMate** — Academic & learning support

### 🏆 Green Score Dashboard (MongoDB Atlas)

Track your sustainability impact with Love Points, climb the campus-wide leaderboard, earn achievement badges like "Recycling Romantic" and "Sustainability Soulmate."

### 💌 Love Pledges Wall

Write "Love Letters to the Planet" — sustainability commitments styled as Valentine's cards. A community wall of environmental promises.

### 💕 EcoMatch Quiz

Tinder-style swipe quiz to discover your sustainability personality: Fresh Sprout, Solar Sweetheart, Compost Cupid, Recycling Romantic, or Sustainability Soulmate!

### 🔊 Voice Coach (ElevenLabs TTS)

Daily sustainability tips as natural-sounding audio. Hear your Green Score summary narrated — great for accessibility!

### 🌱 Meet Sprout — Our Mascot!

A cute kawaii sprout character with a pink heart that guides you through the app with different poses: waving, thinking, celebrating, searching, and vibing with headphones.

---

## 🛠️ Tech Stack

| Component            | Technology                                          |
| -------------------- | --------------------------------------------------- |
| **Frontend**         | Next.js 16 + Tailwind CSS + shadcn/ui               |
| **Backend**          | FastAPI (Python)                                    |
| **AI Vision + Chat** | Google Gemini API (Vertex AI)                       |
| **Voice TTS**        | ElevenLabs API                                      |
| **Database**         | MongoDB Atlas (M0 Free Cluster)                     |
| **Campus AI**        | PatriotAI (Cloudforce nebulaONE® / Microsoft Azure) |
| **Deployment**       | Vercel (frontend) + Render (backend)                |

---

## 🏗️ Architecture

```
Frontend (Next.js)  →  Backend (FastAPI)  →  AI Services
                                           ├── Gemini Vision (classify)
                                           ├── Gemini Chat (eco-assistant)
                                           ├── ElevenLabs (voice TTS)
                                           ├── MongoDB Atlas (scores, users)
                                           └── PatriotAI (agent routing)
```

### API Endpoints

| Endpoint                          | Description                           |
| --------------------------------- | ------------------------------------- |
| `POST /api/classify`              | Waste classification from image       |
| `POST /api/classify/upload`       | Waste classification from file upload |
| `POST /api/chat`                  | EcoChat with PatriotAI routing        |
| `POST /api/voice/speak`           | Text to speech                        |
| `GET /api/voice/tip`              | Daily tip as audio                    |
| `GET /api/voice/score/{username}` | Score summary audio                   |
| `POST /api/users`                 | Create user                           |
| `GET /api/users/{username}`       | Get user profile                      |
| `POST /api/scores`                | Log score action                      |
| `GET /api/leaderboard`            | Campus leaderboard                    |
| `POST /api/pledges`               | Create Love Pledge                    |
| `GET /api/pledges`                | Get pledges wall                      |
| `GET /api/patriotai/agents`       | List PatriotAI agents                 |
| `GET /api/stats`                  | Global statistics                     |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Google Cloud account (Vertex AI enabled)
- MongoDB Atlas account
- ElevenLabs account

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Authenticate with Google Cloud
gcloud auth application-default login

# Run
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Edit with your backend URL

# Run
npm run dev
```

---

## 💕 Valentine's Day Theme

This isn't surface-level decoration — Valentine's Day is structurally integrated:

- **Love Points** instead of generic points
- **Love Pledges** as Valentine's cards to the planet
- **EcoMatch Quiz** — dating-app style sustainability personality test
- **Achievement badges** — "First Date with Recycling", "Compost Cupid"
- **Visual design** — Pink + green gradients, floating hearts, confetti on milestones
- **Sprout mascot** with a heart on its chest

---

## 🏆 Track Eligibility

| Track                               | How We Qualify                      |
| ----------------------------------- | ----------------------------------- |
| 🌿 Sustainability (Internal)        | Core theme = campus sustainability  |
| 🎓 Cloudforce/Microsoft — PatriotAI | 3 PatriotAI agents integrated       |
| 🚀 Redbull Basement — Startup       | Scalable to any university          |
| ✨ MLH — Best Use of Gemini API     | Vision + Chat powers core AI        |
| 🔊 MLH — Best Use of ElevenLabs     | Voice tips & score narration        |
| 🍃 MLH — Best Use of MongoDB Atlas  | Users, scores, leaderboard, pledges |

---

## 👥 Team

Built with 💚 at HackFax × PatriotHacks 2026, George Mason University.

---

## 📄 License

MIT License — Built for HackFax × PatriotHacks 2026
