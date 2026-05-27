"use client";

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-emerald-700"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        const btn = document.activeElement as HTMLButtonElement;
        if (btn) {
          btn.textContent = "\u00a1Copiado!";
          setTimeout(() => {
            btn.textContent = "Copiar";
          }, 2000);
        }
      }}
      type="button"
    >
      Copiar
    </button>
  );
}
