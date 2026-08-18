from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud import create_agent,get_agents,get_agent,delete_agent,update_agent


from app.database import get_db
from app.schemas import AgentCreate, AgentUpdate, AgentResponse

router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)


@router.post(
    "",
    response_model=AgentResponse,
)
def create_new_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
):
    return create_agent(db, agent)


@router.get(
    "",
    response_model=list[AgentResponse],
)
def list_all_agents(
    db: Session = Depends(get_db),
):
    return get_agents(db)


@router.get(
    "/{agent_id}",
    response_model=AgentResponse,
)
def get_single_agent(
    agent_id: int,
    db: Session = Depends(get_db),
):
    agent = get_agent(db, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    return agent


@router.put(
    "/{agent_id}",
    response_model=AgentResponse,
)
def edit_agent(
    agent_id: int,
    agent_data: AgentUpdate,
    db: Session = Depends(get_db),
):
    agent = update_agent(
        db,
        agent_id,
        agent_data,
    )

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    return agent

@router.delete("/{agent_id}")
def remove_agent(
    agent_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_agent(db, agent_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    return {
        "message": "Agent deleted successfully"
    }