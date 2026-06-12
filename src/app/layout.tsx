import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, Briefcase, ArrowDownToLine, ArrowUpFromLine, Receipt, Settings } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Examen Ledger",
  description: "Agency financial aggregations and performance metrics.",
};

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Work", href: "/work", icon: Briefcase },
  { name: "Incoming", href: "/incoming", icon: ArrowDownToLine },
  { name: "Payouts", href: "/payouts", icon: ArrowUpFromLine },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Setup", href: "/setup", icon: Settings },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 flex h-screen overflow-hidden`}>
        
        {/* Persistent Sidebar */}
        <aside className="w-64 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col h-full shrink-0">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-bold tracking-tight text-white">Examen Ledger</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors text-sm font-medium text-slate-300 hover:text-white"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-white/10 text-xs font-mono text-slate-500 text-center">
            IST Boundary Enforced
          </div>
        </aside>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto relative z-0">
          {/* Subtle radial gradient to match the Setup UI */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />
          <div className="p-8">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}
