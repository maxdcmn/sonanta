# Sonanta

Sonanta is your voice-first mentor that helps you think out loud and leave with the idea. Drop a quick voice note or start a live conversation. The AI listens and asks thoughtful follow‑ups. Each recording is transcribed, summarized and tagged.

This project emerged from a 24-hour hackathon. The core functionalities are:

- **Record voice notes** about topics you're exploring or passionate about
- **Chat with AI** to unpack ideas and get personalized explanations
- **Build knowledge** by connecting thoughts over time

## Tech Stack

### Frontend
- **Next.js** 
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

### Backend
- **Supabase**
- **ElevenLabs API**
- **OpenAI, Gemini API**
- **FastAPI**

## Project Structure

```
sonanta/
├── frontend/                # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── (public)/    # Public landing page
│   │   │   ├── (auth)/      # Authentication pages
│   │   │   └── (protected)/ # Protected dashboard & voice features
│   │   ├── components/      # Reusable UI components
│   │   └── lib/             # Utilities and configurations
│   │   
└── backend/                 # FastAPI backend application
    ├── api/
    │   └── v1/
    │       └── routes/      # API endpoints
    ├── clients/             # External service clients
    │   ├── elevenlabs.py    # ElevenLabs SDK wrapper
    │   └── supabase.py      # Supabase client
    ├── middleware/          # Auth middleware
    ├── services/            # Business logic
    ├── config.py            # Settings management
    ├── dependencies.py      # Dependency injection setup
    └── supabase/            # Database schema and migrations
```

## Installation

### Frontend

1. Install dependencies:
```bash
cd frontend
pnpm install
```

2. Set up the Supabase DB using the backend migration queries

3. Set up ElevenLabs with the system prompt

4. Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

5. Configure your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `GOOGLE_GENERATIVE_AI_API_KEY`

6. Run the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Backend

1. Install dependencies:
```bash
cd backend
uv pip install -r requirements.txt
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Configure your environment variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`

4. Run the server
```bash
python main.py
# or
uvicorn main:app --reload
```

5. Open [http://localhost:8000](http://localhost:8000) in your browser.
