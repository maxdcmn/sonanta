from pydantic_settings import BaseSettings
from typing import Optional


class Config(BaseSettings):
    # App settings
    app_env: str = "development"
    debug: bool = True
    
    # Supabase settings
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    
    # ElevenLabs settings
    elevenlabs_api_key: str
    elevenlabs_agent_id: str
    
    # OpenAI settings
    openai_api_key: str
    
    # Security settings
    jwt_algorithm: str = "HS256"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


config = Config()