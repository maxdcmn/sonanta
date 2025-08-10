from typing import Any, Dict
from clients.elevenlabs import ElevenLabsClient


class ConversationService:
    def __init__(self, elevenlabs_client: ElevenLabsClient):
        self.elevenlabs_client = elevenlabs_client

    async def get_signed_url(self) -> str:
        return await self.elevenlabs_client.get_signed_url()
    
    async def get_conversation_details(self, conversation_id: str) -> Dict[str, Any]:
        return await self.elevenlabs_client.get_conversation_details(conversation_id)