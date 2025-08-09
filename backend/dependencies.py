from typing import Annotated
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from clients.elevenlabs import ElevenLabsClient
from clients.supabase import SupabaseClient
from services.conversation_service import ConversationService
from middleware.auth import security, verify_token


def get_elevenlabs_client() -> ElevenLabsClient:
    return ElevenLabsClient()


def get_supabase_client() -> SupabaseClient:
    return SupabaseClient()


def get_conversation_service(
    elevenlabs_client: Annotated[ElevenLabsClient, Depends(get_elevenlabs_client)]
) -> ConversationService:
    return ConversationService(elevenlabs_client)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    supabase_client: Annotated[SupabaseClient, Depends(get_supabase_client)]
):
    return await verify_token(credentials.credentials, supabase_client)


# Type aliases for cleaner code
ElevenLabsDep = Annotated[ElevenLabsClient, Depends(get_elevenlabs_client)]
SupabaseDep = Annotated[SupabaseClient, Depends(get_supabase_client)]
ConversationServiceDep = Annotated[ConversationService, Depends(get_conversation_service)]
CurrentUser = Annotated[object, Depends(get_current_user)]