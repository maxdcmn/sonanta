from fastapi import FastAPI
from api import api_router
from fastapi.middleware.cors import CORSMiddleware
from config import config
import uvicorn

app = FastAPI(title="Sonanta", version="0.1.0", docs_url="/docs", redoc_url="/redoc")

app.include_router(api_router, prefix="")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"app": "Her Labs API", "environment": config.app_env, "debug": config.debug}
