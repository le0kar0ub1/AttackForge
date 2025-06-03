import json
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from .models import Session

DATA_DIR = "data"
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

def ensure_data_dir():
    """Ensure the data directory exists."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def load_sessions() -> Dict[str, Any]:
    """Load sessions from JSON file."""
    ensure_data_dir()
    if not os.path.exists(SESSIONS_FILE):
        return {}
    
    try:
        with open(SESSIONS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

def save_sessions(sessions: Dict[str, Any]) -> None:
    """Save sessions to JSON file."""
    ensure_data_dir()
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(sessions, f, indent=2, default=str)

def get_all_sessions() -> List[Session]:
    """Get all sessions."""
    sessions_data = load_sessions()
    sessions = []
    for session_id, session_data in sessions_data.items():
        try:
            session = Session(**session_data)
            sessions.append(session)
        except Exception as e:
            print(f"Error loading session {session_id}: {e}")
            continue
    
    # Sort by created_at descending
    sessions.sort(key=lambda x: x.created_at, reverse=True)
    return sessions

def get_session(session_id: str) -> Optional[Session]:
    """Get a specific session by ID."""
    sessions_data = load_sessions()
    session_data = sessions_data.get(session_id)
    if not session_data:
        return None
    
    try:
        return Session(**session_data)
    except Exception as e:
        print(f"Error loading session {session_id}: {e}")
        return None

def save_session(session: Session) -> bool:
    """Save or update a session."""
    try:
        sessions_data = load_sessions()
        sessions_data[session.id] = session.dict()
        save_sessions(sessions_data)
        return True
    except Exception as e:
        print(f"Error saving session {session.id}: {e}")
        return False

def delete_session(session_id: str) -> bool:
    """Delete a session."""
    try:
        sessions_data = load_sessions()
        if session_id in sessions_data:
            del sessions_data[session_id]
            save_sessions(sessions_data)
            return True
        return False
    except Exception as e:
        print(f"Error deleting session {session_id}: {e}")
        return False 