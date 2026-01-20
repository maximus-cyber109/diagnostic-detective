# Environment Setup for Netlify

To ensure the backend works correctly, you must set the following Environment Variables in your Netlify Site Settings (Site Configuration > Environment variables).

## Required Variables

### Supabase (Database)
These can be found in your Supabase Project Settings > API.

- `SUPABASE_URL`: The URL of your Supabase project (e.g., https://xyz.supabase.co)
- `SUPABASE_ANON_KEY`: The **public** API key (safe for frontend config)
- `SUPABASE_SERVICE_KEY`: The **service_role** API secret (used by backend functions). **KEEP SECRET**.

### Magento (Customer Validation)
If you are integrating with Magento:

- `MAGENTO_API_URL`: The base URL for Magento API (e.g., https://pinkblue.in/rest/V1)
- `MAGENTO_API_TOKEN`: The Admin Bearer Token for API access.

## Quick Start (Local Development)

Create a `.env` file in the root directory (do not commit this file):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
MAGENTO_API_URL=https://pinkblue.in/rest/V1
MAGENTO_API_TOKEN=your_token
```

Then run `npm run dev` to test locally with Netlify Functions.
