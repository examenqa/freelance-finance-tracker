import { db } from "@/db";
import { expenses, recurringExpenses } from "@/db/schema";
import ExpensesClient from "./ExpensesClient";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const allTemplates = await db.select().from(recurringExpenses);
  const allExpenses = await db.select().from(expenses);

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-6 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Expenses Ledger</h1>
          <p className="text-sm text-slate-400 mt-1">Manage recurring templates and instantiated monthly logs</p>
        </header>

        <ExpensesClient templates={allTemplates} ledgers={allExpenses} />
      </div>
    </div>
  );
}
