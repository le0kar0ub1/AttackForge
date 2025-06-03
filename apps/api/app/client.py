import httpx
from typing import List
from .models import ModelConfig, ChatMessage, ChatRequest, ChatResponse

class APIClient:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def chat_completion(
        self, 
        model_config: ModelConfig, 
        messages: List[ChatMessage],
        temperature: float = None,
        max_tokens: int = None
    ) -> ChatResponse:
        """Make a chat completion request to an OpenAI-compatible API."""
        
        # Prepare the request
        request_data = ChatRequest(
            model=model_config.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {model_config.api_key}"
        }
        
        try:
            response = await self.client.post(
                str(model_config.api_url),
                json=request_data.dict(exclude_none=True),
                headers=headers
            )
            response.raise_for_status()
            
            response_data = response.json()
            return ChatResponse(**response_data)
            
        except httpx.HTTPStatusError as e:
            raise Exception(f"API request failed: {e.response.status_code} {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            raise Exception(f"Unexpected error: {str(e)}")
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

# Global client instance
api_client = APIClient() 