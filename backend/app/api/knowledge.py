import os
import shutil
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Agent, KnowledgeFile
from app.schemas import KnowledgeResponse
from app.services.document_service import extract_text_from_file



router = APIRouter(
    prefix="/agents/{agent_id}/knowledge",
    tags=["Knowledge Base"],
)


UPLOAD_ROOT = Path("uploads")

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".xlsx",
    ".txt",
}


def get_file_type(extension: str) -> str:
    extension = extension.lower()

    types = {
        ".pdf": "PDF",
        ".docx": "DOCX",
        ".xlsx": "XLSX",
        ".txt": "TXT",
    }

    return types.get(extension, "UNKNOWN")


@router.post(
    "/upload",
    response_model=KnowledgeResponse,
)
async def upload_knowledge_file(
    agent_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # ---------------------------------
    # Check agent
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
    # Check filename
    # ---------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required",
        )

    original_filename = file.filename

    extension = Path(
        original_filename
    ).suffix.lower()

    # ---------------------------------
    # Check file type
    # ---------------------------------

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed: PDF, DOCX, XLSX, TXT"
            ),
        )

    # ---------------------------------
    # Create agent upload directory
    # ---------------------------------

    agent_directory = (
        UPLOAD_ROOT / f"agent_{agent_id}"
    )

    agent_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    # ---------------------------------
    # Create safe filename
    # ---------------------------------

    safe_filename = (
        f"{Path(original_filename).stem}"
        f"_{os.urandom(6).hex()}"
        f"{extension}"
    )

    file_path = (
        agent_directory / safe_filename
    )

    # ---------------------------------
    # Save file
    # ---------------------------------

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {error}",
        )

    # ---------------------------------
    # Create database record
    # ---------------------------------
    file_type: str = get_file_type(extension)
    
    try:
        extracted_text = extract_text_from_file(
            str(file_path),
            file_type,
        )
    except Exception as error:
        # Remove uploaded file if extraction fails
        if file_path.exists():
            file_path.unlink()
    
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read file: {error}",
        )
    
    knowledge_file = KnowledgeFile(
        agent_id=agent_id,
        filename=safe_filename,
        original_filename=original_filename,
        file_type=file_type,
        file_path=str(file_path),
        extracted_text=extracted_text,
    )
    

    db.add(knowledge_file)
    db.commit()
    db.refresh(knowledge_file)

    return knowledge_file


@router.get(
    "",
    response_model=list[KnowledgeResponse],
)
def get_knowledge_files(
    agent_id: int,
    db: Session = Depends(get_db),
):
    # Check agent
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

    return (
        db.query(KnowledgeFile)
        .filter(
            KnowledgeFile.agent_id == agent_id
        )
        .order_by(
            KnowledgeFile.created_at.desc()
        )
        .all()
    )


@router.delete(
    "/{file_id}"
)
def delete_knowledge_file(
    agent_id: int,
    file_id: int,
    db: Session = Depends(get_db),
):
    knowledge_file = (
        db.query(KnowledgeFile)
        .filter(
            KnowledgeFile.id == file_id,
            KnowledgeFile.agent_id == agent_id,
        )
        .first()
    )

    if knowledge_file is None:
        raise HTTPException(
            status_code=404,
            detail="Knowledge file not found",
        )

    # Delete physical file
    file_path = Path(
        knowledge_file.file_path
    )

    if file_path.exists():
        file_path.unlink()

    # Delete database record
    db.delete(knowledge_file)
    db.commit()

    return {
        "message": "Knowledge file deleted successfully"
    }