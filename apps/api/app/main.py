from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uuid
from datetime import datetime

from .models import (
    Session, Message, ModelConfig, GenerateRequest, GenerateResponse,
    ChatMessage
)
from .storage import (
    get_all_sessions, get_session, save_session, delete_session
)
from .client import api_client

app = FastAPI(
    title="AttackForge API",
    description="LLM Adversarial Testing Platform API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "AttackForge API is running"}

@app.post("/api/v1/chat/generate")
async def generate_chat_response(request: GenerateRequest) -> GenerateResponse:
    """Generate a response using the specified model configuration."""
    try:
        # Add system prompt if available
        messages = []
        if request.model_config.system_prompt:
            messages.append(ChatMessage(
                role="system",
                content=request.model_config.system_prompt
            ))
        messages.extend(request.messages)
        
        # Make the API call
        response = await api_client.chat_completion(
            model_config=request.model_config,
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        if not response.choices or len(response.choices) == 0:
            return GenerateResponse(
                content="",
                success=False,
                error="No response choices returned from API"
            )
        
        return GenerateResponse(
            content=response.choices[0].message.content,
            success=True
        )
        
    except Exception as e:
        return GenerateResponse(
            content="",
            success=False,
            error=str(e)
        )

@app.get("/api/v1/sessions")
async def get_sessions() -> List[Session]:
    """Get all sessions."""
    try:
        return get_all_sessions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/sessions")
async def create_session(session: Session) -> Session:
    """Create a new session."""
    try:
        # Ensure the session has a unique ID and timestamp
        session.id = str(uuid.uuid4())
        session.created_at = datetime.now().isoformat()
        session.status = "active"
        
        success = save_session(session)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save session")
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/sessions/{session_id}")
async def get_session_by_id(session_id: str) -> Session:
    """Get a specific session by ID."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.put("/api/v1/sessions/{session_id}")
async def update_session(session_id: str, session: Session) -> Session:
    """Update an existing session."""
    try:
        # Ensure the session ID matches
        session.id = session_id
        
        success = save_session(session)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update session")
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/sessions/{session_id}")
async def delete_session_by_id(session_id: str) -> dict:
    """Delete a session."""
    try:
        success = delete_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/sessions/{session_id}/export")
async def export_session(session_id: str, format: str = "json") -> dict:
    """Export a session in the specified format."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        if format.lower() == "json":
            return {
                "session": session.dict(),
                "format": "json",
                "exported_at": datetime.now().isoformat()
            }
        elif format.lower() == "markdown":
            # Generate markdown content
            markdown = f"# {session.name}\n\n"
            markdown += f"**Created:** {session.created_at}\n"
            markdown += f"**Status:** {session.status}\n\n"
            
            markdown += "## Configuration\n\n"
            markdown += f"**Red Teamer:** {session.config.red_teamer.name}\n"
            markdown += f"**Target:** {session.config.target.name}\n"
            if session.config.judge:
                markdown += f"**Judge:** {session.config.judge.name}\n"
            markdown += "\n"
            
            markdown += "## Conversation\n\n"
            for i, msg in enumerate(session.messages):
                markdown += f"### Message {i + 1} ({msg.role})\n"
                markdown += f"**Time:** {msg.timestamp}\n"
                if msg.is_edited:
                    markdown += "**Edited:** Yes\n"
                markdown += f"\n{msg.content}\n\n"
            
            return {
                "content": markdown,
                "format": "markdown",
                "exported_at": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use 'json' or 'markdown'")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    await api_client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 