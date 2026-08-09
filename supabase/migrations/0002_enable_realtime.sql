-- Enable realtime for the app tables.
--
-- The app subscribes to postgres_changes on transactions, goals, budgets and
-- notifications so both devices stay in sync. Without these tables in the
-- `supabase_realtime` publication the events are never delivered.

do $$
begin
  alter publication supabase_realtime add table public.transactions;
  alter publication supabase_realtime add table public.savings_goals;
  alter publication supabase_realtime add table public.budgets;
  alter publication supabase_realtime add table public.notifications;
  alter publication supabase_realtime add table public.invites;
  alter publication supabase_realtime add table public.couples;
  alter publication supabase_realtime add table public.couple_members;
exception when duplicate_object then null;
end
$$;
