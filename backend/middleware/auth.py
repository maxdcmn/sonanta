from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Annotated
from config import config
from clients.supabase import SupabaseClient

security = HTTPBearer()


async def verify_token(
    token: str,
    supabase_client: SupabaseClient
):
    try:
        payload = jwt.decode(
            token,
            config.supabase_anon_key,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        
        user_response = await supabase_client.verify_token(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_response.user
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )