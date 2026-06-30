# AI Website Auditor

A small full-stack MVP built with Next.js, TypeScript, TailwindCSS, Puppeteer,
Lighthouse, and the OpenAI API.

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Add your Gemini API key to `.env.local`. OpenAI is optional and is used as the fallback provider:

```bash
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash
OPENAI_API_KEY=your_key_here
```

Then run:

```bash
pnpm run dev
```

Open `http://localhost:3000`, enter an `http://` or `https://` URL, and run the audit.

The app tries Gemini first, then OpenAI, then a practical local fallback report.

Puppeteer is configured to use an installed Chrome or Edge browser to keep setup small.
If your browser is in a custom location, set `PUPPETEER_EXECUTABLE_PATH` in `.env.local`.
"# AIauditor" 
