from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AgentCreate(BaseModel):
    name: str
    description: str
    provider: str
    model: str
    api_key: str
    system_prompt: str
    temperature: float = 0.7
    max_tokens: int = 4096


class AgentUpdate(BaseModel):
    name: str
    description: str
    provider: str
    model: str
    api_key: str | None = None
    system_prompt: str
    temperature: float = 0.7
    max_tokens: int = 4096


class AgentResponse(BaseModel):
    id: int
    name: str
    description: str
    provider: str
    model: str
    system_prompt: str
    temperature: float
    max_tokens: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================
# TOOL SCHEMAS
# =========================

class ToolCreate(BaseModel):
    name: str
    description: str
    code: str = ""
    enabled: bool = True


class ToolResponse(BaseModel):
    id: int
    agent_id: int
    name: str
    description: str
    code: str = ""
    enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# KNOWLEDGE BASE SCHEMA
# =========================

class KnowledgeResponse(BaseModel):
    id: int
    agent_id: int
    filename: str
    original_filename: str
    file_type: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )