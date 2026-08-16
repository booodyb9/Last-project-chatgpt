# Production review fixes

Applied before final deployment:
- Added Netlify routing and serverless handling for Customer AI Vision Assistant.
- Added Netlify routing and serverless handling for Smart Search.
- Fixed service detail links to honor CMS `slug` values.
- Fixed service detail lookup to resolve the CMS `slug` first.
- Fixed literal Arabic/English JSX expressions in the contact form labels/placeholder.
- Unified the default Gemini model used by Express and shared AI core.
- Corrected `.env.example` formatting for the Supabase anon variable.
- Removed root-level one-off patch/fix scripts and obsolete development planning artifacts.

Verification performed:
- Node syntax check: server.js PASS
- Node syntax check: server/ai-core.js PASS
- Node syntax check: netlify/functions/ai.mjs PASS

Build status:
- Full Vite production build could not be executed in this review environment because dependency installation was unavailable and `vite` was not present locally. Run `npm ci && npm run lint && npm run build` before deployment.

Remaining hardening recommended before production:
- Sanitize CMS-authored rich HTML before `dangerouslySetInnerHTML` rendering (stored-XSS defense in depth).
- Decide whether built-in service/blog fallback demo content should remain as outage fallback or be removed after confirming Supabase seed/content completeness.
