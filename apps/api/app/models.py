from typing import Optional, List, Literal
from pydantic import BaseModel, HttpUrl
from datetime import datetime

class ModelConfig(BaseModel):
    id: str
    name: str
    api_url: HttpUrl
    api_key: str
    model: str
    system_prompt: Optional[str] = None

class SessionConfig(BaseModel):
    red_teamer: ModelConfig
    target: ModelConfig
    judge: Optional[ModelConfig] = None

class Message(BaseModel):
    id: str
    role: Literal['red-teamer', 'target', 'judge', 'user']
    content: str
    timestamp: str
    is_edited: bool
    original_content: Optional[str] = None

class Session(BaseModel):
    id: str
    name: str
    config: SessionConfig
    messages: List[Message]
    created_at: str
    status: Literal['active', 'completed']

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

class ChatChoice(BaseModel):
    index: int
    message: ChatMessage
    finish_reason: str

class ChatResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatChoice]
    usage: Optional[dict] = None

class GenerateRequest(BaseModel):
    model_config: ModelConfig
    messages: List[ChatMessage]
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

class GenerateResponse(BaseModel):
    content: str
    success: bool
    error: Optional[str] = None 