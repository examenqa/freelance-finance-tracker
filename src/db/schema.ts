import {
  bigint,
  boolean,
  check,
  decimal,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const transactionStatus = pgEnum("transaction_status", [
  "pending",
  "settled",
  "failed",
]);

export const rcmLedgerStatus = pgEnum("rcm_ledger_status", [
  "unpaid",
  "paid",
]);

export const rcmReferenceType = pgEnum("rcm_reference_type", [
  "transaction",
  "expense",
]);

export const timeEntryStatus = pgEnum("time_entry_status", [
  "pending",
  "billed",
]);

export const payoutStatus = pgEnum("payout_status", [
  "unpaid",
  "paid",
]);

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    userIdx: index("sources_user_id_idx").on(table.userId),
  }),
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    userIdx: index("clients_user_id_idx").on(table.userId),
    userNameUnique: uniqueIndex("clients_user_name_unique").on(
      table.userId,
      table.name,
    ),
  }),
);

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "restrict" }),
    billedRate: bigint("billed_rate", { mode: "bigint" }).notNull(),
    currency: text("currency").notNull(),
    isUpwork: boolean("is_upwork").notNull().default(false),
    whtRate: decimal("wht_rate", { precision: 5, scale: 4 })
      .notNull()
      .default("0.0000"),
  },
  (table) => ({
    userIdx: index("contracts_user_id_idx").on(table.userId),
    billedRatePositive: check("contracts_billed_rate_positive", sql`${table.billedRate} > 0`),
  }),
);

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    baseRate: bigint("base_rate", { mode: "bigint" }).notNull(),
  },
  (table) => ({
    userIdx: index("employees_user_id_idx").on(table.userId),
    baseRateNonNegative: check("employees_base_rate_non_negative", sql`${table.baseRate} >= 0`),
  }),
);

export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "restrict" }),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "restrict" }),
    transactionId: uuid("transaction_id")
      .references(() => transactions.id, { onDelete: "set null" }),
    weekStart: date("week_start", { mode: "string" }).notNull(),
    hours: decimal("hours", { precision: 10, scale: 2 }).notNull(),
    status: timeEntryStatus("status").notNull().default("pending"),
  },
  (table) => ({
    userIdx: index("time_entries_user_id_idx").on(table.userId),
    hoursPositive: check("time_entries_hours_positive", sql`${table.hours} > 0`),
  }),
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    grossAmount: bigint("gross_amount", { mode: "bigint" }).notNull(),
    platformFee: bigint("platform_fee", { mode: "bigint" }).notNull().default(sql`0`),
    serviceCharge: bigint("service_charge", { mode: "bigint" }).notNull().default(sql`0`),
    conversionFee: bigint("conversion_fee", { mode: "bigint" }).notNull().default(sql`0`),
    wht: bigint("wht", { mode: "bigint" }).notNull().default(sql`0`),
    netPayout: bigint("net_payout", { mode: "bigint" }).notNull(),
    expectedAmount: bigint("expected_amount", { mode: "bigint" }).notNull().default(sql`0`),
    sourceCurrency: text("source_currency").notNull(),
    targetCurrency: text("target_currency").notNull(),
    exchangeRate: bigint("exchange_rate", { mode: "bigint" }).notNull(),
    status: transactionStatus("status").notNull().default("settled"),
    createdAt: date("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("transactions_user_id_idx").on(table.userId),
    clientIdx: index("transactions_client_id_idx").on(table.clientId),
    grossNonNegative: check("transactions_gross_amount_non_negative", sql`${table.grossAmount} >= 0`),
    platformFeeNonNegative: check("transactions_platform_fee_non_negative", sql`${table.platformFee} >= 0`),
    serviceChargeNonNegative: check("transactions_service_charge_non_negative", sql`${table.serviceCharge} >= 0`),
    conversionFeeNonNegative: check("transactions_conversion_fee_non_negative", sql`${table.conversionFee} >= 0`),
    whtNonNegative: check("transactions_wht_non_negative", sql`${table.wht} >= 0`),
    netPayoutNonNegative: check("transactions_net_payout_non_negative", sql`${table.netPayout} >= 0`),
    exchangeRatePositive: check("transactions_exchange_rate_positive", sql`${table.exchangeRate} > 0`),
  }),
);

