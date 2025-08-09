from typing import Optional, Dict, Any, List
from clients.supabase import SupabaseClient
from services.database_service import DatabaseService
import logging
import os
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class VoiceMemoService:
    def __init__(self, supabase_client: SupabaseClient, database_service: DatabaseService):
        self.supabase_client = supabase_client
        self.database_service = database_service
        self.bucket_name = "voice-memos"
    
    async def upload_voice_memo(
        self,
        user_id: str,
        file_content: bytes,
        filename: str,
        content_type: str = "audio/mpeg",
        title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Upload a voice memo file and create a database record.
        """
        try:
            # Generate unique filename with user ID and timestamp
            file_extension = os.path.splitext(filename)[1] or ".mp3"
            unique_filename = f"{user_id}/{datetime.utcnow().strftime('%Y/%m/%d')}/{uuid.uuid4()}{file_extension}"
            
            # Upload file to Supabase storage
            storage_client = self.supabase_client.client.storage
            
            # Upload the file
            response = storage_client.from_(self.bucket_name).upload(
                path=unique_filename,
                file=file_content,
                file_options={"content-type": content_type}
            )
            
            # Get the public URL
            public_url = storage_client.from_(self.bucket_name).get_public_url(unique_filename)
            
            # Calculate file size
            file_size_bytes = len(file_content)
            
            # Create database record
            voice_memo = await self.database_service.create_voice_memo(
                user_id=user_id,
                audio_url=public_url,
                file_size_bytes=file_size_bytes,
                title=title or filename,
                metadata=metadata or {"original_filename": filename}
            )
            
            logger.info(f"Successfully uploaded voice memo {voice_memo['id']} for user {user_id}")
            
            return voice_memo
            
        except Exception as e:
            logger.error(f"Error uploading voice memo: {e}")
            raise
    
    async def start_transcription(self, memo_id: str) -> None:
        """
        Start transcription job for a voice memo.
        This will be implemented with background tasks.
        """
        # TODO: Implement with background task system
        logger.info(f"Transcription requested for memo {memo_id}")
        pass
    
    async def start_tag_generation(self, memo_id: str) -> None:
        """
        Start tag generation job for a voice memo.
        This will be implemented with background tasks.
        """
        # TODO: Implement with background task system
        logger.info(f"Tag generation requested for memo {memo_id}")
        pass
    
    async def get_voice_memo(self, memo_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a voice memo by ID."""
        return await self.database_service.get_voice_memo(memo_id, user_id)
    
    async def list_voice_memos(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        tags: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """List voice memos for a user."""
        return await self.database_service.get_user_voice_memos(
            user_id=user_id,
            limit=limit,
            offset=offset,
            tags=tags
        )
    
    
    async def delete_voice_memo(self, memo_id: str, user_id: str) -> bool:
        """Delete a voice memo (soft delete)."""
        # First verify the user owns this memo
        memo = await self.database_service.get_voice_memo(memo_id, user_id)
        if not memo:
            return False
        
        try:
            # Delete from storage
            if memo.get("audio_url"):
                # Extract path from URL
                # Format: https://<project>.supabase.co/storage/v1/object/public/voice-memos/<path>
                url_parts = memo["audio_url"].split("/voice-memos/")
                if len(url_parts) > 1:
                    file_path = url_parts[1]
                    storage_client = self.supabase_client.client.storage
                    storage_client.from_(self.bucket_name).remove([file_path])
            
            # Delete from database
            self.supabase_client.client.table("voice_memos") \
                .delete() \
                .eq("id", memo_id) \
                .execute()
            
            logger.info(f"Successfully deleted voice memo {memo_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting voice memo: {e}")
            return False