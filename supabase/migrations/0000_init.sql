-- ============================================================================
-- NUESTRO MONEY — Initial schema
-- ============================================================================
-- A private shared-account app for a couple.
--
-- Money rule enforced at the database level:
--   SALDO = SUM(income) − SUM(expense)
--   An expense can never push the balance below zero.
--
-- Audit rule:
--   created_by / updated_by hold the acting user id ONLY for audit.
--   No balance, report or statistic uses them to split money.
-- ============================================================================

-- Enable extensions ----------------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles extend auth.users ------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  currency text not null default 'EUR' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A couple = one shared economy --------------------------------------------
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Nuestro Money',
  currency text not null default 'EUR' check (char_length(currency) = 3),
  invite_code text unique,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Membership: exactly ONE couple per user, max 2 members per couple ---------
create table public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  constraint couple_members_couple_user_unique unique (couple_id, user_id),
  constraint couple_members_user_unique unique (user_id)
);

-- Reference categories (mirrors src/config/constants.ts) --------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  key text not null,
  label text not null,
  icon text not null,
  color text not null,
  sort_order int not null default 0,
  constraint categories_type_key_unique unique (type, key)
);

-- Transactions: the heart of the shared account ----------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount > 0),
  category text not null,
  description text not null default '',
  date date not null default current_date,
  note text,
  -- Audit columns: NEVER used to split money.
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz,
  -- Soft delete: keeps a full audit trail.
  deleted_at timestamptz
);

create index transactions_couple_date_idx on public.transactions (couple_id, date desc);
create index transactions_couple_type_idx on public.transactions (couple_id, type);
create index transactions_couple_category_idx on public.transactions (couple_id, category);
create index transactions_couple_active_idx on public.transactions (couple_id, deleted_at);

-- Budgets: virtual monthly caps. NEVER modify the balance -------------------
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  category text not null,
  limit_amount bigint not null check (limit_amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_couple_category_unique unique (couple_id, category)
);

-- Savings goals: virtual allocations. NEVER create money. -------------------
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  name text not null,
  target_amount bigint not null check (target_amount > 0),
  current_amount bigint not null default 0 check (current_amount >= 0),
  target_date date,
  icon text,
  color text,
  -- Audit columns.
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz,
  constraint savings_goals_progress_sane check (current_amount <= target_amount)
);

create index savings_goals_couple_idx on public.savings_goals (couple_id);

-- Notifications: couple-scoped, user-scoped or couple-wide ------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid references public.profiles (id), -- null = couple-wide
  type text not null check (type in ('transaction', 'goal', 'budget', 'invite', 'system')),
  title text not null,
  body text not null,
  icon text,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_couple_idx on public.notifications (couple_id, created_at desc);
create index notifications_user_read_idx on public.notifications (user_id, read_at);

-- Invites: the couple is complete only when the second member joins ---------
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  inviter_id uuid not null references public.profiles (id),
  email text not null,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_by uuid references public.profiles (id),
  accepted_at timestamptz
);

create index invites_token_idx on public.invites (token);
create index invites_email_status_idx on public.invites (email, status);

-- ============================================================================
-- TRIGGER HELPERS
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Keep audit columns honest: created_by is ALWAYS the acting user -----------
create or replace function public.set_audit_columns()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    new.created_by := auth.uid();
    new.created_at := now();
  elsif (tg_op = 'UPDATE') then
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

-- Auto-profile on sign up ---------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- FINANCIAL INTEGRITY: SALDO = INGRESOS − GASTOS
-- No expense may take the balance below zero.
-- ============================================================================

create or replace function public.enforce_balance_rule()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  _balance bigint;
begin
  if (new.type = 'expense') then
    select coalesce(
      sum(case when t.type = 'income' then t.amount else -t.amount end), 0
    )
    into _balance
    from public.transactions t
    where t.couple_id = new.couple_id
      and t.deleted_at is null
      and t.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if (_balance - new.amount) < 0 then
      raise exception using
        errcode = 'P0001',
        message = 'INSUFFICIENT_BALANCE';
    end if;
  end if;
  return new;
end;
$$;

-- ============================================================================
-- NOTIFICATIONS (server side, so both members always see them)
-- ============================================================================

create or replace function public.handle_transaction_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.deleted_at is null) then
    insert into public.notifications (couple_id, user_id, type, title, body, icon, payload)
    values (
      new.couple_id,
      null, -- couple-wide
      'transaction',
      case when new.type = 'income' then 'Nuevo ingreso' else 'Nuevo gasto' end,
      coalesce(new.description, ''),
      case when new.type = 'income' then 'arrow-down-left' else 'arrow-up-right' end,
      jsonb_build_object(
        'transaction_id', new.id,
        'type', new.type,
        'amount', new.amount,
        'category', new.category,
        'description', new.description
      )
    );
  end if;
  return new;
end;
$$;

