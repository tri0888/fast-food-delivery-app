## Admin Panel

This Vite project powers the Fast Food Delivery admin experience (manage foods, orders, and users). The app is a standalone React SPA that authenticates via a JWT token passed through the query string.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Create a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run test:ui` | Execute the Playwright admin UI suite in headless browsers. |
| `npm run test:ui:headed` | Run the same Playwright suite with a visible browser. |
| `npm run test:ui:report` | Re-open the latest Playwright HTML report. |

### Admin Playwright tests

The new UI suite lives in `e2e/` and uses mocked API responses, so it does not require the backend to be running. Configure it via `e2e/.env.playwright` (created with sensible defaults):

```
PLAYWRIGHT_ADMIN_TOKEN=playwright-admin      # Token appended as ?token=...
PLAYWRIGHT_ADMIN_BASE_URL=http://127.0.0.1:4175
PLAYWRIGHT_ADMIN_SKIP_WEB_SERVER=false      # Set to true if you start the preview server manually
```

To run the suite locally:

1. Install deps: `npm install`
2. (Optional) customize any of the env vars above.
3. Launch the tests: `npm run test:ui`

The configuration will spin up `npm run preview` automatically (unless `PLAYWRIGHT_ADMIN_SKIP_WEB_SERVER=true`), visit the admin panel with a fake token, and cover both the **Users** (cart lock toggle) and **Orders** (status updates) workflows.
