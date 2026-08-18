from sqlalchemy.orm import Session

from .models import Agent, AgentTool
from .schemas import AgentCreate, AgentUpdate, ToolCreate


def create_agent(
    db: Session,
    agent_data: AgentCreate,
):
    agent = Agent(
        name=agent_data.name,
        description=agent_data.description,
        provider=agent_data.provider,
        model=agent_data.model,
        api_key=agent_data.api_key,
        system_prompt=agent_data.system_prompt,
        temperature=agent_data.temperature,
        max_tokens=agent_data.max_tokens,
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)

    return agent


def get_agents(db: Session):
    return (
        db.query(Agent)
        .order_by(Agent.created_at.desc())
        .all()
    )

def create_tool(
    db: Session,
    agent_id: int,
    tool_data: ToolCreate,
):
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


def get_agent(
    db: Session,
    agent_id: int,
):
    return (
        db.query(Agent)
        .filter(Agent.id == agent_id)
        .first()
    )


def update_agent(
    db: Session,
    agent_id: int,
    agent_data: AgentUpdate,
):
    agent = get_agent(db, agent_id)

    if agent is None:
        return None

    agent.name = agent_data.name
    agent.description = agent_data.description
    agent.provider = agent_data.provider
    agent.model = agent_data.model
    agent.api_key = agent_data.api_key
    agent.system_prompt = agent_data.system_prompt
    agent.temperature = agent_data.temperature
    agent.max_tokens = agent_data.max_tokens

    db.commit()
    db.refresh(agent)

    return agent


def delete_agent(
    db: Session,
    agent_id: int,
):
    agent = get_agent(db, agent_id)

    if agent is None:
        return False

    db.delete(agent)
    db.commit()

    return True