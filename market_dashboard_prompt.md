# 🧠 Market Sentiment Dashboard — Claude Code Build Prompt

## Copy everything below this line and paste into Claude Code

---

## PROJECT OVERVIEW

Build me a **personal investor sentiment dashboard** called **"Mr Market's Mood Board"** — a single-page web application I can trigger manually (not on a schedule) to fetch live market data and display a clear, opinionated sentiment reading across key economic indicators. The dashboard should feel like a serious investor's war room, not a generic finance app.

The core philosophy behind this dashboard comes from Benjamin Graham's concept of "Mr Market" — the market is a moody business partner who sometimes offers you great prices when he's depressed, and absurdly high prices when he's euphoric. My job as an investor is to read his mood accurately and act rationally regardless of what the news is saying.

---

## AESTHETIC DIRECTION

Design this with a **dark, editorial, premium newspaper aesthetic** — like the Financial Times crossed with a Bloomberg terminal. Think deep charcoal backgrounds, amber/gold accents, sharp serif typography for headlines, clean monospace for numbers, and subtle grain texture. It should feel authoritative and calm — the opposite of the panic-inducing financial media.

Specific design requirements:
- Dark background (#0f0f0f or similar deep charcoal)
- Gold/amber accent colour (#c9a84c or similar) for key readings
- A serif display font for the dashboard title (use Google Fonts — Playfair Display or similar)
- Monospace font for all numeric data (use Google Fonts — JetBrains Mono or similar)
- Subtle paper grain texture overlay
- No gradients that look like generic fintech apps — keep it editorial and sharp
- Animated "Mr Market" character that visually represents the overall sentiment (described in detail below)

---

## TECHNICAL REQUIREMENTS

- **Single HTML file** with embedded CSS and JavaScript — no build tools, no frameworks, no dependencies except Google Fonts and any free public APIs
- **Manual trigger only** — there is a prominent "Refresh Market Data" button the user clicks to fetch fresh data. No auto-refresh, no polling, no scheduled runs
- **Works offline gracefully** — if an API call fails, show the last known value with a "stale data" indicator and timestamp. Never show broken UI
- **Mobile responsive** — I use this on my phone too
- **All data fetched client-side** using free public APIs (listed below)
- Store the last fetched data in localStorage so it persists between sessions
- Show a "Last updated: [timestamp]" clearly on the dashboard

---

## THE MR MARKET CHARACTER

This is the soul of the dashboard. Create an animated SVG illustration of Mr Market — a rotund, old-fashioned businessman in a suit and top hat. He should visually morph between 5 moods based on the overall sentiment score:

1. **EUPHORIC** (score 80–100): Mr Market is dancing, champagne in hand, top hat askew, stars around him. Colour: bright gold. He's dangerously overconfident.

2. **OPTIMISTIC** (score 60–79): Mr Market is smiling broadly, thumbs up, relaxed posture. Colour: warm amber. Cautiously good times.

3. **NEUTRAL** (score 40–59): Mr Market is sitting calmly reading a newspaper, expressionless. Colour: grey-blue. Neither fearful nor greedy.

4. **ANXIOUS** (score 20–39): Mr Market is sweating, tie loosened, looking over his shoulder. Colour: orange-red. Fear is entering the market.

5. **PANICKING** (score 0–19): Mr Market is running with arms flailing, papers flying everywhere, hair on end. Colour: deep red. Maximum fear = potential opportunity.

Below the character, display:
- His current mood label in large serif text (e.g., "ANXIOUS")
- A one-line investor wisdom quote that matches the mood (hardcoded, rotate through 3–4 quotes per mood state)
- The overall sentiment score as a large number (0–100)
- A horizontal "Fear ←→ Greed" meter bar showing where the score sits

---

## THE FRAMEWORK — INDICATOR PANELS

Display the following indicators in a grid of cards. Each card has:
- Indicator name
- Current live value (fetched from API)
- A status badge: 🟢 HEALTHY / 🟡 CAUTION / 🔴 WARNING
- A small sparkline or trend arrow
- One sentence of plain-English interpretation

### AUSTRALIA INDICATORS (Left column — labelled "🇦🇺 Australia")

**1. ASX 200 Level**
- API: Yahoo Finance unofficial API or Alpha Vantage free tier for ^AXJO
- Healthy: Above 7,800 | Caution: 7,000–7,800 | Warning: Below 7,000
- Show: Current level, day change %, 52-week position

**2. Australian Unemployment Rate**
- Source: Fetch from ABS or use a cached value from RBA's public data
- Healthy: Below 4.5% | Caution: 4.5–5.5% | Warning: Above 5.5%
- If live API unavailable, allow manual input field the user can update

**3. Australian Inflation (CPI)**
- Source: RBA public data or manually updatable field
- Healthy: 2–3% | Caution: 3–4.5% | Warning: Above 4.5% or below 1%

**4. RBA Cash Rate**
- Source: Manually updatable — user sets this when RBA announces
- Healthy: 2–3.5% | Caution: 3.5–4.5% | Warning: Above 4.5% or below 1%

**5. Australian Consumer Confidence**
- Source: Manually updatable field (ANZ-Roy Morgan index)
- Healthy: Above 100 | Caution: 75–100 | Warning: Below 75
- Note: Currently at historic 50-year low of 63.1 (pre-fill this as default)

**6. AUD/USD Exchange Rate**
- API: Free forex API (exchangerate-api.com free tier or similar)
- Healthy: Above 0.68 | Caution: 0.62–0.68 | Warning: Below 0.62

### USA INDICATORS (Right column — labelled "🇺🇸 United States")

**7. S&P 500 (SPY/VOO proxy)**
- API: Yahoo Finance or Alpha Vantage for ^GSPC
- Healthy: P/E below 22 | Caution: 22–30 | Warning: Above 30
- Show: Index level, day change %, and if available the current P/E ratio

**8. US Unemployment Rate**
- Source: Manually updatable (BLS releases monthly)
- Healthy: Below 4.5% | Caution: 4.5–6% | Warning: Above 6%
- Pre-fill: 4.4%

**9. US Inflation (CPI)**
- Source: Manually updatable
- Healthy: 2–2.5% | Caution: 2.5–4% | Warning: Above 4%
- Pre-fill: 3.0%

**10. Fed Funds Rate**
- Source: Manually updatable
- Healthy: 2–3.5% | Caution: 3.5–4.5% | Warning: Above 4.5%
- Pre-fill: 4.25–4.5%

**11. US Debt to GDP Ratio**
- Source: Manually updatable (quarterly CBO data)
- Healthy: Below 80% | Caution: 80–105% | Warning: Above 105%
- Pre-fill: 122.3%

**12. VIX (Fear Index)**
- API: Alpha Vantage or Yahoo Finance for ^VIX
- Healthy: Below 15 | Caution: 15–25 | Warning: Above 25
- This is one of the most important real-time indicators — display prominently

### GLOBAL / MACRO INDICATORS (Bottom row — labelled "🌍 Global Macro")

**13. Gold Price (USD/oz)**
- API: Free metals API or Yahoo Finance for GC=F
- Healthy (for market): Below $2,500 | Caution: $2,500–$3,000 | Warning: Above $3,000 (high gold = fear in system)

**14. Oil Price (WTI Crude)**
- API: Yahoo Finance for CL=F
- Healthy: $60–$80 | Caution: $80–$95 | Warning: Above $95 or below $50

**15. US 10-Year Treasury Yield**
- API: Yahoo Finance for ^TNX
- Healthy: 2–4% | Caution: 4–5% | Warning: Above 5% (inverted curve danger)
- Note: Show alongside 2-year yield if possible for yield curve context

**16. Bitcoin / IBIT Proxy (BTC-USD)**
- API: CoinGecko free API for bitcoin price
- Show: Current BTC price, 30-day change %
- Healthy: Trending up in bull market context | Warning: Down 30%+ from recent high
- Display as "Risk Appetite Indicator" — when BTC is crashing, risk-off is in play

---

## PORTFOLIO TRACKER SECTION

Below the macro indicators, add a personal portfolio section the user can manually update (stored in localStorage — never sent anywhere):

**My Holdings:**
Allow the user to add/edit entries with:
- Asset name (e.g., AIQ, VOO, GOOG, IBIT, VAS)
- Units held
- Average buy price (AUD or USD — user selects)
- CGT status: < 12 months / > 12 months / > 12 months (discounted)
- Current value (auto-fetched where possible, manual otherwise)
- Gain/Loss %
- Action tag the user sets manually: HOLD / TRIM / ACCUMULATE / WATCH

Display a summary row showing total portfolio value and overall gain/loss.

Add a "CGT Alert" badge on any holding where:
- It's within 30 days of hitting the 12-month CGT discount mark
- It's sitting at a loss that could be harvested before June 30

---

## THE SENTIMENT SCORING ENGINE

Calculate an overall sentiment score (0–100) as follows:

**Each indicator contributes to the score:**
- 🟢 HEALTHY status = full positive contribution
- 🟡 CAUTION status = partial contribution
- 🔴 WARNING status = negative contribution (or zero)

**Weighting (must add to 100%):**
- VIX: 15% (most real-time fear gauge)
- S&P 500 Valuation: 12%
- US Unemployment: 8%
- Australian Consumer Confidence: 10%
- Gold Price: 8%
- ASX 200 Level: 8%
- AUD/USD: 7%
- US Inflation: 7%
- Australian Inflation: 7%
- Fed Funds Rate: 5%
- RBA Cash Rate: 5%
- US Debt/GDP: 4%
- Oil Price: 4%

Score interpretation:
- 80–100: EUPHORIC — Market is dangerously greedy. Trim winners.
- 60–79: OPTIMISTIC — Good conditions but stay alert.
- 40–59: NEUTRAL — Neither fearful nor greedy. Stick to the plan.
- 20–39: ANXIOUS — Fear entering. Watch for opportunities.
- 0–19: PANICKING — Maximum fear. Historically the best time to accumulate quality assets.

---

## ACTION PANEL

Below the sentiment score, display a clear "WHAT TO DO NOW" action panel that changes based on the score:

**If EUPHORIC (80–100):**
> "Mr Market is dangerously optimistic. This is not the time to add new positions in expensive assets. Consider trimming 25–35% of your largest winners. Build your cash reserve. Gold and defensive assets make sense here. Remember: the time to be greedy is when others are fearful — not now."

**If OPTIMISTIC (60–79):**
> "Conditions are reasonable but stretched. Continue your DCA plan but don't add aggressively to US tech. Watch your CGT dates. Keep some powder dry. The cycle turns when you least expect it."

**If NEUTRAL (40–59):**
> "Mr Market is calm. This is the ideal environment for steady DCA accumulation. Stick to your plan. Don't let news headlines distract you from the data in front of you."

**If ANXIOUS (20–39):**
> "Fear is entering the market. This is where discipline separates investors from speculators. Don't panic sell. Review your CGT position. Consider whether any tax-loss harvesting opportunities exist. If your financial position is secure, begin slowly accumulating quality assets."

**If PANICKING (0–19):**
> "Mr Market is in full panic. Historically, this is where generational wealth is made — if you have the courage and the cash. Deploy your dry powder into quality index ETFs. VAS, A200, VOO bought at panic prices have always recovered. Check your IBIT/loss positions for tax harvesting. This is the moment the plan was built for."

---

## ADDITIONAL UI REQUIREMENTS

**Header:**
- Dashboard title: "MR MARKET'S MOOD BOARD"
- Subtitle: "A rational investor's view — data, not headlines"
- Last updated timestamp
- Large "📡 REFRESH ALL DATA" button (triggers all API calls simultaneously)
- Loading state with a subtle animation while data fetches

**Data source transparency:**
- Small footer showing which data points are live API vs manually entered
- Each manually-entered field has a small edit pencil icon — clicking opens an inline edit field

**Historical log:**
- Store the last 10 "snapshot" readings in localStorage with timestamps
- A small "History" toggle that shows a simple table of past overall scores
- This lets the user see: "3 weeks ago score was 71, today it's 44 — things are deteriorating"

**Sharing:**
- A "Export Snapshot" button that generates a clean PNG or PDF summary of the current reading — like a one-page briefing the user can save or share

---

## FREE APIs TO USE

Use these free APIs (no API key required or free tier with key):

1. **Yahoo Finance (unofficial)** — for ASX200, S&P500, VIX, Gold, Oil, BTC, Treasury yields
   - Base URL: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
   - Symbols: ^AXJO, ^GSPC, ^VIX, GC=F, CL=F, ^TNX, BTC-USD

2. **CoinGecko** (no key needed) — for Bitcoin price
   - `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`

3. **ExchangeRate-API** (free tier) — for AUD/USD
   - `https://open.er-api.com/v6/latest/USD`

4. **All other indicators** — manually updatable fields with localStorage persistence

Handle CORS issues gracefully — if a direct API call fails due to CORS, show the manual input field instead with a note "Live data unavailable — please update manually."

---

## TONE AND PHILOSOPHY NOTES

This dashboard is built on a specific investment philosophy — embed it throughout:

- Data beats headlines. The numbers tell the truth; the news tells a story.
- Mr Market is emotional. You are rational. That is your edge.
- The best investments are made when the dashboard is red and the news is terrifying.
- The worst investments are made when the dashboard is green and everyone is excited.
- CGT awareness is part of intelligent investing — protect gains legally and systematically.
- DCA through volatility. Never stop the plan because of fear.

These principles should be visible somewhere on the dashboard — perhaps as rotating quotes in a small ticker or sidebar, not intrusive but present as a constant reminder.

---

## FINAL DELIVERABLE

A single `market_dashboard.html` file that:
- Opens in any modern browser
- Works on desktop and mobile
- Fetches live data on demand when the user clicks Refresh
- Stores all manual inputs and history in localStorage
- Looks exceptional — like something a serious private investor built for themselves, not a generic fintech template
- Reminds the user of the investment philosophy every time they look at it

The file should be fully self-contained and require no server, no installation, no API keys for the core functionality.
