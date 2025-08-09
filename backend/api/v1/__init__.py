from fastapi import APIRouter
from .routes import conversations, webhooks

v1_router = APIRouter(prefix="/v1")

# Include route modules
v1_router.include_router(conversations.router)
v1_router.include_router(webhooks.router)

@v1_router.get("/health")
def health():
    return {"status": "healthy", "message": "Sonanta is here and alive!"}