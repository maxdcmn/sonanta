# Database Interaction Guide

## Overview

We're using Supabase as our database, which provides a Postgres database with additional features like Row Level Security (RLS) and real-time subscriptions.

## Current Setup

The Supabase client is already configured in `clients/supabase.py` and can be injected into any service or route using dependency injection.

## Database Schema

First, create the conversations table in your Supabase dashboard:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  signed_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  transcript JSONB,
  summary TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
```

## Example: Database Service

Here's how to create a service that interacts with the database:

```python
# services/database_service.py
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from clients.supabase import SupabaseClient

class DatabaseService:
    def __init__(self, supabase_client: SupabaseClient):
        self.client = supabase_client.get_client()
    
    async def create_conversation(
        self, 
        user_id: str, 
        agent_id: str,
        signed_url: str
    ) -> Dict[str, Any]:
        """Create a new conversation record."""
        data = {
            "user_id": user_id,
            "agent_id": agent_id,
            "signed_url": signed_url
        }
        
        response = self.client.table("conversations").insert(data).execute()
        return response.data[0] if response.data else None
    
    async def get_conversation(
        self, 
        conversation_id: str, 
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a conversation by ID (with user verification)."""
        response = self.client.table("conversations") \
            .select("*") \
            .eq("id", conversation_id) \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        return response.data
    
    async def update_conversation_end(
        self,
        conversation_id: str,
        transcript: Dict[str, Any],
        summary: str,
        duration_seconds: int
    ) -> Dict[str, Any]:
        """Update conversation with end data from webhook."""
        data = {
            "ended_at": datetime.utcnow().isoformat(),
            "transcript": transcript,
            "summary": summary,
            "duration_seconds": duration_seconds
        }
        
        response = self.client.table("conversations") \
            .update(data) \
            .eq("id", conversation_id) \
            .execute()
        
        return response.data[0] if response.data else None
    
    async def get_user_conversations(
        self, 
        user_id: str, 
        limit: int = 10, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get all conversations for a user."""
        response = self.client.table("conversations") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .offset(offset) \
            .execute()
        
        return response.data
```

## Adding Database Service to Dependency Injection

Add this to `dependencies.py`:

```python
from services.database_service import DatabaseService

def get_database_service(
    supabase_client: Annotated[SupabaseClient, Depends(get_supabase_client)]
) -> DatabaseService:
    return DatabaseService(supabase_client)

DatabaseServiceDep = Annotated[DatabaseService, Depends(get_database_service)]
```

## Using in Routes

Example of updating the conversations route to use the database:

```python
# api/v1/routes/conversations.py
from dependencies import ConversationServiceDep, DatabaseServiceDep, CurrentUser

@router.post("/start")
async def start_conversation(
    conversation_service: ConversationServiceDep,
    database_service: DatabaseServiceDep,
    current_user: CurrentUser
) -> Dict[str, str]:
    try:
        # Get signed URL from ElevenLabs
        signed_url = await conversation_service.get_signed_url()
        
        # Create conversation record in database
        conversation = await database_service.create_conversation(
            user_id=str(current_user.id),
            agent_id=conversation_service.elevenlabs_client.agent_id,
            signed_url=signed_url
        )
        
        return {
            "signed_url": signed_url,
            "conversation_id": conversation["id"],
            "user_id": str(current_user.id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Common Database Operations

### 1. Insert
```python
response = client.table("table_name").insert({"column": "value"}).execute()
```

### 2. Select
```python
# Get all
response = client.table("table_name").select("*").execute()

# With filters
response = client.table("table_name").select("*").eq("column", "value").execute()

# Single record
response = client.table("table_name").select("*").eq("id", id).single().execute()
```

### 3. Update
```python
response = client.table("table_name").update({"column": "new_value"}).eq("id", id).execute()
```

### 4. Delete
```python
response = client.table("table_name").delete().eq("id", id).execute()
```

### 5. Complex Queries
```python
# Multiple filters
response = client.table("conversations") \
    .select("*") \
    .eq("user_id", user_id) \
    .gte("created_at", start_date) \
    .lte("created_at", end_date) \
    .order("created_at", desc=True) \
    .execute()

# Join with user data
response = client.table("conversations") \
    .select("*, user:user_id(email, full_name)") \
    .eq("user_id", user_id) \
    .execute()
```

## Error Handling

Always wrap database operations in try-except blocks:

```python
from postgrest.exceptions import APIError

try:
    response = client.table("conversations").insert(data).execute()
    return response.data
except APIError as e:
    # Handle database errors
    logger.error(f"Database error: {e}")
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    # Handle other errors
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

## Best Practices

1. **Use RLS**: Always enable Row Level Security on your tables
2. **Use transactions**: For multiple related operations, use transactions
3. **Index properly**: Add indexes on columns you frequently query
4. **Use prepared statements**: The Supabase client handles this automatically
5. **Validate data**: Use Pydantic models to validate data before inserting
6. **Handle errors**: Always handle database errors gracefully
7. **Use dependency injection**: Keep database logic in services, not routes

## Real-time Subscriptions (Optional)

Supabase also supports real-time subscriptions:

```python
# Subscribe to changes
channel = client.channel("conversations-changes")
channel.on(
    "postgres_changes",
    "*",
    schema="public",
    table="conversations",
    filter=f"user_id=eq.{user_id}"
).subscribe(lambda msg: print(f"Change: {msg}"))
```

This is useful for real-time updates in your application.