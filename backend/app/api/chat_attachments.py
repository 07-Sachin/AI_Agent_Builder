import os
import shutil
from pathlib import Path

import requests

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Agent
from app.services.document_service import extract_text_from_file


router = APIRouter(
    prefix="/chat",
    tags=["Chat Attachments"],
)


ALLOWED_EXTENSIONS = {
    ".pdf": "PDF",
    ".docx": "DOCX",
    ".xlsx": "XLSX",
    ".txt": "TXT",
}


@router.post("/attachment")
async def chat_with_attachment(
    agent_id: int = Form(...),
    message: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # ---------------------------------
    # Find agent
    # ---------------------------------

    agent = (
        db.query(Agent)
        .filter(Agent.id == agent_id)
        .first()
    )

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    # ---------------------------------
    # Provider
    # ---------------------------------

    if agent.provider.lower() != "gemini":
        raise HTTPException(
            status_code=400,
            detail="Phase 1 currently supports Gemini agents.",
        )

    # ---------------------------------
    # Check filename
    # ---------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required.",
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed: PDF, DOCX, XLSX, TXT."
            ),
        )

    file_type = ALLOWED_EXTENSIONS[
        extension
    ]

    # ---------------------------------
    # Save temporary file
    # ---------------------------------

    upload_directory = (
        Path("uploads")
        / f"chat_{agent_id}"
    )

    upload_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    safe_filename = (
        f"{Path(file.filename).stem}_"
        f"{os.urandom(6).hex()}"
        f"{extension}"
    )

    file_path = (
        upload_directory
        / safe_filename
    )

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        # ---------------------------------
        # Extract text
        # ---------------------------------

        extracted_text = extract_text_from_file(
            str(file_path),
            file_type,
        )

    except Exception as error:
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=400,
            detail=f"Failed to read file: {error}",
        )

    finally:
        await file.close()

    # ---------------------------------
    # Build prompt
    # ---------------------------------

    user_question = message.strip()

    if not user_question:
        user_question = (
            "Analyze the attached document and "
            "provide a useful summary of its contents."
        )

    system_instruction = f"""
{agent.system_prompt}

You are analyzing a file uploaded by the user.

File name:
{file.filename}

File type:
{file_type}

File contents:
{extracted_text}

Instructions:

1. Use the uploaded file as the primary source.
2. Answer the user's question using the file.
3. Do not invent information that is not present.
4. If the requested information is not present,
   clearly say so.
""".strip()

    # ---------------------------------
    # Gemini API
    # ---------------------------------

    url = (
        "https://generativelanguage.googleapis.com/"
        f"v1beta/models/{agent.model}:generateContent"
        f"?key={agent.api_key}"
    )

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
                        "text": user_question,
                    }
                ],
            }
        ],
        "generationConfig": {
            "temperature": agent.temperature,
            "maxOutputTokens": agent.max_tokens,
        },
    }

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

    if response.status_code != 200:
        try:
            error_data = response.json()
        except Exception:
            error_data = response.text

        raise HTTPException(
            status_code=response.status_code,
            detail=error_data,
        )

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
    # Remove temporary file
    # ---------------------------------

    try:
        if file_path.exists():
            file_path.unlink()
    except Exception:
        pass

    return {
        "agent_id": agent.id,
        "message": user_question,
        "filename": file.filename,
        "response": generated_text,
    }