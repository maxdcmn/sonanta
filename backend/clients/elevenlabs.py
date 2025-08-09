from elevenlabs import ElevenLabs
from config import config
from typing import Dict, Any
import asyncio
from fastapi import HTTPException


class ElevenLabsClient:
    def __init__(self) -> None:
        self.client = ElevenLabs(
            api_key=config.elevenlabs_api_key,
        )
        self.agent_id = config.elevenlabs_agent_id
    
    async def get_signed_url(self) -> str:
        try:
            response = await asyncio.to_thread(
                self.client.conversational_ai.conversations.get_signed_url,
                agent_id=self.agent_id
            )
            return response.signed_url
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    
    async def get_conversation_details(self, conversation_id: str) -> Dict[str, Any]:
        """Get conversation details by ID."""
        # TODO: Implement this when ElevenLabs provides the endpoint
        return {
            "conversation_id": conversation_id,
            "status": "completed"
        }