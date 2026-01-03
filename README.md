
# Denison Clinic Deployment Guide

## Vercel Environment Variables
To connect this site to your Supabase and Twilio accounts, add the following Environment Variables in your Vercel Project Settings:

### Supabase (Required for bookings)
1. `VITE_SUPABASE_URL`: Your Supabase Project URL
2. `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key

### Twilio (Required for SMS reminders)
1. `VITE_TWILIO_ACCOUNT_SID`: Found in Twilio Console
2. `VITE_TWILIO_AUTH_TOKEN`: Found in Twilio Console
3. `VITE_TWILIO_PHONE_NUMBER`: Your Twilio "From" Number

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

alter table appointments enable row level security;

create policy "Enable insert for all users" on appointments for insert with check (true);
create policy "Enable select for all users" on appointments for select using (true);
```