create or replace function public.handle_goal_achieved_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    old.current_amount < old.target_amount
    and new.current_amount >= new.target_amount
  ) then
    insert into public.notifications (couple_id, user_id, type, title, body, icon, payload)
    values (
      new.couple_id,
      null,
      'goal',
      'Objetivo alcanzado',
      '¡Habéis alcanzado vuestro objetivo "' || new.name || '"!',
      'trophy',
      jsonb_build_object('goal_id', new.id, 'name', new.name)
    );
  end if;
  return new;
end;
$$;

-- Attach triggers ------------------------------------------------------------
create trigger couples_set_updated_at
  before update on public.couples
  for each row execute procedure public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute procedure public.set_updated_at();

create trigger transactions_audit
  before insert or update on public.transactions
  for each row execute procedure public.set_audit_columns();

create trigger transactions_balance_rule
  before insert or update on public.transactions
  for each row execute procedure public.enforce_balance_rule();

create trigger transactions_notify
  after insert on public.transactions
  for each row execute procedure public.handle_transaction_notification();

create trigger savings_goals_audit
  before insert or update on public.savings_goals
  for each row execute procedure public.set_audit_columns();

create trigger savings_goals_achieved_notify
  after update on public.savings_goals
  for each row execute procedure public.handle_goal_achieved_notification();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Helper: is the current user a member of the given couple? -----------------
create or replace function public.is_couple_member(_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.couple_members cm
    where cm.couple_id = _couple_id and cm.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.notifications enable row level security;
alter table public.invites enable row level security;

-- profiles ---------------------------------------------------------------
create policy profiles_select_own_or_partner
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.couple_members me
      join public.couple_members partner on partner.couple_id = me.couple_id
      where me.user_id = auth.uid() and partner.user_id = profiles.id
    )
  );

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- couples ----------------------------------------------------------------
create policy couples_select_member
  on public.couples for select
  to authenticated
  using (public.is_couple_member(id));

create policy couples_update_member
  on public.couples for update
  to authenticated
  using (public.is_couple_member(id))
  with check (public.is_couple_member(id));

-- couple_members: membership is managed ONLY by RPC (create_couple / accept_invite)
create policy couple_members_select_member
  on public.couple_members for select
  to authenticated
  using (public.is_couple_member(couple_id));

-- categories: public read for authenticated users (no private data)
create policy categories_select_auth
  on public.categories for select
  to authenticated
  using (true);

-- transactions -----------------------------------------------------------
create policy transactions_select_member
  on public.transactions for select
  to authenticated
  using (public.is_couple_member(couple_id));

create policy transactions_insert_member
  on public.transactions for insert
  to authenticated
  with check (public.is_couple_member(couple_id));

create policy transactions_update_member
  on public.transactions for update
  to authenticated
  using (public.is_couple_member(couple_id))
  with check (public.is_couple_member(couple_id));

create policy transactions_delete_member
  on public.transactions for delete
  to authenticated
  using (public.is_couple_member(couple_id));

-- budgets ----------------------------------------------------------------
create policy budgets_select_member
  on public.budgets for select
  to authenticated
  using (public.is_couple_member(couple_id));

create policy budgets_insert_member
  on public.budgets for insert
  to authenticated
  with check (public.is_couple_member(couple_id));

create policy budgets_update_member
  on public.budgets for update
  to authenticated
  using (public.is_couple_member(couple_id))
  with check (public.is_couple_member(couple_id));

create policy budgets_delete_member
  on public.budgets for delete
  to authenticated
  using (public.is_couple_member(couple_id));

-- savings_goals ----------------------------------------------------------
create policy savings_goals_select_member
  on public.savings_goals for select
  to authenticated
  using (public.is_couple_member(couple_id));

create policy savings_goals_insert_member
  on public.savings_goals for insert
  to authenticated
  with check (public.is_couple_member(couple_id));

create policy savings_goals_update_member
  on public.savings_goals for update
  to authenticated
  using (public.is_couple_member(couple_id))
  with check (public.is_couple_member(couple_id));

create policy savings_goals_delete_member
  on public.savings_goals for delete
  to authenticated
  using (public.is_couple_member(couple_id));

-- notifications ----------------------------------------------------------
create policy notifications_select_member
  on public.notifications for select
  to authenticated
  using (
    public.is_couple_member(couple_id)
    and (user_id is null or user_id = auth.uid())
  );

create policy notifications_update_own
  on public.notifications for update
  to authenticated
  using (public.is_couple_member(couple_id))
  with check (public.is_couple_member(couple_id));

