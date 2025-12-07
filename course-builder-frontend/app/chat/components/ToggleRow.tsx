// app/chat/components/ToggleRow.tsx
"use client";

interface ToggleRowProps {
  label: string;
  value: boolean | null;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

export default function ToggleRow({
  label,
  value,
  disabled,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-slate-950/60 px-3 py-2.5">
      <span className="text-xs text-slate-200">{label}</span>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={`rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-wide transition
            ${
              value === true
                ? "bg-emerald-500 text-slate-900"
                : "bg-slate-900 text-emerald-100/80 border border-emerald-500/20 hover:bg-slate-800"
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Yes
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={`rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-wide transition
            ${
              value === false
                ? "bg-rose-500 text-white"
                : "bg-slate-900 text-rose-100/80 border border-rose-500/20 hover:bg-slate-800"
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          No
        </button>
      </div>
    </div>
  );
}
