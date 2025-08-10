from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any
import json

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/conversation-end")
async def conversation_end_webhook(request: Request) -> Dict[str, str]:
    try:
        payload = await request.json()
        
        print(f"\n=== ELEVENLABS WEBHOOK PAYLOAD ===\n{json.dumps(payload, indent=2)}\n===================================\n")
        
        # TODO: Process webhook once we know the structure
        
        return {"status": "received", "message": "Webhook payload logged"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))