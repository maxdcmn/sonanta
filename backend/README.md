# Sonanta Backend

FastAPI backend for the Sonanta conversational AI professor application.

## Features

- 🔐 Supabase authentication integration
- 🎙️ ElevenLabs Conversational AI integration
- 🚀 FastAPI with dependency injection
- 📝 Conversation history tracking (via webhooks)

## Setup

### Prerequisites

- Python 3.8+
- uv or pip
- Supabase project
- ElevenLabs API key

### Installation

1. Install dependencies:
```bash
uv pip install -r requirements.txt
# or
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Configure your environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_KEY`: Your Supabase service key
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `ELEVENLABS_AGENT_ID`: Your ElevenLabs agent ID

### Running the server

```bash
python main.py
# or
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

### Public Endpoints

- `GET /` - Root endpoint
- `GET /api/v1/health` - Health check

### Protected Endpoints (require Bearer token)

- `POST /api/v1/conversations/start` - Get signed URL for starting a conversation
- `GET /api/v1/conversations/{id}` - Get conversation details

### Webhook Endpoints

- `POST /api/v1/webhooks/conversation-end` - Webhook for ElevenLabs to send conversation data

## Architecture

```
backend/
├── api/
│   └── v1/
│       └── routes/         # API endpoints
├── clients/                # External service clients
│   ├── elevenlabs.py      # ElevenLabs SDK wrapper
│   └── supabase.py        # Supabase client
├── middleware/            # Auth middleware
├── services/              # Business logic
├── config.py              # Settings management
└── dependencies.py        # Dependency injection setup
```

## Authentication Flow

1. Frontend sends request with Bearer token (Supabase JWT)
2. Auth middleware validates token with Supabase
3. User object is injected into protected routes
4. Routes can access `current_user` for user-specific operations

## Development

API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`