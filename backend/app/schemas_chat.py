from datetime import datetime
from pydantic import BaseModel
from pydantic import BaseModel, ConfigDict, Field


class AgentCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100,
    )

    description: str = Field(
        min_length=5,
        max_length=500,
    )

    provider: str

    model: str

    api_key: str

    system_prompt: str = Field(
        min_length=10,
    )

    temperature: float = Field(
        default=0.7,
        ge=0,
        le=2,
    )

    max_tokens: int = Field(
        default=4096,
        ge=100,
        le=128000,
    )


class AgentResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    name: str

    description: str

    provider: str

    model: str

    system_prompt: str

    temperature: float

    max_tokens: int

    created_at: datetime


class ChatRequest(BaseModel):
    agent_id: int
    message: str


class ChatResponse(BaseModel):
    agent_id: int
    message: str
    response: str