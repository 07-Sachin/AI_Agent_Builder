"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import {
  Bot,
  File,
  Paperclip,
  Send,
  User,
  X,
} from "lucide-react";

import {
  Agent,
  getAgents,
  sendMessage,
  sendMessageWithAttachment,
} from "@/services/agent.service";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();

  const agentId = searchParams.get("agentId");

  const [agent, setAgent] =
    useState<Agent | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // --------------------------------------------------
  // Load Agent
  // --------------------------------------------------

  useEffect(() => {
    async function loadAgent() {
      try {
        const agents = await getAgents();

        const selected = agents.find(
          (item) =>
            item.id === Number(agentId)
        );

        setAgent(selected ?? null);
      } catch (error) {
        console.error(
          "Failed to load agent:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    if (agentId) {
      loadAgent();
    } else {
      setLoading(false);
    }
  }, [agentId]);

  // --------------------------------------------------
  // Select File
  // --------------------------------------------------

  function handleFileSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".xlsx",
      ".txt",
    ];

    const extension =
      "." +
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      !extension ||
      !allowedExtensions.includes(
        extension
      )
    ) {
      alert(
        "Supported files: PDF, DOCX, XLSX and TXT."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);
  }

  // --------------------------------------------------
  // Remove Selected File
  // --------------------------------------------------

  function removeSelectedFile() {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // --------------------------------------------------
  // Send Message
  // --------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!agent || sending) {
      return;
    }

    if (
      !input.trim() &&
      !selectedFile
    ) {
      return;
    }

    const userMessage =
      input.trim();

    const fileToSend =
      selectedFile;

    // Clear input immediately
    setInput("");

    // Clear selected file
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Show user's message
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: fileToSend
          ? `${
              userMessage ||
              "Analyze this file"
            }\n\n📎 ${
              fileToSend.name
            }`
          : userMessage,
      },
    ]);

    try {
      setSending(true);

      // ----------------------------------------------
      // File Chat
      // ----------------------------------------------

      if (fileToSend) {
        const result =
          await sendMessageWithAttachment(
            agent.id,
            userMessage,
            fileToSend
          );

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              result.response,
          },
        ]);
      }

      // ----------------------------------------------
      // Normal Text Chat
      // ----------------------------------------------

      else {
        const result =
          await sendMessage(
            agent.id,
            userMessage
          );

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              result.response,
          },
        ]);
      }
    } catch (error: any) {
      console.error(
        "Chat failed:",
        error
      );

      console.error(
        "Backend response:",
        error?.response?.data
      );

      const backendMessage =
        error?.response?.data
          ?.detail;

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            typeof backendMessage ===
            "string"
              ? backendMessage
              : "Sorry, I could not process that request. Please check your backend.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-slate-500">
          Loading agent...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Agent Not Found
  // --------------------------------------------------

  if (!agent) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <Bot className="mx-auto h-12 w-12 text-slate-400" />

        <h2 className="mt-4 text-xl font-semibold">
          Agent not found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please open Chat from an existing agent.
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Chat UI
  // --------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex items-center gap-4 border-b p-5">

        <div className="rounded-xl bg-blue-100 p-3">
          <Bot className="h-6 w-6 text-blue-600" />
        </div>

        <div>
          <h1 className="text-lg font-semibold">
            {agent.name}
          </h1>

          <p className="text-sm text-slate-500">
            {agent.provider} ·{" "}
            {agent.model}
          </p>
        </div>

      </div>

      {/* ==================================================
          MESSAGES
      ================================================== */}

      <div className="flex-1 space-y-5 overflow-y-auto p-6">

        {/* Empty Chat */}

        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">

            <Bot className="h-14 w-14 text-blue-500" />

            <h2 className="mt-5 text-xl font-semibold">
              Chat with {agent.name}
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Ask your agent anything or attach a file.
            </p>

          </div>
        )}

        {/* Messages */}

        {messages.map(
          (item, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                item.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              {/* Assistant Icon */}

              {item.role ===
                "assistant" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              )}

              {/* Message */}

              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                  item.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                {item.content}
              </div>

              {/* User Icon */}

              {item.role ===
                "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}

            </div>
          )
        )}

        {/* Thinking */}

        {sending && (
          <div className="flex gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
              Thinking...
            </div>

          </div>
        )}

      </div>

      {/* ==================================================
          INPUT AREA
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        className="border-t p-4"
      >

        {/* Hidden File Input */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.xlsx,.txt"
          className="hidden"
          onChange={
            handleFileSelect
          }
        />

        {/* ==================================================
            SELECTED FILE PREVIEW
        ================================================== */}

        {selectedFile && (
          <div className="mb-3 flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <File className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-medium">
                  {selectedFile.name}
                </p>

                <p className="text-xs text-slate-500">
                  {(
                    selectedFile.size /
                    1024
                  ).toFixed(1)}{" "}
                  KB
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={
                removeSelectedFile
              }
              disabled={sending}
              className="rounded-lg p-2 hover:bg-slate-200 disabled:opacity-50"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* ==================================================
            INPUT ROW
        ================================================== */}

        <div className="flex gap-3">

          {/* Attachment Button */}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={sending}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text Input */}

          <input
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder={
              selectedFile
                ? "Ask something about this file..."
                : `Message ${agent.name}...`
            }
            disabled={sending}
            className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          />

          {/* Send Button */}

          <button
            type="submit"
            disabled={
              sending ||
              (!input.trim() &&
                !selectedFile)
            }
            className="rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </button>

        </div>

      </form>

    </div>
  );
}