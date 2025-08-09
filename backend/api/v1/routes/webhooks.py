from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any
import logging
import json

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)


@router.post("/conversation-end")
async def conversation_end_webhook(request: Request) -> Dict[str, str]:
    """
    Webhook endpoint for ElevenLabs to send conversation summary/transcript.
    This endpoint should be configured in your ElevenLabs dashboard.
    """
    try:
        # Get the raw payload
        payload = await request.json()
        
        # Log the entire payload for debugging
        logger.info(f"Received ElevenLabs webhook payload: {json.dumps(payload, indent=2)}")
        print(f"\n=== ELEVENLABS WEBHOOK PAYLOAD ===\n{json.dumps(payload, indent=2)}\n===================================\n")
        
        # TODO: Implement actual webhook processing once we know the payload structure
        # - Find conversation by ElevenLabs ID
        # - Update conversation with transcript, summary, duration, etc.
        # - Create conversation log for usage tracking
        
        return {"status": "received", "message": "Webhook payload logged"}
        
    except Exception as e:
        logger.error(f"Error processing conversation end webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))