<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6ecc1e58-7c0d-4ed7-b3ed-e0905c08771c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## RSG Ops Notes (July 2026)

- **Live app:** https://carrier-appetite-submission-portal-339396843209.us-east1.run.app/
- **Source of truth for edits:** Google AI Studio (deploys to Cloud Run). This repo is the version-controlled backup — use AI Studio's GitHub integration tab to keep them synced.
- **Commission data:** Supabase view `portal_carrier_commissions` in `rsg-infrastructure` (wibscqhkvpijzqbhjphg). Feeds NB/renewal % by carrier, LOB, tier, and state from `commission_rules`. Match app carriers via the `match_key` column.
- **Onyx (appetite knowledge base):** https://onyx-1t6jv-u69864.vm.elestio.app/app/agents
- **Rule:** No real carrier portal passwords in this app — it is public. Login URLs only; credentials stay in 1Password.
- **Verify before trusting:** underwriter contact names in `src/data/carriers.ts` were AI-generated during the build and may be fictional.
