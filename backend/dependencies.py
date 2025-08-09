from typing import Annotated
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from clients.elevenlabs import ElevenLabsClient
from clients.supabase import SupabaseClient
from services.conversation_service import ConversationService
from services.database_service import DatabaseService
from services.voice_memo_service import VoiceMemoService
from middleware.auth import security, verify_token


def get_elevenlabs_client() -> ElevenLabsClient:
    return ElevenLabsClient()


def get_supabase_client() -> SupabaseClient:
    return SupabaseClient()


def get_conversation_service(
    elevenlabs_client: Annotated[ElevenLabsClient, Depends(get_elevenlabs_client)]
) -> ConversationService:
    return ConversationService(elevenlabs_client)


def get_database_service(
    supabase_client: Annotated[SupabaseClient, Depends(get_supabase_client)]
) -> DatabaseService:
    return DatabaseService(supabase_client)


def get_voice_memo_service(
    supabase_client: Annotated[SupabaseClient, Depends(get_supabase_client)],
    database_service: Annotated[DatabaseService, Depends(get_database_service)]
) -> VoiceMemoService:
    return VoiceMemoService(supabase_client, database_service)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    supabase_client: Annotated[SupabaseClient, Depends(get_supabase_client)]
):
    return await verify_token(credentials.credentials, supabase_client)


# Type aliases for cleaner code
ElevenLabsDep = Annotated[ElevenLabsClient, Depends(get_elevenlabs_client)]
SupabaseDep = Annotated[SupabaseClient, Depends(get_supabase_client)]
ConversationServiceDep = Annotated[ConversationService, Depends(get_conversation_service)]
DatabaseServiceDep = Annotated[DatabaseService, Depends(get_database_service)]
VoiceMemoServiceDep = Annotated[VoiceMemoService, Depends(get_voice_memo_service)]
CurrentUser = Annotated[object, Depends(get_current_user)]