from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from dependencies import ConversationServiceDep, DatabaseServiceDep, CurrentUser
import logging

router = APIRouter(prefix="/conversations", tags=["conversations"])
logger = logging.getLogger(__name__)


@router.post("/start")
async def start_conversation(
    conversation_service: ConversationServiceDep,
    database_service: DatabaseServiceDep,
    current_user: CurrentUser
) -> Dict[str, Any]:
    """
    Generate a signed URL for starting a conversation and create a database record.
    Requires authentication.
    """
    try:
        # Get signed URL from ElevenLabs
        signed_url = await conversation_service.get_signed_url()
        
        # Create conversation record in database
        conversation = await database_service.create_conversation(
            user_id=str(current_user.id),
            metadata={"signed_url": signed_url}
        )
        
        return {
            "conversation_id": conversation["id"],
            "signed_url": signed_url,
            "user_id": str(current_user.id)
        }
    except Exception as e:
        logger.error(f"Error starting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    database_service: DatabaseServiceDep,
    current_user: CurrentUser
) -> Dict[str, Any]:
    """
    Get conversation details by ID.
    Requires authentication.
    """
    try:
        # Get conversation from database (includes user verification)
        conversation = await database_service.get_conversation(
            conversation_id=conversation_id,
            user_id=str(current_user.id)
        )
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_conversations(
    database_service: DatabaseServiceDep,
    current_user: CurrentUser,
    limit: int = 10,
    offset: int = 0
) -> Dict[str, Any]:
    """
    List all conversations for the authenticated user.
    """
    try:
        conversations = await database_service.get_user_conversations(
            user_id=str(current_user.id),
            limit=limit,
            offset=offset
        )
        
        return {
            "conversations": conversations,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"Error listing conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))