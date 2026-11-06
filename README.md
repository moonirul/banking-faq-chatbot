# Banking FAQ Chatbot

A responsive React + Vite banking FAQ chat interface connected to an n8n webhook. The frontend displays the actual response returned by your workflow; it does not contain mock banking answers.

## Features

- Responsive desktop, tablet and mobile chat UI
- n8n webhook integration using `POST` JSON (`chatInput`, `sessionId`)
- Unique conversation session ID; clearing the chat starts a new session
- Handles JSON keys `output`, `answer`, `response`, `text`, nested objects, arrays and plain-text responses
- Loading/typing state, timestamps, error handling, retry and clear-chat controls
- No fake answer on API/network failure
- Security reminder not to share PINs, passwords, OTPs or full card numbers

## Requirements

- Node.js 18+ (Node 20 LTS recommended)
- npm
- An n8n instance with a webhook workflow

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

The default local webhook is:

```text
http://localhost:5678/webhook/740ae2b5-aedf-4ceb-bd7e-a29ea58b369f
```

Set `VITE_N8N_WEBHOOK_URL` in `.env` to override it:

```env
VITE_N8N_WEBHOOK_URL=https://your-public-n8n-host.example/webhook/your-webhook-id
```

Restart the Vite dev server after changing environment variables.

## n8n workflow expectations

1. Create a Webhook node using **POST** and the production webhook path.
2. Read `chatInput` and `sessionId` from the incoming JSON body.
3. Pass the message to your AI/FAQ workflow.
4. Return a response from the workflow as JSON, for example:

```json
{
  "output": "Your account opening information goes here."
}
```

The frontend also recognizes `answer`, `response`, and `text`. To customize response parsing, edit `extractAnswer()` in `src/lib/chatApi.js`.

Configure the Webhook node's response mode so it returns the workflow result after execution (for example, using the Respond to Webhook node). Ensure the response is valid JSON or plain text.

## Important: before deploying

**Do not deploy the localhost URL.** A visitor's browser interprets `localhost` as the visitor's own device, not your computer or n8n server.

- Publish your n8n instance behind a publicly accessible **HTTPS** URL.
- Replace the local URL with your production HTTPS webhook URL in the deployment environment variable.
- Configure n8n CORS to allow your deployed GitHub Pages origin.
- Do not put n8n API keys, banking credentials, or private secrets in frontend environment variables. Vite variables are bundled into public browser code.
- A public webhook can be abused. Add suitable rate limiting, abuse protection, request validation and monitoring at the n8n/reverse-proxy layer. For sensitive or authenticated banking data, put a trusted backend between the browser and n8n and implement real authentication/authorization there.
- This demo is for general information only. Do not use it to retrieve account-specific data or perform banking transactions.

## GitHub Pages deployment

This project includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

1. Create a GitHub repository named `banking-faq-chatbot` (or update the `base` value in `vite.config.js` to match your repository name).
2. Push this project to the repository's `main` branch.
3. In GitHub, open **Settings → Pages** and set the source to **GitHub Actions**.
4. In **Settings → Secrets and variables → Actions → Variables**, add:
   - Name: `VITE_N8N_WEBHOOK_URL`
   - Value: your public HTTPS production webhook URL
5. Push to `main` or manually run the **Deploy to GitHub Pages** workflow.

The workflow builds with `GITHUB_PAGES=true`, which sets the Vite base path to `/banking-faq-chatbot/`. If your repository has a different name, change that path in `vite.config.js` and in the workflow build configuration as appropriate.

For a user/organization site repository named `yourname.github.io`, use `base: '/'` instead.

## Build locally

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Project structure

```text
banking-faq-chatbot/
├── .github/workflows/deploy.yml
├── public/
├── src/
│   ├── lib/chatApi.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
