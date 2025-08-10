from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from dependencies import ConversationServiceDep, DatabaseServiceDep, CurrentUser

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("/start")
async def start_conversation(
    conversation_service: ConversationServiceDep,
    database_service: DatabaseServiceDep,
    current_user: CurrentUser
) -> Dict[str, Any]:
    try:
        signed_url = await conversation_service.get_signed_url()
        
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
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    database_service: DatabaseServiceDep,
    current_user: CurrentUser
) -> Dict[str, Any]:
    try:
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
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_conversations(
    database_service: DatabaseServiceDep,
    current_user: CurrentUser,
    limit: int = 10,
    offset: int = 0
) -> Dict[str, Any]:
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
        raise HTTPException(status_code=500, detail=str(e))