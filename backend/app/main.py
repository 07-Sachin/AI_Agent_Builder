from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.chat import router as chat_router
from app import crud, models
from app.database import get_db, Base, engine
from backend.app.schemas_chat import AgentCreate, AgentResponse


router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)


@router.post(
    "",
    response_model=AgentResponse,
)
def create_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
):
    return crud.create_agent(db, agent)


@router.get(
    "",
    response_model=list[AgentResponse],
)
def list_agents(
    db: Session = Depends(get_db),
):
    return crud.get_agents(db)


@router.get(
    "/{agent_id}",
    response_model=AgentResponse,
)
def get_agent(
    agent_id: int,
    db: Session = Depends(get_db),
):
    agent = crud.get_agent(db, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    return agent


@router.delete("/{agent_id}")
def delete_agent(
    agent_id: int,
    db: Session = Depends(get_db),
):
    deleted = crud.delete_agent(db, agent_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    return {
        "message": "Agent deleted successfully"
    }