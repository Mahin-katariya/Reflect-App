# ADR 0007: Slug = slugified `username`, held in a separate Profile field

## Status
Accepted

## Context
Each account has exactly one public link ([ADR 0002](./0002-topics-per-account.md)), needing a
slug. Reusing an existing unique identifier is preferable to building separate custom-slug
uniqueness validation under a 2-day deadline.

Initially this was going to be the login username directly. After [ADR 0001](./0001-auth-model.md)
moved authentication to Supabase Auth, the login identity became **email**, not username — so a
username no longer exists implicitly and must be collected as its own field.

## Decision
Collect a `username` field on the `Profile` table (via Prisma) at registration, separate from the
Supabase Auth email/password. The public slug is a slugified version of this `username`
(lowercase, URL-safe). URL shape: `/profile/<slug>`.

## Consequences
- `username` needs its own uniqueness constraint (enforced at the `Profile` table level, not via
  Supabase Auth).
- The user should be told at signup that this username becomes their public URL.
- Decoupling slug from login identity means changing your email later (if ever supported) doesn't
  break your public link.
