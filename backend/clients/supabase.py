from supabase import create_client, Client
from config import config


class SupabaseClient:
    def __init__(self) -> None:
        self.client: Client = create_client(
            config.supabase_url,
            config.supabase_service_key
        )
    
    def get_client(self) -> Client:
        return self.client
    
    async def verify_token(self, token: str):
        try:
            # using the service key to verify tokens
            user = self.client.auth.get_user(token)
            return user
        except Exception as e:
            return None
        
        
supabase_client = SupabaseClient()