"use client";

interface ProviderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const providers = [
  "Google Gemini",
  "OpenAI",
  "Anthropic",
  "Groq",
  "Mistral",
  "OpenRouter",
];

export default function ProviderSelect({
  value,
  onChange,
}: ProviderSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        LLM Provider
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border p-3"
      >
        {providers.map((provider) => (
          <option key={provider}>
            {provider}
          </option>
        ))}
      </select>
    </div>
  );
}