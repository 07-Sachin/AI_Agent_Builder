"use client";

import { useEffect, useState } from "react";
import {
  Code2,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";

import {
  createTool,
  deleteTool,
  getTools,
  Tool,
} from "@/services/agent.service";

interface ToolsSectionProps {
  agentId: number;
}

export default function ToolsSection({
  agentId,
}: ToolsSectionProps) {
  const [tools, setTools] =
    useState<Tool[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [code, setCode] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function loadTools() {
    try {
      setLoading(true);

      const data =
        await getTools(agentId);

      setTools(data);
    } catch (error) {
      console.error(
        "Failed to load tools:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTools();
  }, [agentId]);

  async function handleCreateTool() {
    if (
      !name.trim() ||
      !description.trim()
    ) {
      alert(
        "Tool name and description are required.",
      );

      return;
    }

    if (!code.trim()) {
      alert(
        "Please write the Python code for your tool.",
      );

      return;
    }

    try {
      setSaving(true);

      const tool =
        await createTool(
          agentId,
          {
            name: name.trim(),
            description:
              description.trim(),
            code: code.trim(),
            enabled: true,
          },
        );

      setTools((current) => [
        ...current,
        tool,
      ]);

      setName("");
      setDescription("");
      setCode("");

      setShowForm(false);
    } catch (error) {
      console.error(
        "Failed to create tool:",
        error,
      );

      alert(
        "Failed to create tool.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTool(
    toolId: number,
  ) {
    const confirmed =
      window.confirm(
        "Delete this tool?",
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTool(
        agentId,
        toolId,
      );

      setTools((current) =>
        current.filter(
          (tool) =>
            tool.id !== toolId,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to delete tool:",
        error,
      );

      alert(
        "Failed to delete tool.",
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <p className="text-sm text-slate-500">
          Loading tools...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-purple-100 p-3">
            <Wrench className="h-5 w-5 text-purple-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Tools
            </h2>

            <p className="text-sm text-slate-500">
              Give your agent custom capabilities.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(
              (current) =>
                !current,
            )
          }
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />

          Add Tool
        </button>

      </div>

      {/* Create Tool */}

      {showForm && (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-5">

          <div className="mb-5 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-600" />

            <h3 className="font-semibold">
              Create Custom Tool
            </h3>
          </div>

          {/* Name */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-medium">
              Tool Name
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Calculate Discount"
              className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* Description */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Calculate the final price after applying a discount."
              rows={3}
              className="w-full resize-none rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* Code */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-medium">
              Python Code
            </label>

            <p className="mb-2 text-xs text-slate-500">
              Your tool must contain a function
              named <code>run</code>.
            </p>

            <textarea
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value,
                )
              }
              placeholder={`def run(price, discount):
    return price - (price * discount / 100)`}
              rows={12}
              spellCheck={false}
              className="w-full resize-y rounded-xl border bg-slate-950 px-4 py-3 font-mono text-sm text-green-400 outline-none focus:border-blue-500"
            />

          </div>

          {/* Actions */}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleCreateTool
              }
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Tool"}
            </button>

          </div>

        </div>
      )}

      {/* Existing Tools */}

      <div className="mt-6 space-y-3">

        {tools.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">

            <Code2 className="mx-auto h-8 w-8 text-slate-400" />

            <p className="mt-3 text-sm font-medium">
              No custom tools yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Create a tool using Python code.
            </p>

          </div>
        ) : (
          tools.map((tool) => (
            <div
              key={tool.id}
              className="rounded-xl border p-4"
            >

              <div className="flex items-start justify-between">

                <div className="flex gap-3">

                  <div className="rounded-lg bg-slate-100 p-2">
                    <Code2 className="h-5 w-5 text-slate-700" />
                  </div>

                  <div>

                    <h3 className="font-medium">
                      {tool.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {tool.description}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteTool(
                      tool.id,
                    )
                  }
                  className="rounded-lg p-2 hover:bg-red-50"
                  title="Delete tool"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>

              </div>

              <details className="mt-4">

                <summary className="cursor-pointer text-xs font-medium text-blue-600">
                  View Code
                </summary>

                <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-green-400">
                  {tool.code}
                </pre>

              </details>

            </div>
          ))
        )}

      </div>

    </div>
  );
}