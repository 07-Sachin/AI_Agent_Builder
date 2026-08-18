from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)

from .database import Base


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
        String,
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
        default=datetime.utcnow,
    )