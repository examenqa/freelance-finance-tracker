"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, ArrowDownRight, ArrowUpRight, Receipt, Landmark, CalendarRange } from "lucide-react";

export default function OverviewClient({
  startDate,
  endDate,
  incoming,
  gross,
  wht,
  payouts,
  expenses,
  gains,
}: any) {
  const router = useRouter();

  const handleApplyCustom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = fd.get("start") as string;
    const eDate = fd.get("end") as string;
    if (s && eDate) {
      router.push(`/?start=${s}&end=${eDate}`);
    }
  };

  const handlePreset = (preset: string) => {
    const now = new Date();
    // Get IST date safely
    const istString = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const [yearStr, monthStr] = istString.split("-");
    const y = parseInt(yearStr);
    const m = parseInt(monthStr);

    let start = "";
    let end = "";

    if (preset === "current_month") {
      start = `${y}-${monthStr}-01`;
      const endD = new Date(y, m, 0);
      end = `${y}-${monthStr}-${String(endD.getDate()).padStart(2, '0')}`;
    } else if (preset === "ytd") {
      // YTD logic (Indian FY: April 1 to March 31)
      const fyStartYear = m >= 4 ? y : y - 1;
      start = `${fyStartYear}-04-01`;
      end = istString; // YTD ends today
    } else if (preset === "last_fy") {
      // Last Indian FY
      const fyStartYear = m >= 4 ? y - 1 : y - 2;
      start = `${fyStartYear}-04-01`;
      end = `${fyStartYear + 1}-03-31`;
    }

    if (start && end) {
      router.push(`/?start=${start}&end=${end}`);
    }
  };

  const formatMoney = (minorUnits: string) => {
    return (Number(minorUnits) / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD", // System relies on USD as business origin currency
    });
  };

  return (
    <div className="space-y-6">
      {/* ROUTING CONTROLS (NO REACT STATE FOR DATE BOUNDS) */}
      <div className="flex flex-col md:flex-row gap-6 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        
        {/* PRESETS */}
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-slate-400 mr-2" />
          <button 
            onClick={() => handlePreset("current_month")}
            className="rounded bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-100 transition-colors"
          >
            Current Month
          </button>
          <button 
            onClick={() => handlePreset("ytd")}
            className="rounded bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-100 transition-colors"
          >
            FY YTD
          </button>
          <button 
            onClick={() => handlePreset("last_fy")}
            className="rounded bg-slate-600/20 hover:bg-slate-600/40 border border-slate-500/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors"
          >
            Last FY
          </button>
        </div>

        <div className="hidden md:block w-px bg-white/10" />

        {/* CUSTOM BOUNDARY FORM */}
        <form onSubmit={handleApplyCustom} className="flex items-center gap-3">
          <input
            name="start"
            type="date"
            defaultValue={startDate}
            className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-indigo-400 [color-scheme:dark]"
            required
          />
          <span className="text-slate-500 text-xs">to</span>
          <input
            name="end"
            type="date"
            defaultValue={endDate}
            className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-indigo-400 [color-scheme:dark]"
            required
          />
          <button 
            type="submit"
            className="rounded bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* GAINS (MAIN KPI) */}
        <div className="col-span-full rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <TrendingUp className="h-24 w-24 text-emerald-400" />
          </div>
          <div className="relative z-10">
            <h2 className="text-lg font-medium text-emerald-100 flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Agency Gains
            </h2>
            <p className="mt-2 text-5xl font-bold tracking-tight text-white drop-shadow-sm">
              {formatMoney(gains)}
            </p>
            <p className="mt-2 text-sm text-emerald-200/70">
              Net Incoming minus Payouts and Expenses <span className="text-emerald-400/50 block mt-1">{startDate} through {endDate}</span>
            </p>
          </div>
        </div>

        {/* INCOMING */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-medium text-white">Incoming (Net)</h2>
          </div>
          <p className="text-3xl font-semibold text-white">{formatMoney(incoming)}</p>
          <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Gross Billed:</span>
              <span className="font-mono">{formatMoney(gross)}</span>
            </div>
            <div className="flex justify-between">
              <span>WHT Deducted:</span>
              <span className="font-mono text-red-300">{formatMoney(wht)}</span>
            </div>
          </div>
        </div>

        {/* PAYOUTS */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-medium text-white">Settled Payouts</h2>
          </div>
          <p className="text-3xl font-semibold text-white">{formatMoney(payouts)}</p>
          <p className="mt-2 text-xs text-slate-400">Total payments transferred to employees</p>
        </div>

        {/* EXPENSES */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-rose-400" />
            <h2 className="text-lg font-medium text-white">Expenses</h2>
          </div>
          <p className="text-3xl font-semibold text-white">{formatMoney(expenses)}</p>
          <p className="mt-2 text-xs text-slate-400">Total agency operational costs</p>
        </div>

      </div>
    </div>
  );
}
