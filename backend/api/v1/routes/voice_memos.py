from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import Dict, Any, List, Optional
from dependencies import VoiceMemoServiceDep, CurrentUser
import logging

router = APIRouter(prefix="/voice-memos", tags=["voice-memos"])
logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_voice_memo(
    background_tasks: BackgroundTasks,
    voice_memo_service: VoiceMemoServiceDep,
    current_user: CurrentUser,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None)
) -> Dict[str, Any]:
    """
    Upload a voice memo file. Starts transcription and tag generation jobs.
    """
    try:
        # Validate file type
        allowed_types = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/webm"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Read file content
        content = await file.read()
        
        # Upload voice memo
        voice_memo = await voice_memo_service.upload_voice_memo(
            user_id=str(current_user.id),
            file_content=content,
            filename=file.filename,
            content_type=file.content_type,
            title=title
        )
        
        # Start background tasks for transcription and tagging
        # TODO: Implement actual transcription and tagging once background task system is set up
        background_tasks.add_task(
            voice_memo_service.start_transcription,
            voice_memo["id"]
        )
        
        logger.info(f"Successfully uploaded voice memo {voice_memo['id']} for user {current_user.id}")
        
        return voice_memo
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading voice memo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{memo_id}")
async def get_voice_memo(
    memo_id: str,
    voice_memo_service: VoiceMemoServiceDep,
    current_user: CurrentUser
) -> Dict[str, Any]:
    """
    Get a specific voice memo by ID.
    """
    try:
        voice_memo = await voice_memo_service.get_voice_memo(
            memo_id=memo_id,
            user_id=str(current_user.id)
        )
        
        if not voice_memo:
            raise HTTPException(status_code=404, detail="Voice memo not found")
        
        return voice_memo
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting voice memo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_voice_memos(
    voice_memo_service: VoiceMemoServiceDep,
    current_user: CurrentUser,
    limit: int = 20,
    offset: int = 0,
    tags: Optional[str] = None  # Comma-separated tags
) -> Dict[str, Any]:
    """
    List all voice memos for the authenticated user.
    """
    try:
        # Parse tags if provided
        tag_list = None
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
        
        voice_memos = await voice_memo_service.list_voice_memos(
            user_id=str(current_user.id),
            limit=limit,
            offset=offset,
            tags=tag_list
        )
        
        return {
            "voice_memos": voice_memos,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error listing voice memos: {e}")
        raise HTTPException(status_code=500, detail=str(e))