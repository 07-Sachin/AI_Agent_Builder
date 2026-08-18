"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react";

import { Agent, getAgent, updateAgent } from "@/services/agent.service";

const models: Record<string, string[]> = {
  Gemini: [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
  ],
  OpenAI: [
    "gpt-5",
    "gpt-5-mini",
  ],
  Anthropic: [
    "claude-sonnet-4",
    "claude-opus-4",
  ],
  Groq: [
    "llama-3.3-70b-versatile",
  ],
  OpenRouter: [
    "openai/gpt-5",
    "google/gemini-2.5-flash",
  ],
};

export default function EditAgentPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    provider: "Gemini",
    model: "gemini-3.6-flash",
    api_key: "",
    system_prompt: "",
    temperature: 0.7,
    max_tokens: 4096,
  });

  useEffect(() => {
    async function loadAgent() {
      try {
        const data = await getAgent(id);

        setAgent(data);

        setForm({
          name: data.name,
          description: data.description,
          provider: data.provider,
          model: data.model,
          api_key: "",
          system_prompt: data.system_prompt,
          temperature: data.temperature,
          max_tokens: data.max_tokens,
        });
      } catch (error) {
        console.error("Failed to load agent:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadAgent();
    }
  }, [id]);

  function handleProviderChange(
    value: string
  ) {
    setForm((current) => ({
      ...current,
      provider: value,
      model: models[value]?.[0] ?? "",
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!agent) {
      return;
    }

    try {
      setSaving(true);

      await updateAgent(agent.id, {
        name: form.name,
        description: form.description,
        provider: form.provider,
        model: form.model,

        // If API key is left blank, keep the existing key.
        api_key: form.api_key.trim() || undefined,

        system_prompt: form.system_prompt,
        temperature: form.temperature,
        max_tokens: form.max_tokens,
      });

      alert("Agent updated successfully.");

      router.push("/agents");
    } catch (error) {
      console.error("Failed to update agent:", error);

      alert(
        "Failed to update agent. Please check the backend."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading agent...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-8">
        Agent not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">

      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Agent
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update your agent configuration.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Agent Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              required
              rows={3}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Provider + Model */}
          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Provider
              </label>

              <select
                value={form.provider}
                onChange={(e) =>
                  handleProviderChange(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              >
                {Object.keys(models).map((provider) => (
                  <option
                    key={provider}
                    value={provider}
                  >
                    {provider}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Model
              </label>

              <select
                value={form.model}
                onChange={(e) =>
                  setForm({
                    ...form,
                    model: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              >
                {(models[form.provider] ?? []).map(
                  (model) => (
                    <option
                      key={model}
                      value={model}
                    >
                      {model}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

          {/* API Key */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              API Key
            </label>

            <div className="relative">

              <input
                type={showApiKey ? "text" : "password"}
                value={form.api_key}
                onChange={(e) =>
                  setForm({
                    ...form,
                    api_key: e.target.value,
                  })
                }
                placeholder="Leave blank to keep current API key"
                className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowApiKey(!showApiKey)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showApiKey ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              Leave this empty if you don't want to change the API key.
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              System Prompt
            </label>

            <textarea
              value={form.system_prompt}
              onChange={(e) =>
                setForm({
                  ...form,
                  system_prompt: e.target.value,
                })
              }
              required
              rows={6}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Temperature + Tokens */}
          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Temperature
              </label>

              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={form.temperature}
                onChange={(e) =>
                  setForm({
                    ...form,
                    temperature: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Max Tokens
              </label>

              <input
                type="number"
                min="100"
                max="128000"
                value={form.max_tokens}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_tokens: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-6">

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border px-5 py-3 text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}