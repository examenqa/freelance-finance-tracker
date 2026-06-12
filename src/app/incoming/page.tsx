import { db } from "@/db";
import { employees, contracts, clients, timeEntries, sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import IncomingClient from "./IncomingClient";

export const dynamic = "force-dynamic";

export default async function IncomingPage() {
  const allContracts = await db.select().from(contracts);
  const allClients = await db.select().from(clients);
  const allSources = await db.select().from(sources);
  const allEmployees = await db.select().from(employees);
  
  // Only fetch pending time entries for the queue
  const pendingEntries = await db.select().from(timeEntries).where(eq(timeEntries.status, "pending"));

  const populatedEntries = pendingEntries.map((te) => {
    const contract = allContracts.find((c) => c.id === te.contractId);
    const client = allClients.find((c) => c.id === contract?.clientId);
    const source = allSources.find((s) => s.id === contract?.sourceId);
    const employee = allEmployees.find((e) => e.id === te.employeeId);

    return {
      ...te,
      employeeName: employee?.name || "Unknown",
      clientName: client?.name || "Unknown",
      sourceName: source?.name || "Unknown",
      currency: contract?.currency || "USD",
      billedRate: contract?.billedRate || 0n,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-6 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Incoming Payments</h1>
          <p className="text-sm text-slate-400 mt-1">Batch pending time entries into received transactions</p>
        </header>

        <IncomingClient timeEntries={populatedEntries} />
      </div>
    </div>
  );
}
