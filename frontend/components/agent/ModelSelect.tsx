"use client";

interface Props {
  provider: string;
  value: string;
  onChange: (value: string) => void;
}

const models: Record<string, string[]> = {
  "Google Gemini": [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
  ],
  OpenAI: [
    "gpt-5",
    "gpt-5-mini",
  ],
  Anthropic: [
    "claude-sonnet-4",
  ],
  Groq: [
    "llama-3.3-70b",
  ],
};

export default function ModelSelect({
  provider,
  value,
  onChange,
}: Props) {
  const providerModels = models[provider] ?? [];

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Model
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border p-3"
      >
        {providerModels.map((model) => (
          <option key={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
}