import React, { useState } from "react";

interface ClientsInputProps {
  value: string[];
  onChange: (clients: string[]) => void;
  disabled?: boolean;
}

export default function ClientsInput({ value, onChange, disabled }: ClientsInputProps) {
  const [input, setInput] = useState("");

  function handleAdd() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput("");
    }
  }

  function handleRemove(client: string) {
    onChange(value.filter((c) => c !== client));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((client) => (
          <span key={client} className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded">
            {client}
            {!disabled && (
              <button type="button" className="ml-2 text-xs text-red-600" onClick={() => handleRemove(client)}>
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            className="border rounded px-2 py-1 flex-1"
            placeholder="Adicionar cliente"
            disabled={disabled}
          />
          <button type="button" className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleAdd} disabled={disabled || !input.trim()}>
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}
