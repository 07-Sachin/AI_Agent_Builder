"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PromptEditor({
  value,
  onChange,
}: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        System Prompt
      </label>

      <textarea
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="You are a helpful AI assistant..."
        className="w-full rounded-lg border p-3 resize-none"
      />
    </div>
  );
}