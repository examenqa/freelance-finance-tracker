import { db } from "@/db";
import { payouts, employees, transactions, clients } from "@/db/schema";
import PayoutsClient from "./PayoutsClient";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const allEmployees = await db.select().from(employees);
  const allClients = await db.select().from(clients);
  const allTransactions = await db.select().from(transactions);
  
  const allPayouts = await db.select().from(payouts);

  // Hydrate data for the UI
  const populatedPayouts = allPayouts.map((p) => {
    const employee = allEmployees.find(e => e.id === p.employeeId);
    let transactionDesc = "No linked transaction";
    
    if (p.transactionId) {
      const tx = allTransactions.find(t => t.id === p.transactionId);
      if (tx) {
        const client = allClients.find(c => c.id === tx.clientId);
        transactionDesc = `Tx generated ${tx.createdAt} (${client?.name || 'Unknown'})`;
      }
    }

    return {
      ...p,
      employeeName: employee?.name || "Unknown",
      transactionDesc,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-6 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Employee Payouts</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and reconcile unpaid and settled payouts.</p>
        </header>

        <PayoutsClient payouts={populatedPayouts} />
      </div>
    </div>
  );
}
