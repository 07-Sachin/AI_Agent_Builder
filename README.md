# AI Agent Builder

A full-stack web application for creating, configuring, and chatting
with custom AI agents powered by Google's Gemini API. Agents can use
custom instructions, configured tools, and uploaded documents to answer
questions through a chat interface.

> **Project status:** This README is based on the available project
> details. Authentication, deployment, and production security are not
> confirmed as implemented.

## Table of Contents

-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Architecture](#architecture)
-   [Project Structure](#project-structure)
-   [Data Storage](#data-storage)
-   [Chat and File Attachments](#chat-and-file-attachments)
-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Run the Application](#run-the-application)
-   [API Overview](#api-overview)
-   [Supported Documents](#supported-documents)
-   [Security and Limitations](#security-and-limitations)
-   [Troubleshooting](#troubleshooting)
-   [Future Improvements](#future-improvements)

## Features

-   Create agents with a name, description, model, system prompt,
    temperature, and maximum output tokens.
-   View, edit, and delete agents.
-   Generate responses using the Google Gemini API.
-   Chat with agents and view saved conversation history.
-   Display sent messages immediately while the AI response is being
    generated.
-   Attach PDF, DOCX, XLSX, and TXT files to chat messages.
-   Extract document text so the AI can answer questions about uploaded
    files.
-   Upload documents to an agent knowledge base.
-   Configure tools with names, descriptions, parameter definitions, and
    enabled/disabled status.
-   Support tool calling in the Gemini chat flow, including a calculator
    tool when configured and working.
-   Clear an agent's chat history.
-   Store application records in SQLite and uploaded documents in local
    folders.

## Technology Stack

**Frontend** - Next.js - React - TypeScript - Tailwind CSS - Axios

**Backend** - Python 3.10 - FastAPI - Uvicorn - SQLAlchemy - SQLite -
PyPDF2, python-docx, and openpyxl for document extraction

**AI** - Google Gemini API - Gemini `generateContent` API with
function/tool calling in the current implementation

Model availability and API quotas depend on the Gemini API project and
selected model.

## Architecture

``` text
Browser
  |
  v
Next.js / React / TypeScript
  |
  v
FastAPI backend
  |
  +--> SQLAlchemy --> SQLite (agents.db)
  |
  +--> Local uploaded files
  |
  +--> Document text extraction
  |
  +--> Gemini API
  |
  +--> Configured tool execution
```

The frontend calls the FastAPI backend. The backend reads and writes
records using SQLAlchemy, processes uploaded documents, and calls Gemini
to generate answers. Files are stored separately from the SQLite
database.

## Project Structure

Project root: `D:\codes\AI_Agent_Builder`

``` text
AI_Agent_Builder/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agents.py
│   │   │   ├── chat.py
│   │   │   ├── chat_files.py
│   │   │   ├── tools.py
│   │   │   └── knowledge.py
│   │   ├── services/
│   │   │   ├── document_service.py
│   │   │   ├── knowledge_service.py
│   │   │   └── tool_executor.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── schemas_chat.py
│   ├── uploads/
│   ├── agents.db
│   └── main.py
├── frontend/
│   ├── app/
│   │   ├── agents/
│   │   ├── chat/
│   │   ├── create-agent/
│   │   └── ...
│   ├── services/
│   │   ├── agent.service.ts
│   │   └── api.ts
│   └── package.json
└── .gitignore
```

This is a representative structure based on the project context; your
local files may differ.

## Data Storage

### SQLite database

Database file: `backend/agents.db`

It stores records such as: - Agent configurations - Tool definitions and
parameter metadata - Chat sessions and chat messages - Knowledge-base
metadata and, depending on the implementation, extracted text

SQLAlchemy models in the project include `Agent`, `AgentTool`,
`ChatSession`, and `ChatMessage`.

### Uploaded documents

Knowledge-base documents are stored in agent-specific folders, for
example:

`backend/uploads/agent_<agent_id>/`

Chat attachments are stored separately, for example:

`backend/uploads/chat/agent_<agent_id>/`

The exact relative path depends on the upload route and the directory
from which the backend is launched.

### API keys

The current agent model includes an `api_key` database column. In the
existing development implementation, agent API keys are stored in
SQLite. Review the security notes below before sharing or deploying the
application.

### Git ignore

The root `.gitignore` should exclude `.env` files, SQLite databases,
uploaded documents, Python virtual environments and caches,
`node_modules`, `.next`, and build outputs. Never commit API keys,
private documents, or a populated local database to a public repository.

## Chat and File Attachments

1.  The user opens an agent's chat.
2.  The user types a question and optionally attaches a PDF, DOCX, XLSX,
    or TXT file.
3.  The upload endpoint saves the file and extracts its text.
4.  The frontend displays the selected attachment as a file card.
5.  On Send, the question and extracted document content are submitted
    to the backend using the current message format.
6.  The backend supplies the document content to Gemini as part of the
    request.
7.  The assistant response is returned and displayed in the
    conversation.

The chat UI is designed to move the user's message into the conversation
immediately after Send is clicked, while a typing indicator appears
during AI processing.

**Implementation note:** In the current message flow, extracted
attachment text is included in the backend message payload. If the
backend stores that entire payload as the user's message, the extracted
text may also be saved in chat history even though the frontend hides
it. A future improvement is to store the visible question and attachment
metadata separately from private document context.

## Prerequisites

-   Python 3.10
-   Node.js and npm compatible with the installed Next.js version
-   A Google Gemini API key with access to the selected model
-   PowerShell or another terminal on Windows

## Installation

### 1. Open the project

``` powershell
cd D:\codes\AI_Agent_Builder
```

### 2. Set up the backend environment

``` powershell
cd D:\codes\AI_Agent_Builder\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install dependencies from the project's `requirements.txt`:

``` powershell
pip install -r requirements.txt
```

If `requirements.txt` is missing, create it from the dependencies
actually imported by the project. Likely dependencies include FastAPI,
Uvicorn, SQLAlchemy, requests, python-multipart, PyPDF2, python-docx,
and openpyxl. Verify the source files before pinning versions.

### 3. Configure the Gemini API key

Use the agent configuration form if it accepts an API key for each
agent. Do not hard-code API keys in source files or commit them to Git.
If environment variables are used, make sure `.env` is ignored by Git
and the backend reads the key securely.

### 4. Install frontend dependencies

Open a second terminal:

``` powershell
cd D:\codes\AI_Agent_Builder\frontend
npm install
```

Check `frontend/services/api.ts` to confirm the backend base URL. The
local backend is expected at `http://127.0.0.1:8000`.

## Run the Application

### Start the backend

``` powershell
cd D:\codes\AI_Agent_Builder\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Interactive API documentation is available at:

`http://127.0.0.1:8000/docs`

### Start the frontend

In a separate terminal:

``` powershell
cd D:\codes\AI_Agent_Builder\frontend
npm run dev
```

Open:

`http://localhost:3000`

The chat route uses a query parameter:

`http://localhost:3000/chat?agentId=<agent_id>`

Replace `<agent_id>` with an existing agent ID.

## API Overview

Confirm exact HTTP methods and trailing slashes in FastAPI's `/docs`
page.

  ---------------------------------------------------------------------------------------
  Area                    Endpoint pattern                        Purpose
  ----------------------- --------------------------------------- -----------------------
  Agents                  `/agents/`                              List or create agents

  Agent details           `/agents/{agent_id}`                    Read, update, or delete
                                                                  an agent

  Tools                   `/agents/{agent_id}/tools/`             List or create tools

  Tool details            `/agents/{agent_id}/tools/{tool_id}`    Update or delete a tool

  Knowledge base          `/agents/{agent_id}/knowledge/`         Manage knowledge files

  Knowledge upload        `/agents/{agent_id}/knowledge/upload`   Upload a knowledge
                                                                  document

  Chat                    `/chat`                                 Send a message to an
                                                                  agent

  Chat history            `/chat/{agent_id}/history`              Retrieve saved chat
                                                                  history

  Clear chat              `/chat/{agent_id}/clear`                Clear conversation
                                                                  history

  Chat attachment upload  `/chat/{agent_id}/upload`               Upload and extract a
                                                                  chat attachment
  ---------------------------------------------------------------------------------------

## Supported Documents

  Format           Extension   Typical use
  ---------------- ----------- -----------------------------------
  PDF              `.pdf`      Question papers, reports, manuals
  Word document    `.docx`     Notes and documentation
  Excel workbook   `.xlsx`     Tables and spreadsheet data
  Plain text       `.txt`      Notes and text files

Scanned PDFs that contain images rather than selectable text may not
extract correctly. OCR is not confirmed as implemented. Large documents
may exceed the context or token limits of the selected Gemini model.

## Security and Limitations

-   **Local storage:** Data is stored on the local machine and is not
    automatically synchronized between computers.
-   **API keys:** The current model stores API keys in SQLite. For
    production, use a secret manager or encrypted storage, never expose
    keys in frontend code, and avoid returning keys in API responses.
-   **Authentication:** Do not assume authentication or per-user access
    control is implemented. Add it before allowing multiple users to
    access private agents and files.
-   **File uploads:** Validate type and size, use safe server-side
    filenames, restrict file access, and consider malware scanning.
-   **Privacy:** Document text sent to Gemini is shared with the
    configured AI provider for processing. Upload only documents you are
    authorized to process.
-   **Knowledge retrieval:** If extracted text is added directly to
    prompts, large knowledge bases may use many tokens.
    Retrieval-augmented generation (RAG) with chunking and relevant
    retrieval would scale better.
-   **Tool execution:** Only execute trusted, validated tool
    implementations. Arbitrary user-provided code should not run without
    a secure sandbox.
-   **Gemini quotas:** Requests may fail if the selected model is
    unavailable or the API project's quota is exceeded.
-   **Backups:** Back up the SQLite database and uploaded files together
    if you need to preserve application state.

## Troubleshooting

### Backend will not start

-   Activate the virtual environment.
-   Confirm the terminal is in the `backend` directory.
-   Run `python -m uvicorn main:app --host 127.0.0.1 --port 8000`.
-   Review the traceback for missing packages or import errors.

### Frontend cannot connect

-   Confirm the backend is running on port `8000`.
-   Check the base URL in `frontend/services/api.ts`.
-   Inspect browser developer tools and the backend terminal for CORS or
    request errors.

### File upload fails

-   Confirm the extension is supported.
-   Review the backend terminal for extraction errors.
-   Ensure the upload directory can be created and written.
-   Normalize file extensions to lowercase before validating and
    extracting text.

### Gemini returns a quota or model error

-   Verify the API key and selected model.
-   Check model availability and the API project's quota/billing
    settings.
-   Retry after quota limits reset or select a model available to your
    account.

### Chat shows an invalid agent ID

Use the query-string route format, for example:

`http://localhost:3000/chat?agentId=1`

Replace `1` with an existing agent ID.

## Future Improvements

-   Store attachment metadata separately from visible chat messages.
-   Restore attachment cards reliably when chat history is reloaded.
-   Support multiple files per message.
-   Add streaming responses so text appears as it is generated.
-   Add RAG with chunking and vector search for large knowledge bases.
-   Add authentication and per-user agent ownership.
-   Encrypt API keys and improve secret management.
-   Add automated tests for API routes, extraction, tools, and chat
    behavior.
-   Add Docker and deployment instructions.
-   Add upload limits, OCR for scanned documents, and clearer
    file-processing status.

## License

No license has been specified. Add a `LICENSE` file before distributing
the project publicly.
