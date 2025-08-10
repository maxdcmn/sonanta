import json
import httpx
from typing import List, Dict, Any
from services.database_service import DatabaseService
from clients.supabase import SupabaseClient
from config import config


async def transcribe_voice_memo(memo_id: str, database_service: DatabaseService, supabase_client: SupabaseClient):
    try:
        memo = await database_service.get_voice_memo(memo_id, memo_id)
        if not memo:
            raise ValueError(f"Memo {memo_id} not found")
        
        audio_url = memo.get("audio_url")
        if not audio_url:
            raise ValueError("No audio URL found")
        
        # Extract file path from URL
        # Format: https://<project>.supabase.co/storage/v1/object/public/voice-memos/<path>
        file_path = audio_url.split("/voice-memos/")[-1]
        
        # Download audio from storage
        storage = supabase_client.client.storage
        file_data = storage.from_("voice-memos").download(file_path)
        
        # Detect file extension
        file_ext = file_path.split('.')[-1] or 'webm'
        mime_types = {
            'webm': 'audio/webm',
            'mp4': 'audio/mp4',
            'm4a': 'audio/mp4',
            'ogg': 'audio/ogg',
            'mp3': 'audio/mp3',
            'wav': 'audio/wav'
        }
        mime_type = mime_types.get(file_ext, 'audio/webm')
        
        # Create multipart form data
        files = {
            'file': (f'audio.{file_ext}', file_data, mime_type),
            'model_id': (None, 'scribe_v1')
        }
        
        # Call ElevenLabs API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://api.elevenlabs.io/v1/speech-to-text',
                headers={'xi-api-key': config.elevenlabs_api_key},
                files=files
            )
            
            if response.status_code != 200:
                raise Exception(f"ElevenLabs API failed: {response.status_code}")
            
            data = response.json()
            transcript = data.get('text', '')
            
            await database_service.update_voice_memo_transcript(
                memo_id=memo_id,
                transcript=transcript,
                status='completed',
                transcript_metadata={
                    'language': data.get('language_code'),
                    'confidence': data.get('language_probability')
                }
            )
            
            # Trigger tag generation
            await generate_tags_for_memo(memo_id, database_service)
            
    except Exception as e:
        await database_service.update_voice_memo_transcript(
            memo_id=memo_id,
            transcript="",
            status='failed',
            transcript_metadata={'error': str(e)}
        )


async def generate_tags_for_memo(memo_id: str, database_service: DatabaseService):
    try:
        # Get memo with transcript
        memo = await database_service.get_voice_memo(memo_id, memo_id)
        if not memo or not memo.get('transcript'):
            return
        
        transcript = memo['transcript']
        
        # OpenAI request
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {config.openai_api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'gpt-4o-mini',
                    'messages': [
                        {
                            'role': 'system',
                            'content': '''Extract 1-4 relevant tags from the voice memo transcript.
          
Tag categories to consider:
- Emotions: happy, sad, anxious, grateful, excited, frustrated, peaceful
- Topics: work, family, health, money, relationship, goals, ideas
- Activities: planning, meeting, exercise, cooking, travel, reading
- Context: morning, evening, weekend, urgent, reflection

Rules:
- Single words only, lowercase
- Choose the most relevant tags for the content
- If unclear, use general tags like "personal" or "thoughts"
- Always return at least 1 tag

Return ONLY a JSON array, no other text. Example: ["work", "planning", "anxious"]'''
                        },
                        {
                            'role': 'user',
                            'content': transcript
                        }
                    ],
                    'temperature': 0.3,
                    'max_tokens': 50
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API failed: {response.status_code}")
            
            content = response.json()['choices'][0]['message']['content']
            
            try:
                tags = json.loads(content or '[]')
                tags = [
                    tag.lower().strip() 
                    for tag in tags 
                    if isinstance(tag, str) and tag.strip()
                ][:4]
            except:
                # Fallback: extract words from response
                import re
                words = re.findall(r'\w+', content or '')
                tags = [w.lower() for w in words[:4]]
            
            if not tags:
                tags = ['general']
            
            await database_service.update_voice_memo_tags(
                memo_id=memo_id,
                tags=tags
            )
            
    except Exception as e:


async def process_voice_memo(memo_id: str):
    supabase_client = SupabaseClient()
    database_service = DatabaseService(supabase_client)
    
    await transcribe_voice_memo(memo_id, database_service, supabase_client)