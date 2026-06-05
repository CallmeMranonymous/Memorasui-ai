# MemoraSui AI

**The first portable, user-owned AI agent whose entire long-term memory lives permanently on Walrus — searchable, encrypted, and owned via Sui wallet.**

Built for the [Tatum × Walrus Hackathon](https://tatum.io/tatum-x-walrus-hackathon).

---

## Architecture

```
User (Browser)
     │
     ▼
Next.js 15 Chat UI  (Vercel AI SDK streaming)
     │
     ▼
/api/chat  ──► Gemini 2.0 Flash (AI model)
     │               │
     │         ┌─────┴──────┐
     │         ▼            ▼
     │   recall_memory   get_sui_balance
     │   save_memory     get_sui_transactions
     │         │            │
     │         ▼            ▼
     │   MemWal SDK    Tatum Sui RPC
     │   (Walrus)      (sui-mainnet.tatum.io)
```

---

## Why This Wins

| Criterion | How We Score |
|---|---|
| Walrus + Tatum Integration (30%) | Walrus IS the product. Tatum handles all RPC. |
| Technical Quality (30%) | Production Next.js 15, streaming AI, encrypted on-chain storage |
| Creativity (20%) | First-ever AI with user-owned permanent on-chain memory |
| Presentation (20%) | Clear "forget → remember → act" demo flow |

---

## Quick Start

```bash
npm install
cp .env.local .env.local.bak   # fill in your keys
npm run dev
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
