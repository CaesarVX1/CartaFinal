-- Only the server-side function may change wishes; keep browser roles blocked.
grant update, delete on table public.star_wishes to service_role;
