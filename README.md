# Quantify

AI-powered trading dashboard for smarter short-term options and stock decisions.

## What it is

- **Dashboard**: Portfolio summary, today’s P&L, open positions, win rate
- **Portfolio vs SPY**: Simple chart of portfolio value vs SPY over time
- **Positions / ideas table**: Symbol, type (Call/Put), status, strike, premium, AI signal — sortable, filterable, reorderable
- **Navigation**: Watchlist, Options Scanner, AI Insights, Strategies (ready for future pages)

## Stack

- Next.js 15, React 19, TypeScript
- shadcn/ui, Tailwind, Recharts
- Template: quanttemplate (dashboard layout + data table)

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
