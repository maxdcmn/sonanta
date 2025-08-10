from typing import Optional, Dict, Any, List
from clients.supabase import SupabaseClient
from services.database_service import DatabaseService
import os
from datetime import datetime, timezone
import uuid


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
        try:
            file_extension = os.path.splitext(filename)[1] or ".mp3"
            unique_filename = f"{user_id}/{datetime.now(timezone.utc).strftime('%Y/%m/%d')}/{uuid.uuid4()}{file_extension}"
            
            storage_client = self.supabase_client.client.storage
            
            storage_client.from_(self.bucket_name).upload(
                path=unique_filename,
                file=file_content,
                file_options={"content-type": content_type}
            )
            
            public_url = storage_client.from_(self.bucket_name).get_public_url(unique_filename)
            
            file_size_bytes = len(file_content)
            
            voice_memo = await self.database_service.create_voice_memo(
                user_id=user_id,
                audio_url=public_url,
                file_size_bytes=file_size_bytes,
                title=title or filename,
                metadata=metadata or {"original_filename": filename}
            )
            
            return voice_memo
            
        except Exception:
            raise
    
    async def start_transcription(self, memo_id: str) -> None:
        from services.background_tasks import process_voice_memo
        await process_voice_memo(memo_id)
    
    async def get_voice_memo(self, memo_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        return await self.database_service.get_voice_memo(memo_id, user_id)
    
    async def list_voice_memos(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        tags: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        return await self.database_service.get_user_voice_memos(
            user_id=user_id,
            limit=limit,
            offset=offset,
            tags=tags
        )
    
    
    async def delete_voice_memo(self, memo_id: str, user_id: str) -> bool:
        memo = await self.database_service.get_voice_memo(memo_id, user_id)
        if not memo:
            return False
        
        try:
            if memo.get("audio_url"):
                url_parts = memo["audio_url"].split("/voice-memos/")
                if len(url_parts) > 1:
                    file_path = url_parts[1]
                    storage_client = self.supabase_client.client.storage
                    storage_client.from_(self.bucket_name).remove([file_path])
            
            self.supabase_client.client.table("voice_memos") \
                .delete() \
                .eq("id", memo_id) \
                .execute()
            
            return True
            
        except Exception:
            return False