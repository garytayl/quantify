# Quantify

AI-powered trading dashboard for smarter short-term options and stock decisions.

## What it is

- **Dashboard**: SPY/QQQ price, VIX, expected move (1W); SPY + expected move band chart
- **Scanner**: Bull Put, Bear Call, Iron Condor with credit, max risk, probability of profit, risk/reward; quick filters
- **Options Chain**: Full chain table with Build Spread / Add to Strategy
- **Journal**: Log trades; win rate, avg return, max drawdown
- **Risk**: Capital, open risk, P/L chart, risk exposure pie

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- shadcn/ui, Tailwind, Recharts, Zustand

## App structure

- **app/dashboard** — Market overview: SPY/QQQ/VIX/Expected Move KPIs + SPY expected move band chart
- **app/scanner** — Strategy scanner: ticker, max risk, min probability, DTE → Bull Put / Bear Call / Iron Condor; sort by High Probability, High Credit, Low Risk
- **app/options** — Options chain: strike, bid, ask, delta, IV, volume, OI; Build Spread / Add to Strategy
- **app/journal** — Trade journal: log trades; win rate, avg return, max drawdown; history table
- **app/risk** — Risk dashboard: capital, open risk, max risk/trade, profit this month, win rate; P/L chart, risk pie
- **lib/calculations** — `options.ts` (expected move, POP, spread math), `scanner.ts`
- **lib/market** — Mock data (SPY, QQQ, IWM + option chains)
- **lib/store** — Zustand (journal entries, risk snapshot)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000); you’ll be redirected to `/dashboard`.

## Next steps (ideas)

- **Watchlist**: Add/remove symbols; track prices and optional alerts
- **Options scanner**: Filter by expiry (e.g. 0–45 DTE), delta, IV; show AI score
- **AI insights**: Integrate an LLM or API (e.g. sentiment, earnings, momentum) to suggest trades or explain signals
- **Strategies**: Presets (e.g. covered call, cash-secured put, verticals) with suggested underlyings and strikes
- **Broker / data**: Connect a broker API or market data (e.g. Alpaca, Polygon) for live prices and order placement

## Disclaimer

This app is for education and research. It does not provide investment advice. Options and stocks involve risk; past performance does not guarantee future results.
