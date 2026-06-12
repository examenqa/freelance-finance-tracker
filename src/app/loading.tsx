import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500/80" />
        <p className="text-sm font-mono animate-pulse">Syncing ledger state...</p>
      </div>
    </div>
  );
}
