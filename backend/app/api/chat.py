import requests

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Agent
from app.schemas_chat import ChatRequest, ChatResponse
from app.services.knowledge_service import (
    build_knowledge_context,
)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    # ---------------------------------
    # Get agent
    # ---------------------------------

    agent = (
        db.query(Agent)
        .filter(Agent.id == request.agent_id)
        .first()
    )

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    # ---------------------------------
    # Validate message
    # ---------------------------------

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    # ---------------------------------
    # Provider check
    # ---------------------------------

    if agent.provider.lower() != "gemini":
        raise HTTPException(
            status_code=400,
            detail="Phase 1 currently supports Gemini agents.",
        )

    # ---------------------------------
    # Knowledge Base
    # ---------------------------------

    knowledge_context = build_knowledge_context(
        db=db,
        agent_id=agent.id,
        question=request.message,
    )

    # IMPORTANT:
    # Always initialize this variable.
    system_instruction = agent.system_prompt

    # ---------------------------------
    # Add Knowledge Base context
    # ---------------------------------

    if knowledge_context:
        system_instruction = f"""
{agent.system_prompt}

IMPORTANT KNOWLEDGE BASE INSTRUCTIONS:

Use the following information from the
agent's Knowledge Base when answering
the user's question.

KNOWLEDGE BASE:

{knowledge_context}

RULES:

1. Prefer the Knowledge Base information
   when it directly answers the user's question.

2. Do not invent company policies, terms,
   prices, procedures, or facts that are not
   supported by the Knowledge Base.

3. If the Knowledge Base does not contain
   the required information, clearly say that
   the information was not found in the
   Knowledge Base.

4. Never contradict the Knowledge Base.
""".strip()

    # ---------------------------------
    # Gemini API URL
    # ---------------------------------

    url = (
        "https://generativelanguage.googleapis.com/"
        f"v1beta/models/{agent.model}:generateContent"
        f"?key={agent.api_key}"
    )

    # ---------------------------------
    # Gemini request
    # ---------------------------------

    payload = {
        "systemInstruction": {
            "parts": [
                {
                    "text": system_instruction,
                }
            ]
        },
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": request.message,
                    }
                ],
            }
        ],
        "generationConfig": {
            "temperature": agent.temperature,
            "maxOutputTokens": agent.max_tokens,
        },
    }

    # ---------------------------------
    # Send request to Gemini
    # ---------------------------------

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=60,
        )

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini connection failed: {error}",
        )

    # ---------------------------------
    # Gemini API error
    # ---------------------------------

    if response.status_code != 200:

        try:
            error_data = response.json()

        except Exception:
            error_data = response.text

        raise HTTPException(
            status_code=response.status_code,
            detail=error_data,
        )

    # ---------------------------------
    # Read Gemini response
    # ---------------------------------

    data = response.json()

    try:
        generated_text = (
            data["candidates"][0]
            ["content"]["parts"][0]["text"]
        )

    except (
        KeyError,
        IndexError,
        TypeError,
    ):
        raise HTTPException(
            status_code=502,
            detail="Unexpected Gemini response.",
        )

    # ---------------------------------
    # Return response
    # ---------------------------------

    return ChatResponse(
        agent_id=agent.id,
        message=request.message,
        response=generated_text,
    )