# Mis Gastos

A small app I built to keep track of my own spending. It's in Spanish because that's what I use day to day.

## How I manage money (and why the app works this way)

My salary goes into a savings account that I don't touch. Every month I move some money from there to a checking account, and all my normal spending comes out of that one. Whatever is left over at the end of the month carries over to the next.

When something big comes up, I move extra money from savings first and then pay for it from checking. So in the app that's just another transfer for that month.

Sometimes money comes in from other people too, like family paying their share of the rent. That goes into the month's budget as well, but it's kept apart from my own transfers so it doesn't look like I took it out of savings.

## What it does

- **Gastos**: add expenses with an amount, a date, an optional note ("cena Juan") and an optional category. I only use categories for things I want to keep an eye on, like fuel or groceries.
- **Calendario**: a month view that shows how much I spent each day. Tap a day to see it broken down by category.
- **Mes**: the checking account balance for the month (left over from last month + transfers − expenses), the transfers I made, and my salary, so I can see how much I actually saved.
- **Año**: salary, spending and savings for each month of the year.
- **Categorías**: add or remove categories for the dropdown.

The data lives in Supabase, so it syncs between my phone and my computer.

## Built with

React, TypeScript, Vite, Tailwind CSS and Supabase (database and login).

## Running it locally

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in your project URL and publishable key.
3. Create your user in Supabase under Authentication → Users. Sign-ups are turned off, so that's the only way in.
4. Install and start it:

   ```
   npm install
   npm run dev
   ```