export const payouts = pgTable(
  "payouts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "restrict" }),
    transactionId: uuid("transaction_id")
      .references(() => transactions.id, { onDelete: "set null" }),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    status: payoutStatus("status").notNull().default("unpaid"),
    paidDate: date("paid_date", { mode: "string" }),
  },
  (table) => ({
    userIdx: index("payouts_user_id_idx").on(table.userId),
    amountNonNegative: check("payouts_amount_non_negative", sql`${table.amount} >= 0`),
  }),
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    isRcmApplicable: boolean("is_rcm_applicable").notNull().default(false),
    createdAt: date("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("expenses_user_id_idx").on(table.userId),
    amountNonNegative: check("expenses_amount_non_negative", sql`${table.amount} >= 0`),
  }),
);

export const recurringExpenses = pgTable(
  "recurring_expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    category: text("category").notNull(),
  },
  (table) => ({
    userIdx: index("recurring_expenses_user_id_idx").on(table.userId),
    amountNonNegative: check("recurring_expenses_amount_non_negative", sql`${table.amount} >= 0`),
  }),
);

export const gstRcmLedger = pgTable(
  "gst_rcm_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    referenceType: rcmReferenceType("reference_type").notNull(),
    referenceId: uuid("reference_id").notNull(),
    baseAmount: bigint("base_amount", { mode: "bigint" }).notNull(),
    rcmLiability: bigint("rcm_liability", { mode: "bigint" }).notNull(),
    status: rcmLedgerStatus("status").notNull().default("unpaid"),
    clearedAt: date("cleared_at", { mode: "string" }),
  },
  (table) => ({
    userIdx: index("gst_rcm_ledger_user_id_idx").on(table.userId),
    referenceIdx: index("gst_rcm_ledger_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
    uniqueReference: uniqueIndex("gst_rcm_ledger_reference_unique").on(
      table.userId,
      table.referenceType,
      table.referenceId,
    ),
    baseAmountNonNegative: check("gst_rcm_ledger_base_amount_non_negative", sql`${table.baseAmount} >= 0`),
    liabilityNonNegative: check("gst_rcm_ledger_liability_non_negative", sql`${table.rcmLiability} >= 0`),
  }),
);

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  contracts: many(contracts),
  transactions: many(transactions),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  client: one(clients, {
    fields: [contracts.clientId],
    references: [clients.id],
  }),
  source: one(sources, {
    fields: [contracts.sourceId],
    references: [sources.id],
  }),
  timeEntries: many(timeEntries),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
  timeEntries: many(timeEntries),
  payouts: many(payouts),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  client: one(clients, {
    fields: [transactions.clientId],
    references: [clients.id],
  }),
  payouts: many(payouts),
  timeEntries: many(timeEntries),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  employee: one(employees, {
    fields: [payouts.employeeId],
    references: [employees.id],
  }),
  transaction: one(transactions, {
    fields: [payouts.transactionId],
    references: [transactions.id],
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  employee: one(employees, {
    fields: [timeEntries.employeeId],
    references: [employees.id],
  }),
  contract: one(contracts, {
    fields: [timeEntries.contractId],
    references: [contracts.id],
  }),
  transaction: one(transactions, {
    fields: [timeEntries.transactionId],
    references: [transactions.id],
  }),
}));

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type NewRecurringExpense = typeof recurringExpenses.$inferInsert;
export type GstRcmLedger = typeof gstRcmLedger.$inferSelect;
export type NewGstRcmLedger = typeof gstRcmLedger.$inferInsert;
