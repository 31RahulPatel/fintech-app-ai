# FintechOps

**Your Trusted Financial Companion.** An AI-powered financial SaaS app where users create
**Always-On AI Agents** — scheduled prompts that wake themselves up via Amazon EventBridge
Scheduler, analyze live market data with Amazon Bedrock Nova, and email the report through Amazon
SES. Built for the AWS Builder Center **Always-On Agent Challenge**.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the system design and [`DEPLOYMENT.md`](./DEPLOYMENT.md)
for step-by-step AWS Console deployment instructions.

## Tech stack

- **Frontend**: React 19 + Vite, plain CSS per component (no UI framework), `react-router-dom`,
  `amazon-cognito-identity-js` for custom-themed auth (no Amplify UI)
- **Backend**: 2 AWS Lambda functions, TypeScript, AWS SDK v3
- **AWS**: Cognito, API Gateway (HTTP API), Lambda, EventBridge Scheduler, DynamoDB, Bedrock
  (Nova), SES, CloudWatch, IAM

## Folder structure

```
Finapp/
├── frontend/                      React SPA
│   └── src/
│       ├── components/            Shared components — one folder per component (.jsx + .css)
│       ├── pages/                 One folder per route; Dashboard nests its own sub-components
│       ├── context/AuthContext.jsx
│       ├── lib/                   cognitoClient.js, apiClient.js
│       └── config.js
├── backend/
│   ├── schedule-api/               Lambda 1 — Agents CRUD, /chat
│   └── agent-runner/               Lambda 2 — EventBridge-triggered report generation
├── ARCHITECTURE.md
├── DEPLOYMENT.md
└── README.md
```

## Local development

```bash
# Frontend
cd frontend
cp .env.example .env      # fill in after completing DEPLOYMENT.md steps 2 and 8
npm install
npm run dev                # http://localhost:5173

# Backend (build + zip for console upload)
cd backend/schedule-api && npm install && npm run package
cd ../agent-runner && npm install && npm run package
```

The dashboard works standalone even before the backend is deployed — agent list and chat replies
fall back to demo data so the UI can be reviewed in isolation.

## Environment variables

### `frontend/.env`

| Variable | Purpose |
|---|---|
| `VITE_AWS_REGION` | AWS region |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | Cognito **public** App Client ID — must not have a client secret |
| `VITE_API_BASE_URL` | API Gateway invoke URL |

### `backend/schedule-api` (Lambda 1)

| Variable | Purpose |
|---|---|
| `AGENTS_TABLE` / `EXECUTION_HISTORY_TABLE` | DynamoDB table names |
| `AGENT_RUNNER_FUNCTION_ARN` | ARN of Lambda 2 — the EventBridge Scheduler target |
| `SCHEDULER_ROLE_ARN` | Role EventBridge Scheduler assumes to invoke Lambda 2 |
| `SCHEDULER_GROUP_NAME` | EventBridge Scheduler group name |
| `BEDROCK_REGION` | Region to call Bedrock in — only needed if Nova isn't offered in this Lambda's own region |
| `BEDROCK_MODEL_ID` | Cross-region inference profile ID, e.g. `us.amazon.nova-lite-v1:0` |

### `backend/agent-runner` (Lambda 2)

| Variable | Purpose |
|---|---|
| `AGENTS_TABLE` / `EXECUTION_HISTORY_TABLE` | DynamoDB table names |
| `BEDROCK_REGION` | Region to call Bedrock in — only needed if Nova isn't offered in this Lambda's own region |
| `BEDROCK_MODEL_ID` | Cross-region inference profile ID, e.g. `us.amazon.nova-lite-v1:0` |
| `MARKET_DATA_PROVIDER` | `mock` (default) or `live` (real prices via NSE/Yahoo Finance/CoinGecko/News API) |
| `NEWS_API_KEY` | Free newsapi.org key, used only when `MARKET_DATA_PROVIDER=live` |
| `SES_SENDER_EMAIL` | Must be a verified SES identity |

## API reference (`schedule-api`, Cognito JWT-protected)

| Method | Path | Description |
|---|---|---|
| GET | `/agents` | List the signed-in user's agents |
| POST | `/agents` | Create an agent — also creates its EventBridge Schedule |
| GET | `/agents/{id}` | Get one agent |
| PUT | `/agents/{id}` | Update name/prompt/schedule — updates the EventBridge Schedule too |
| DELETE | `/agents/{id}` | Delete an agent and its EventBridge Schedule |
| POST | `/agents/{id}/pause` | Disable the EventBridge Schedule |
| POST | `/agents/{id}/resume` | Re-enable the EventBridge Schedule |
| GET | `/agents/{id}/history` | List past executions for an agent |
| POST | `/chat` | One-off Bazar.ai chat message (immediate Bedrock call, not persisted) |

### Sample request — `POST /agents`

```json
{
  "name": "Nifty 50 shares",
  "prompt": "Summarize today's Nifty 50 top gainers and losers in a table.",
  "frequency": "Daily",
  "time": "21:00",
  "timezone": "Asia/Kolkata",
  "delivery": "Email"
}
```

## Sample EventBridge Scheduler target payload

This is exactly what `schedule-api` puts in the schedule's `Target.Input` when an agent is
created — EventBridge Scheduler delivers it as the event to `agent-runner`:

```json
{
  "agentId": "5f2c1a3e-9b7d-4e2a-8f6a-1234567890ab",
  "userId": "b1e2c3d4-5678-90ab-cdef-1234567890ab"
}
```

## Sample Bedrock Nova prompt

Built by `agent-runner/src/services/bedrock.service.ts` for each scheduled run:

```
USER PROMPT:
Summarize today's Nifty 50 top gainers and losers in a table.

LATEST FINANCIAL DATA (as of 2026-07-16T15:30:00.000Z):
- NIFTY 50: 22,456.80 (+1.24%)
- SENSEX: 74,085.60 (+0.98%)
- BANK NIFTY: 47,234.50 (-0.45%)
...

RECENT HEADLINES:
- RBI holds repo rate steady for sixth straight meeting
...

CURRENT DATE: 16 July 2026

EXPECTED RESPONSE FORMAT (strict JSON, no markdown, matching this exact shape):
{
  "summary": "...",
  "analysis": "...",
  "risks": ["..."],
  "opportunities": ["..."],
  "suggestedActions": ["..."]
}
```

## Sample SES email

`agent-runner/src/templates/email.template.ts` renders the Bedrock JSON output into an HTML email
with: a **Market Summary** table, **AI Analysis**, **Risks**, **Opportunities**, **Suggested
Actions**, and a footer reading *"Generated automatically by FintechOps AI Agent"*. Subject line:
`FintechOps · <Agent Name> · <date>`.

## Design system

| Token | Value |
|---|---|
| Primary | `#F97316` |
| Background | `#FFFFFF` |
| Secondary background | `#F8FAFC` |
| Text | `#111827` |
| Border | `#E5E7EB` |

Light theme only, desktop-first, rounded cards, soft shadows — see
`frontend/src/index.css` for the full token set.
# fintech-app-ai
# fintech-app-ai
# fintech-app-ai
