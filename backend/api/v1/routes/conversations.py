from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from dependencies import ConversationServiceDep, CurrentUser

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("/start")
async def start_conversation(
    conversation_service: ConversationServiceDep,
    current_user: CurrentUser
) -> Dict[str, str]:
    """
    Generate a signed URL for starting a conversation.
    Requires authentication.
    """
    try:
        # Get signed URL from ElevenLabs
        signed_url = await conversation_service.get_signed_url()
        
        # TODO: Create conversation record in database with user_id
        # For now, we'll just return the signed URL
        
        return {
            "signed_url": signed_url,
            "user_id": str(current_user.id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    conversation_service: ConversationServiceDep,
    current_user: CurrentUser
) -> Dict[str, Any]:
    """
    Get conversation details by ID.
    Requires authentication.
    """
    try:
        # Get conversation details
        details = await conversation_service.get_conversation_details(conversation_id)
        
        # TODO: Verify user owns this conversation
        
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))