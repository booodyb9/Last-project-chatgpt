# CMS / Supabase / Netlify branch

This branch is the isolated integration branch for the CMS work.

## Rules

- Do not modify the production `main` branch from this workflow.
- Do not commit Supabase service-role keys, AI keys, or other secrets.
- Keep the existing Google Search Console verification tag unchanged.
- Keep the existing visual design unchanged unless a requested CMS feature requires a non-visual integration.
- Production deployment requires explicit approval.

## Supabase

The application reuses the existing Supabase project configured through `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. No duplicate CMS tables are created by this branch.
