CREATE TYPE "public"."payout_status" AS ENUM('unpaid', 'paid');--> statement-breakpoint
CREATE TYPE "public"."rcm_ledger_status" AS ENUM('unpaid', 'paid');--> statement-breakpoint
CREATE TYPE "public"."rcm_reference_type" AS ENUM('transaction', 'expense');--> statement-breakpoint
CREATE TYPE "public"."time_entry_status" AS ENUM('pending', 'billed');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'settled', 'failed');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"billed_rate" bigint NOT NULL,
	"currency" text NOT NULL,
	"is_upwork" boolean DEFAULT false NOT NULL,
	"wht_rate" numeric(5, 4) DEFAULT '0.0000' NOT NULL,
	CONSTRAINT "contracts_billed_rate_positive" CHECK ("contracts"."billed_rate" > 0)
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"base_rate" bigint NOT NULL,
	CONSTRAINT "employees_base_rate_non_negative" CHECK ("employees"."base_rate" >= 0)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"amount" bigint NOT NULL,
	"is_rcm_applicable" boolean DEFAULT false NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	CONSTRAINT "expenses_amount_non_negative" CHECK ("expenses"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "gst_rcm_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reference_type" "rcm_reference_type" NOT NULL,
	"reference_id" uuid NOT NULL,
	"base_amount" bigint NOT NULL,
	"rcm_liability" bigint NOT NULL,
	"status" "rcm_ledger_status" DEFAULT 'unpaid' NOT NULL,
	"cleared_at" date,
	CONSTRAINT "gst_rcm_ledger_base_amount_non_negative" CHECK ("gst_rcm_ledger"."base_amount" >= 0),
	CONSTRAINT "gst_rcm_ledger_liability_non_negative" CHECK ("gst_rcm_ledger"."rcm_liability" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"transaction_id" uuid,
	"amount" bigint NOT NULL,
	"status" "payout_status" DEFAULT 'unpaid' NOT NULL,
	"paid_date" date,
	CONSTRAINT "payouts_amount_non_negative" CHECK ("payouts"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "recurring_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"amount" bigint NOT NULL,
	"category" text NOT NULL,
	CONSTRAINT "recurring_expenses_amount_non_negative" CHECK ("recurring_expenses"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"transaction_id" uuid,
	"week_start" date NOT NULL,
	"hours" numeric(10, 2) NOT NULL,
	"status" time_entry_status DEFAULT 'pending' NOT NULL,
	CONSTRAINT "time_entries_hours_positive" CHECK ("time_entries"."hours" > 0)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"gross_amount" bigint NOT NULL,
	"service_charge" bigint NOT NULL,
	"wht" bigint DEFAULT 0 NOT NULL,
	"net_payout" bigint NOT NULL,
	"expected_amount" bigint DEFAULT 0 NOT NULL,
	"source_currency" text NOT NULL,
	"target_currency" text NOT NULL,
	"exchange_rate" bigint NOT NULL,
	"status" "transaction_status" DEFAULT 'settled' NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_gross_amount_non_negative" CHECK ("transactions"."gross_amount" >= 0),
	CONSTRAINT "transactions_service_charge_non_negative" CHECK ("transactions"."service_charge" >= 0),
	CONSTRAINT "transactions_wht_non_negative" CHECK ("transactions"."wht" >= 0),
	CONSTRAINT "transactions_net_payout_non_negative" CHECK ("transactions"."net_payout" >= 0),
	CONSTRAINT "transactions_exchange_rate_positive" CHECK ("transactions"."exchange_rate" > 0)
);
--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clients_user_id_idx" ON "clients" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clients_user_name_unique" ON "clients" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "contracts_user_id_idx" ON "contracts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "employees_user_id_idx" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "expenses_user_id_idx" ON "expenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gst_rcm_ledger_user_id_idx" ON "gst_rcm_ledger" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gst_rcm_ledger_reference_idx" ON "gst_rcm_ledger" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gst_rcm_ledger_reference_unique" ON "gst_rcm_ledger" USING btree ("user_id","reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "payouts_user_id_idx" ON "payouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recurring_expenses_user_id_idx" ON "recurring_expenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sources_user_id_idx" ON "sources" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "time_entries_user_id_idx" ON "time_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_client_id_idx" ON "transactions" USING btree ("client_id");