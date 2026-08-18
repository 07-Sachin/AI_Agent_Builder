from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
)

from .database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    description = Column(
        String(500),
        nullable=False,
    )

    provider = Column(
        String(50),
        nullable=False,
    )

    model = Column(
        String(100),
        nullable=False,
    )

    api_key = Column(
        Text,
        nullable=False,
    )

    system_prompt = Column(
        Text,
        nullable=False,
    )

    temperature = Column(
        Float,
        nullable=False,
        default=0.7,
    )

    max_tokens = Column(
        Integer,
        nullable=False,
        default=4096,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )


class AgentTool(Base):
    __tablename__ = "agent_tools"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    agent_id = Column(
        Integer,
        ForeignKey("agents.id"),
        nullable=False,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
    )

    code = Column(
        Text,
        nullable=True,
    )

    enabled = Column(
        Boolean,
        default=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )


class KnowledgeFile(Base):
    __tablename__ = "knowledge_files"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    agent_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    filename = Column(
        String(255),
        nullable=False,
    )

    original_filename = Column(
        String(255),
        nullable=False,
    )

    file_type = Column(
        String(50),
        nullable=False,
    )

    file_path = Column(
        String(500),
        nullable=False,
    )

    extracted_text = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )