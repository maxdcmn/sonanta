from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from clients.supabase import SupabaseClient
import logging

logger = logging.getLogger(__name__)


class DatabaseService:
    def __init__(self, supabase_client: SupabaseClient):
        self.client = supabase_client.get_client()
    
    # Conversation methods
    async def create_conversation(
        self, 
        user_id: str,
        elevenlabs_conversation_id: Optional[str] = None,
        title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new conversation record."""
        data = {
            "user_id": user_id,
            "title": title,
            "elevenlabs_conversation_id": elevenlabs_conversation_id,
            "metadata": metadata or {}
        }
        
        try:
            response = self.client.table("conversations").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating conversation: {e}")
            raise
    
    async def get_conversation(
        self, 
        conversation_id: str, 
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a conversation by ID (with user verification)."""
        try:
            response = self.client.table("conversations") \
                .select("*") \
                .eq("id", conversation_id) \
                .eq("user_id", user_id) \
                .single() \
                .execute()
            
            return response.data
        except Exception as e:
            logger.error(f"Error getting conversation: {e}")
            return None
    
    async def get_conversation_by_elevenlabs_id(
        self,
        elevenlabs_conversation_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a conversation by ElevenLabs ID (for webhook processing)."""
        try:
            response = self.client.table("conversations") \
                .select("*") \
                .eq("elevenlabs_conversation_id", elevenlabs_conversation_id) \
                .single() \
                .execute()
            
            return response.data
        except Exception as e:
            logger.error(f"Error getting conversation by ElevenLabs ID: {e}")
            return None
    
    async def update_conversation_from_webhook(
        self,
        conversation_id: str,
        transcript: List[Dict[str, Any]],
        summary: Optional[str] = None,
        duration_seconds: Optional[int] = None,
        audio_url: Optional[str] = None,
        title: Optional[str] = None,
        context_memo_ids: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Update conversation with complete data from ElevenLabs webhook."""
        data = {
            "transcript": transcript,
            "ended_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if summary:
            data["summary"] = summary
        if duration_seconds is not None:
            data["duration_seconds"] = duration_seconds
        if audio_url:
            data["audio_url"] = audio_url
        if title:
            data["title"] = title
        if context_memo_ids:
            data["context_memo_ids"] = context_memo_ids
        if metadata:
            data["metadata"] = metadata
        
        try:
            response = self.client.table("conversations") \
                .update(data) \
                .eq("id", conversation_id) \
                .execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating conversation from webhook: {e}")
            raise
    
    async def get_user_conversations(
        self, 
        user_id: str, 
        limit: int = 10, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get all conversations for a user."""
        try:
            response = self.client.table("conversations") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(limit) \
                .offset(offset) \
                .execute()
            
            return response.data
        except Exception as e:
            logger.error(f"Error getting user conversations: {e}")
            return []
    
    # Voice memo methods
    async def create_voice_memo(
        self,
        user_id: str,
        audio_url: str,
        duration_seconds: Optional[float] = None,
        file_size_bytes: Optional[int] = None,
        title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new voice memo record."""
        data = {
            "user_id": user_id,
            "audio_url": audio_url,
            "duration_seconds": duration_seconds,
            "file_size_bytes": file_size_bytes,
            "title": title,
            "transcript_status": "pending",
            "metadata": metadata or {}
        }
        
        try:
            response = self.client.table("voice_memos").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating voice memo: {e}")
            raise
    
    async def update_voice_memo_transcript(
        self,
        memo_id: str,
        transcript: str,
        status: str = "completed",
        transcript_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Update voice memo with transcription results."""
        data = {
            "transcript": transcript,
            "transcript_status": status,
            "transcript_metadata": transcript_metadata or {},
            "updated_at": datetime.utcnow().isoformat()
        }
        
        try:
            response = self.client.table("voice_memos") \
                .update(data) \
                .eq("id", memo_id) \
                .execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating voice memo transcript: {e}")
            raise
    
    async def update_voice_memo_tags(
        self,
        memo_id: str,
        tags: List[str],
        summary: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update voice memo with generated tags and summary."""
        data = {
            "tags": tags,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if summary:
            data["summary"] = summary
        
        try:
            response = self.client.table("voice_memos") \
                .update(data) \
                .eq("id", memo_id) \
                .execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating voice memo tags: {e}")
            raise
    
    async def get_voice_memo(
        self,
        memo_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a voice memo by ID (with user verification)."""
        try:
            response = self.client.table("voice_memos") \
                .select("*") \
                .eq("id", memo_id) \
                .eq("user_id", user_id) \
                .single() \
                .execute()
            
            return response.data
        except Exception as e:
            logger.error(f"Error getting voice memo: {e}")
            return None
    
    async def get_user_voice_memos(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        tags: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Get voice memos for a user, optionally filtered by tags."""
        try:
            query = self.client.table("voice_memos") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(limit) \
                .offset(offset)
            
            # Filter by tags if provided
            if tags:
                query = query.contains("tags", tags)
            
            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting user voice memos: {e}")
            return []
    
    # Conversation log methods
    async def create_conversation_log(
        self,
        user_id: str,
        duration_seconds: int
    ) -> Dict[str, Any]:
        """Create a conversation log entry for usage tracking."""
        data = {
            "user_id": user_id,
            "duration_seconds": duration_seconds
        }
        
        try:
            response = self.client.table("conversation_logs").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating conversation log: {e}")
            raise