-- Create the 'scans' table
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  fingerprint text not null,
  is_paid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional: Enable Row Level Security (RLS)
alter table public.scans enable row level security;

-- Policy to allow inserts (since we are likely doing anonymous inserts)
create policy "Enable insert for all users" on public.scans
  for insert
  with check (true);

-- Policy to allow reading (adjust as needed for security)
create policy "Enable read for all users" on public.scans
  for select
  using (true);
