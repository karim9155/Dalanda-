# 💬 Dalanda — AI Invoice Assistant for Telegram

An AI-powered financial assistant that lets a business owner manage invoices entirely through Telegram — by text or voice message. No dashboard, no forms: just message the bot.

Built for a company CEO who needed to create, update, delete, and look up invoices without going through his HR team every time. Dalanda turned a manual, back-and-forth process into a single conversation.

## What it does

The CEO messages the Telegram bot (text or voice) with natural-language requests like *"create an invoice for client X"*, *"find invoice #245"*, or *"what did we invoice last month?"* — and the assistant:

1. Transcribes voice messages when needed.
2. Interprets the request via an LLM-driven conversational agent.
3. Calls the appropriate backend tool: create, update, delete, or fetch invoices by ID or date.
4. Can trigger side actions like sending emails.
5. Replies directly in the Telegram chat with the result.

**Impact:** the HR team previously spent time each week manually pulling and preparing ~20 invoices/week for the CEO. That task now takes zero HR hours — the CEO fetches whatever he needs himself, on demand, from Telegram.

## Architecture

```
Telegram (text / voice)
        │
        ▼
   n8n workflow  ◄────────────►  OpenAI API (assistant + tool use)
        │
        ├─► Spring Boot backend (invoice CRUD, business logic)
        │         │
        │         ▼
        │   Angular admin web app
        │
        └─► Email sending (via backend API)
```

- **Core orchestration** — n8n workflows handle the Telegram trigger, route messages to the OpenAI assistant, and manage tool-call execution.
- **AI assistant** — OpenAI API powers the conversational layer, with tool access to the Spring backend's invoice APIs and email sending, invoked through n8n HTTP nodes.
- **Backend** (`Dalanda/`) — Spring Boot service exposing the invoice management APIs (create/read/update/delete) and email functionality.
- **Frontend** (`dalanda-frontend/`) — Angular web app providing a traditional UI for invoice management, alongside the Telegram interface.
- **Docs** — a full project report (`rapportLatex`) documenting the system design.

## Tech stack

| Layer | Technology |
|---|---|
| Conversational interface | Telegram Bot API |
| AI assistant | OpenAI API (chat + tool calling) |
| Orchestration | n8n (webhook triggers, HTTP nodes, tool routing) |
| Backend | Spring Boot (Java) |
| Frontend | Angular |
| Voice input | Speech-to-text via OpenAI |

## How it works, in more detail

- n8n listens for incoming Telegram messages (text or voice).
- Voice messages are transcribed before being passed to the assistant.
- The OpenAI assistant is given tool definitions mapped to the Spring backend's REST endpoints (invoice CRUD, email sending), executed through n8n's HTTP Request nodes.
- The assistant decides which tool to call based on the user's intent, executes it, and returns a natural-language response back through Telegram.

## Status

Deployed and actively used by the client (a company CEO) in production, handling real invoice creation and lookups on a weekly basis. Full project report and workflow documentation included in this repo.

## Possible next steps

- Extend the assistant to more finance operations (expense tracking, reporting summaries)
- Add role-based access if more than one person needs to use the assistant
- Multi-language support for voice input
