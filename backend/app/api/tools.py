from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Agent, AgentTool
from app.schemas import ToolCreate, ToolResponse


router = APIRouter(
    prefix="/agents/{agent_id}/tools",
    tags=["Agent Tools"],
)


# =========================================================
# CREATE TOOL
# =========================================================

@router.post(
    "",
    response_model=ToolResponse,
)
def create_tool(
    agent_id: int,
    tool_data: ToolCreate,
    db: Session = Depends(get_db),
):
    # Check agent
    agent = (
        db.query(Agent)
        .filter(
            Agent.id == agent_id
        )
        .first()
    )

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    # Check duplicate tool
    existing_tool = (
        db.query(AgentTool)
        .filter(
            AgentTool.agent_id == agent_id,
            AgentTool.name == tool_data.name,
        )
        .first()
    )

    if existing_tool:
        raise HTTPException(
            status_code=400,
            detail="Tool already exists for this agent",
        )

    # Create tool
    tool = AgentTool(
        agent_id=agent_id,
        name=tool_data.name,
        description=tool_data.description,
        code=tool_data.code,
        enabled=tool_data.enabled,
    )

    db.add(tool)
    db.commit()
    db.refresh(tool)

    return tool


# =========================================================
# GET TOOLS
# =========================================================

@router.get(
    "",
    response_model=list[ToolResponse],
)
def get_tools(
    agent_id: int,
    db: Session = Depends(get_db),
):
    # Check agent
    agent = (
        db.query(Agent)
        .filter(
            Agent.id == agent_id
        )
        .first()
    )

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    return (
        db.query(AgentTool)
        .filter(
            AgentTool.agent_id == agent_id
        )
        .order_by(
            AgentTool.id.asc()
        )
        .all()
    )


# =========================================================
# UPDATE TOOL
# =========================================================

@router.put(
    "/{tool_id}",
    response_model=ToolResponse,
)
def update_tool(
    agent_id: int,
    tool_id: int,
    tool_data: ToolCreate,
    db: Session = Depends(get_db),
):
    tool = (
        db.query(AgentTool)
        .filter(
            AgentTool.id == tool_id,
            AgentTool.agent_id == agent_id,
        )
        .first()
    )

    if tool is None:
        raise HTTPException(
            status_code=404,
            detail="Tool not found",
        )

    tool.name = tool_data.name
    tool.description = tool_data.description
    tool.code = tool_data.code
    tool.enabled = tool_data.enabled

    db.commit()
    db.refresh(tool)

    return tool


# =========================================================
# DELETE TOOL
# =========================================================

@router.delete(
    "/{tool_id}"
)
def delete_tool(
    agent_id: int,
    tool_id: int,
    db: Session = Depends(get_db),
):
    tool = (
        db.query(AgentTool)
        .filter(
            AgentTool.id == tool_id,
            AgentTool.agent_id == agent_id,
        )
        .first()
    )

    if tool is None:
        raise HTTPException(
            status_code=404,
            detail="Tool not found",
        )

    db.delete(tool)
    db.commit()

    return {
        "message": "Tool deleted successfully"
    }