-- invites: visible to the couple that created it, or to the invitee ------
create policy invites_select_couple_or_invitee
  on public.invites for select
  to authenticated
  using (
    public.is_couple_member(couple_id)
    or email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- ============================================================================
-- RPCs (security definer so the checks are authoritative)
-- ============================================================================

-- Create the shared couple and add the creator as owner. --------------------
create or replace function public.create_couple(
  _name text default 'Nuestro Money',
  _currency text default 'EUR'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _couple_id uuid;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if exists (select 1 from public.couple_members where user_id = auth.uid()) then
    raise exception 'ALREADY_IN_COUPLE';
  end if;

  insert into public.couples (name, currency, created_by)
  values (_name, _currency, auth.uid())
  returning id into _couple_id;

  insert into public.couple_members (couple_id, user_id, role)
  values (_couple_id, auth.uid(), 'owner');

  return _couple_id;
end;
$$;

-- Invite the partner by email. ----------------------------------------------
create or replace function public.invite_partner(_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _couple_id uuid;
  _member_count int;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select cm.couple_id into _couple_id
  from public.couple_members cm
  where cm.user_id = auth.uid()
  limit 1;

  if _couple_id is null then
    raise exception 'NO_COUPLE';
  end if;

  select count(*) into _member_count
  from public.couple_members where couple_id = _couple_id;

  if _member_count >= 2 then
    raise exception 'COUPLE_FULL';
  end if;

  if not exists (
    select 1 from public.invites
    where couple_id = _couple_id
      and lower(email) = lower(_email)
      and status = 'pending'
  ) then
    insert into public.invites (couple_id, inviter_id, email, expires_at)
    values (_couple_id, auth.uid(), lower(_email), now() + interval '7 days');
  end if;
end;
$$;

-- Accept an invite: validates token + email, adds the member. ---------------
create or replace function public.accept_invite(_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _invite public.invites;
  _couple_id uuid;
  _member_count int;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if exists (select 1 from public.couple_members where user_id = auth.uid()) then
    raise exception 'ALREADY_IN_COUPLE';
  end if;

  select * into _invite
  from public.invites
  where token = _token
    and status = 'pending'
  limit 1;

  if _invite.id is null then
    raise exception 'INVITE_NOT_FOUND';
  end if;

  if _invite.expires_at < now() then
    update public.invites set status = 'expired' where id = _invite.id;
    raise exception 'INVITE_EXPIRED';
  end if;

  if lower(_invite.email) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'INVITE_EMAIL_MISMATCH';
  end if;

  select count(*) into _member_count
  from public.couple_members where couple_id = _invite.couple_id;

  if _member_count >= 2 then
    raise exception 'COUPLE_FULL';
  end if;

  insert into public.couple_members (couple_id, user_id, role)
  values (_invite.couple_id, auth.uid(), 'member');

  update public.invites
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = _invite.id;

  return _invite.couple_id;
end;
$$;

-- Balance and couple helpers (read-only, owner-run with an explicit member
-- guard: the internal query must never depend on RLS) -------------------------
create or replace function public.get_balance(_couple_id uuid)
returns table (balance bigint, income bigint, expense bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(sum(case when type = 'income' then amount else -amount end), 0) as balance,
    coalesce(sum(case when type = 'income' then amount else 0 end), 0) as income,
    coalesce(sum(case when type = 'expense' then amount else 0 end), 0) as expense
  from public.transactions
  where couple_id = _couple_id and deleted_at is null
    and public.is_couple_member(_couple_id);
$$;

create or replace function public.get_couple_stats(_couple_id uuid)
returns table (member_count bigint, first_name text, second_name text)
language sql
security definer
set search_path = public
stable
as $$
  select
    count(p.*)::bigint as member_count,
    (array_agg(p.full_name order by p.id))[1] as first_name,
    (array_agg(p.full_name order by p.id))[2] as second_name
  from public.couple_members cm
  join public.profiles p on p.id = cm.user_id
  where cm.couple_id = _couple_id
    and public.is_couple_member(_couple_id);
$$;

-- ============================================================================
-- SEED DATA
-- ============================================================================

insert into public.categories (type, key, label, icon, color, sort_order) values
  ('income', 'salary',    'Salario',        'briefcase',      'income', 1),
  ('income', 'savings',   'Ahorro',         'piggy-bank',     'brand',  2),
  ('income', 'gift',      'Regalo',         'gift',           'violet', 3),
  ('income', 'refund',    'Devolución',     'rotate-ccw',     'sky',    4),
  ('income', 'business',  'Negocio',        'store',          'amber',  5),
  ('income', 'sale',      'Venta',          'tag',            'teal',   6),
  ('income', 'other',     'Otro',           'more-horizontal','slate',  7),
  ('expense', 'food',     'Comida',         'utensils',       'orange', 1),
  ('expense', 'supermarket','Supermercado', 'shopping-cart',  'brand',  2),
  ('expense', 'transport','Transporte',     'bus',            'sky',    3),
  ('expense', 'home',     'Casa',           'home',           'brown',  4),
  ('expense', 'travel',   'Viajes',         'plane',          'violet', 5),
  ('expense', 'leisure',  'Ocio',           'clapperboard',   'pink',   6),
  ('expense', 'shopping', 'Compras',        'shopping-bag',   'amber',  7),
  ('expense', 'gifts',    'Regalos',        'gift',           'rose',   8),
  ('expense', 'health',   'Salud',          'heart-pulse',    'red',    9),
  ('expense', 'business', 'Negocio',        'store',          'teal',   10),
  ('expense', 'other',    'Otros',          'more-horizontal','slate',  11);
