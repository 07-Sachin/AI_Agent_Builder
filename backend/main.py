from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.tools import router as tools_router
from app.api.agents import router as agents_router
from app.api.chat import router as chat_router
from app.database import Base, engine
from app import models
from app.api.knowledge import router as knowledge_router
from app.api.chat_attachments import (
    router as chat_attachments_router,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Agent Builder API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(agents_router)
app.include_router(chat_router)
app.include_router(tools_router)
app.include_router(knowledge_router)
app.include_router(chat_attachments_router)

@app.get("/")
def root():
    return {
        "message": "AI Agent Builder API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }