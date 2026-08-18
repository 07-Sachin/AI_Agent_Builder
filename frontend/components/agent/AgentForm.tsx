"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createAgent } from "@/services/agent.service";

const agentSchema = z.object({
  name: z
    .string()
    .min(2, "Agent name must contain at least 2 characters")
    .max(100, "Agent name is too long"),

  description: z
    .string()
    .min(5, "Description must contain at least 5 characters")
    .max(500, "Description is too long"),

  provider: z
    .string()
    .min(1, "Select a provider"),

  model: z
    .string()
    .min(1, "Select a model"),

  apiKey: z
    .string()
    .min(1, "API key is required"),

  systemPrompt: z
    .string()
    .min(
      10,
      "System prompt must contain at least 10 characters",
    ),

  temperature: z
    .number()
    .min(0)
    .max(2),

  maxTokens: z
    .number()
    .int()
    .min(100)
    .max(128000),
});

type AgentFormData = z.infer<typeof agentSchema>;

const models: Record<string, string[]> = {
  Gemini: [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-3.6-flash",
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

export default function AgentForm() {
  const router = useRouter();

  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),

    defaultValues: {
      name: "",
      description: "",
      provider: "Gemini",
      model: "gemini-2.5-flash",
      apiKey: "",
      systemPrompt:
        "You are a helpful AI assistant. Answer clearly, accurately and professionally.",
      temperature: 0.7,
      maxTokens: 4096,
    },
  });

  const provider = watch("provider");

  function handleProviderChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedProvider = event.target.value;

    setValue("provider", selectedProvider);

    const firstModel =
      models[selectedProvider]?.[0] ?? "";

    setValue("model", firstModel);
  }

  async function onSubmit(data: AgentFormData) {
    try {
      setSaving(true);

      await createAgent({
        name: data.name,
        description: data.description,
        provider: data.provider,
        model: data.model,
        api_key: data.apiKey,
        system_prompt: data.systemPrompt,
        temperature: data.temperature,
        max_tokens: data.maxTokens,
      });

      router.push("/agents");
    } catch (error) {
      console.error(
        "Failed to create agent:",
        error,
      );

      alert(
        "Failed to create agent. Make sure the backend is running.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="rounded-2xl shadow-sm">

        <CardHeader>
          <div className="flex items-center gap-3">

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <CardTitle className="text-2xl">
                Create AI Agent
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Configure your AI agent and save it.
              </p>
            </div>

          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >

            {/* Agent Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Agent Name
              </label>

              <Input
                id="name"
                placeholder="SQL Expert"
                {...register("name")}
              />

              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <Input
                id="description"
                placeholder="A helpful SQL assistant"
                {...register("description")}
              />

              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Provider + Model */}
            <div className="grid gap-6 md:grid-cols-2">

              <div className="space-y-2">
                <label
                  htmlFor="provider"
                  className="text-sm font-medium"
                >
                  LLM Provider
                </label>

                <select
                  id="provider"
                  value={provider}
                  onChange={handleProviderChange}
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {Object.keys(models).map(
                    (providerName) => (
                      <option
                        key={providerName}
                        value={providerName}
                      >
                        {providerName}
                      </option>
                    ),
                  )}
                </select>

                {errors.provider && (
                  <p className="text-sm text-red-500">
                    {errors.provider.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="model"
                  className="text-sm font-medium"
                >
                  Model
                </label>

                <select
                  id="model"
                  {...register("model")}
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {models[provider]?.map(
                    (model) => (
                      <option
                        key={model}
                        value={model}
                      >
                        {model}
                      </option>
                    ),
                  )}
                </select>

                {errors.model && (
                  <p className="text-sm text-red-500">
                    {errors.model.message}
                  </p>
                )}
              </div>

            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className="text-sm font-medium"
              >
                API Key
              </label>

              <div className="relative">

                <Input
                  id="apiKey"
                  type={
                    showApiKey
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your API key"
                  className="pr-12"
                  {...register("apiKey")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowApiKey(
                      (value) => !value,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

              </div>

              {errors.apiKey && (
                <p className="text-sm text-red-500">
                  {errors.apiKey.message}
                </p>
              )}
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <label
                htmlFor="systemPrompt"
                className="text-sm font-medium"
              >
                System Prompt
              </label>

              <Textarea
                id="systemPrompt"
                rows={7}
                placeholder="You are a helpful AI assistant..."
                {...register("systemPrompt")}
              />

              {errors.systemPrompt && (
                <p className="text-sm text-red-500">
                  {errors.systemPrompt.message}
                </p>
              )}
            </div>

            {/* Temperature + Max Tokens */}
            <div className="grid gap-6 md:grid-cols-2">

              <div className="space-y-2">
                <label
                  htmlFor="temperature"
                  className="text-sm font-medium"
                >
                  Temperature
                </label>

                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  {...register(
                    "temperature",
                    {
                      valueAsNumber: true,
                    },
                  )}
                />

                {errors.temperature && (
                  <p className="text-sm text-red-500">
                    {errors.temperature.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="maxTokens"
                  className="text-sm font-medium"
                >
                  Max Tokens
                </label>

                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="128000"
                  {...register(
                    "maxTokens",
                    {
                      valueAsNumber: true,
                    },
                  )}
                />

                {errors.maxTokens && (
                  <p className="text-sm text-red-500">
                    {errors.maxTokens.message}
                  </p>
                )}
              </div>

            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 border-t pt-6">

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Agent
                  </>
                )}
              </Button>

            </div>

          </form>
        </CardContent>

      </Card>
    </div>
  );
}