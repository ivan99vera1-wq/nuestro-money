-- Fix RLS infinite recursion.
--
-- `is_couple_member` is referenced from the `couple_members` SELECT policy and
-- queries `couple_members` itself. As SECURITY INVOKER that re-entered the same
-- policy, producing "infinite recursion detected in policy for relation
-- couple_members" — so the client could never read membership while the
-- SECURITY DEFINER RPCs could (hence "ya pertenecéis a una cuenta compartida"
-- while the app shows the create-couple screen).
--
-- Make it SECURITY DEFINER (owner-run, bypasses RLS) so it can read membership
-- without recursing. It still honours auth.uid() from the request JWT, like the
-- other definer RPCs in this project.

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
