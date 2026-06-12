alter table public.clients enable row level security;
alter table public.clients force row level security;

alter table public.transactions enable row level security;
alter table public.transactions force row level security;

alter table public.expenses enable row level security;
alter table public.expenses force row level security;

alter table public.gst_rcm_ledger enable row level security;
alter table public.gst_rcm_ledger force row level security;

create or replace function public.prevent_financial_immutable_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Financial records are immutable';
end;
$$;

drop trigger if exists transactions_immutable on public.transactions;
create trigger transactions_immutable
before update or delete on public.transactions
for each row execute function public.prevent_financial_immutable_update();

drop trigger if exists expenses_immutable on public.expenses;
create trigger expenses_immutable
before update or delete on public.expenses
for each row execute function public.prevent_financial_immutable_update();

create or replace function public.prevent_rcm_ledger_amount_update()
returns trigger
language plpgsql
as $$
begin
  if old.user_id <> new.user_id
    or old.reference_type <> new.reference_type
    or old.reference_id <> new.reference_id
    or old.base_amount <> new.base_amount
    or old.rcm_liability <> new.rcm_liability then
    raise exception 'RCM ledger reference and amounts are immutable';
  end if;

  return new;
end;
$$;

drop trigger if exists gst_rcm_ledger_amounts_immutable on public.gst_rcm_ledger;
create trigger gst_rcm_ledger_amounts_immutable
before update on public.gst_rcm_ledger
for each row execute function public.prevent_rcm_ledger_amount_update();

drop policy if exists clients_select_own on public.clients;
create policy clients_select_own
on public.clients
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists clients_insert_own on public.clients;
create policy clients_insert_own
on public.clients
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists clients_update_own on public.clients;
create policy clients_update_own
on public.clients
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own
on public.transactions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists transactions_insert_own on public.transactions;
create policy transactions_insert_own
on public.transactions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.clients c
    where c.id = client_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists expenses_select_own on public.expenses;
create policy expenses_select_own
on public.expenses
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists expenses_insert_own on public.expenses;
create policy expenses_insert_own
on public.expenses
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists gst_rcm_ledger_select_own on public.gst_rcm_ledger;
create policy gst_rcm_ledger_select_own
on public.gst_rcm_ledger
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists gst_rcm_ledger_insert_own on public.gst_rcm_ledger;
create policy gst_rcm_ledger_insert_own
on public.gst_rcm_ledger
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    (
      reference_type = 'transaction'
      and exists (
        select 1
        from public.transactions t
        where t.id = reference_id
          and t.user_id = auth.uid()
      )
    )
    or
    (
      reference_type = 'expense'
      and exists (
        select 1
        from public.expenses e
        where e.id = reference_id
          and e.user_id = auth.uid()
      )
    )
  )
);

drop policy if exists gst_rcm_ledger_mark_paid_own on public.gst_rcm_ledger;
create policy gst_rcm_ledger_mark_paid_own
on public.gst_rcm_ledger
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and status = 'paid'
  and cleared_at is not null
);
