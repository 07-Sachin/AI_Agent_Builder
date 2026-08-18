"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  deleteKnowledgeFile,
  getKnowledgeFiles,
  KnowledgeFile,
  uploadKnowledgeFile,
} from "@/services/agent.service";

interface KnowledgeBaseProps {
  agentId: number | null;
}

function getFileIcon(fileType: string) {
  if (fileType === "XLSX") {
    return FileSpreadsheet;
  }

  return FileText;
}

export default function KnowledgeBase({
  agentId,
}: KnowledgeBaseProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadFiles() {
    if (!agentId) {
      return;
    }

    try {
      setLoading(true);

      const data = await getKnowledgeFiles(agentId);

      setFiles(data);
    } catch (error) {
      console.error(
        "Failed to load knowledge files:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, [agentId]);

  async function handleFileUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    if (!agentId) {
      return;
    }

    const selectedFiles = event.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    try {
      setUploading(true);

      for (const file of Array.from(selectedFiles)) {
        const uploaded = await uploadKnowledgeFile(
          agentId,
          file,
        );

        setFiles((current) => [
          uploaded,
          ...current,
        ]);
      }

    } catch (error: any) {
      console.error(
        "Knowledge upload failed:",
        error,
      );

      console.error(
        "Backend response:",
        error?.response?.data,
      );

      const detail =
        error?.response?.data?.detail;

      alert(
        typeof detail === "string"
          ? detail
          : "Upload failed. Check the backend terminal.",
      );
    
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleDelete(
    fileId: number,
  ) {
    if (!agentId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this knowledge file?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteKnowledgeFile(
        agentId,
        fileId,
      );

      setFiles((current) =>
        current.filter(
          (file) => file.id !== fileId,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to delete knowledge file:",
        error,
      );

      alert(
        "Failed to delete knowledge file.",
      );
    }
  }

  return (
    <Card className="mt-6 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Knowledge Base
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Upload company documents that your agent
          can use when answering questions.
        </p>
      </CardHeader>

      <CardContent>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />

        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          disabled={!agentId || uploading}
          className="w-full rounded-2xl border-2 border-dashed p-10 text-center transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
          )}

          <p className="mt-4 font-medium">
            {uploading
              ? "Uploading..."
              : "Upload Knowledge Files"}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            PDF • DOCX • XLSX • TXT
          </p>
        </button>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">
              Uploaded Files
            </h3>

            <span className="text-sm text-muted-foreground">
              {files.length} file
              {files.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading files...
              </span>
            </div>
          ) : files.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 font-medium">
                No knowledge files
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Upload company policies, documents,
                spreadsheets or text files.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => {
                const Icon = getFileIcon(
                  file.file_type,
                );

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon className="h-6 w-6 shrink-0" />

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {file.original_filename}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {file.file_type}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDelete(file.id)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}