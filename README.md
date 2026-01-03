
# Denison Clinic Deployment Guide

## Vercel Environment Variables
To connect this site to your Supabase database, add the following Environment Variables in your Vercel Project Settings:

1. `VITE_SUPABASE_URL`: Your Supabase Project URL (found in Project Settings -> API)
2. `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key

## Supabase Database Schema
Run the following SQL in your Supabase SQL Editor to create the required table:

```sql
create table appointments (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  service_id text not null,
  appointment_date date not null,
  appointment_time text not null,
  patient_type text check (patient_type in ('new', 'returning')),
  insurance_provider text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table appointments enable row level security;

-- Create a policy that allows anyone to insert (for the booking form)
create policy "Enable insert for all users" on appointments 
  for insert with check (true);
```
