import { db } from "@/db";
import { transactions, payouts, expenses } from "@/db/schema";
import { sql, between } from "drizzle-orm";
import OverviewClient from "./OverviewClient";

export const dynamic = "force-dynamic";

function getCurrentISTMonthBoundaries() {
  const now = new Date();
  const istString = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  
  const [year, month] = istString.split("-");
  const start = `${year}-${month}-01`;
  
  // Calculate the last day of the current IST month
  const endDateObj = new Date(parseInt(year), parseInt(month), 0);
  const end = `${year}-${month}-${String(endDateObj.getDate()).padStart(2, '0')}`;
  
  return { start, end };
}

export default async function OverviewPage({ searchParams }: { searchParams: { start?: string, end?: string } }) {
  let { start, end } = searchParams;
  
  if (!start || !end) {
    const boundaries = getCurrentISTMonthBoundaries();
    start = boundaries.start;
    end = boundaries.end;
  }

  // Parallel Execution & Lexical Date Boundaries
  const [txData, payoutData, expData] = await Promise.all([
    db
      .select({
        totalIncoming: sql<string>`COALESCE(SUM(${transactions.netPayout}), '0')`,
        totalGross: sql<string>`COALESCE(SUM(${transactions.grossAmount}), '0')`,
        totalWht: sql<string>`COALESCE(SUM(${transactions.wht}), '0')`,
      })
      .from(transactions)
      .where(between(transactions.createdAt, start, end)),
      
    db
      .select({
        totalPayouts: sql<string>`COALESCE(SUM(${payouts.amount}), '0')`,
      })
      .from(payouts)
      .where(between(payouts.paidDate, start, end)),

    db
      .select({
        totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), '0')`,
      })
      .from(expenses)
      .where(between(expenses.createdAt, start, end))
  ]);

  // BigInt Type Casting & Zero-State Handling
  const incoming = BigInt(txData[0]?.totalIncoming || "0");
  const gross = BigInt(txData[0]?.totalGross || "0");
  const wht = BigInt(txData[0]?.totalWht || "0");
  const employeePayouts = BigInt(payoutData[0]?.totalPayouts || "0");
  const agencyExpenses = BigInt(expData[0]?.totalExpenses || "0");

  const agencyGains = incoming - employeePayouts - agencyExpenses;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-6 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Agency Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Financial aggregations and performance metrics.</p>
        </header>

        <OverviewClient 
          startDate={start}
          endDate={end}
          incoming={incoming.toString()}
          gross={gross.toString()}
          wht={wht.toString()}
          payouts={employeePayouts.toString()}
          expenses={agencyExpenses.toString()}
          gains={agencyGains.toString()}
        />
      </div>
    </div>
  );
}
