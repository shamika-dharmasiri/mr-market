/**
 * Fetches all market data server-side (no CORS restrictions) and writes
 * data/market.json and data/market-data.js for the dashboard to consume.
 *
 * Run manually:  node scripts/fetch-market-data.mjs
 * Run via CI:    see .github/workflows/fetch-market-data.yml
 *
 * Requires Node.js 18+ (uses built-in fetch).
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE    = join(__dirname, '..', 'data', 'market.json');
const SEED_JS_FILE = join(__dirname, '..', 'data', 'market-data.js');

async function safeGet(url) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; mr-market-dashboard/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) { console.warn(`  HTTP ${r.status} for ${url}`); return null; }
    return await r.json();
  } catch (e) {
    console.warn(`  Failed: ${url} — ${e.message}`);
    return null;
  }
}

async function fetchYahoo(symbol) {
  const d = await safeGet(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
  );
  if (!d?.chart?.result?.[0]) return null;
  const meta = d.chart.result[0].meta;
  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose || meta.previousClose || price;
  return {
    price,
    changePct: ((price - prev) / prev) * 100,
    high52w: meta.fiftyTwoWeekHigh ?? null,
    low52w:  meta.fiftyTwoWeekLow  ?? null,
  };
}

// BLS public API — no key required, CORS-friendly (Access-Control-Allow-Origin: *)
async function fetchBls(seriesId) {
  const d = await safeGet(`https://api.bls.gov/publicAPI/v2/timeseries/data/${seriesId}`);
  const data = d?.Results?.series?.[0]?.data;
  if (!Array.isArray(data)) return null;
  const latest = data.find(e => e.value !== '-' && !isNaN(parseFloat(e.value)));
  return latest ? parseFloat(latest.value) : null;
}

// FRED CSV — no CORS headers, server-side only (no browser restrictions in Node.js)
async function fetchFredCsv(seriesId) {
  try {
    const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; mr-market-dashboard/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) { console.warn(`  HTTP ${r.status} for FRED ${seriesId}`); return null; }
    const text = await r.text();
    const lines = text.trim().split('\n').filter(l => l && !l.startsWith('DATE'));
    for (let i = lines.length - 1; i >= 0; i--) {
      const [, val] = lines[i].split(',');
      if (val && val.trim() !== '.' && !isNaN(parseFloat(val.trim()))) return parseFloat(val.trim());
    }
    return null;
  } catch (e) {
    console.warn(`  Failed: FRED ${seriesId} — ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('Fetching market data…');
  const indicators = {};

  // ── Yahoo Finance (price-based) ─────────────────────────────────────────────
  const yahooMap = {
    asx200:     '^AXJO',
    sp500:      '^GSPC',
    vix:        '^VIX',
    gold:       'GC=F',
    oil:        'CL=F',
    treasury10y: '^TNX',   // 10-year US Treasury yield (value = yield %, e.g. 4.35)
  };
  await Promise.all(
    Object.entries(yahooMap).map(async ([id, sym]) => {
      console.log(`  Yahoo Finance: ${sym}`);
      const res = await fetchYahoo(sym);
      if (res) indicators[id] = res;
    })
  );

  // ── AUD/USD ─────────────────────────────────────────────────────────────────
  console.log('  ExchangeRate-API: AUD/USD');
  const fx = await safeGet('https://open.er-api.com/v6/latest/USD');
  if (fx?.result === 'success' && fx.rates?.AUD) {
    indicators.audUsd = { price: 1 / fx.rates.AUD };
  }

  // ── Bitcoin ─────────────────────────────────────────────────────────────────
  console.log('  CoinGecko: BTC');
  const btc = await safeGet(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
  );
  if (btc?.bitcoin) {
    indicators.bitcoin = { price: btc.bitcoin.usd, change24h: btc.bitcoin.usd_24h_change };
  }

  // ── BLS (Bureau of Labor Statistics) — CORS-friendly, no key required ───────
  console.log('  BLS: US Unemployment (LNS14000000)');
  const unemp = await fetchBls('LNS14000000');
  if (unemp != null) indicators.usUnemployment = { price: unemp };

  // ── FRED CSV — server-side only (no CORS headers, blocked in browsers) ───────
  const fredMap = { fedRate: 'FEDFUNDS', usDebtGdp: 'GFDEGDQ188S' };
  await Promise.all(
    Object.entries(fredMap).map(async ([id, sid]) => {
      console.log(`  FRED CSV: ${sid}`);
      const val = await fetchFredCsv(sid);
      if (val != null) indicators[id] = { price: val };
    })
  );

  // ── Write output ─────────────────────────────────────────────────────────────
  const output = { fetched: new Date().toISOString(), indicators };
  mkdirSync(join(__dirname, '..', 'data'), { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(output, null, 2));
  // Also write a JS file loaded via <script src> — works from file:// unlike fetch()
  writeFileSync(SEED_JS_FILE,
    `// Auto-generated by scripts/fetch-market-data.mjs — ${output.fetched}\nwindow.MARKET_SEED_DATA = ${JSON.stringify(output, null, 2)};\n`
  );

  const expected = [...Object.keys(yahooMap), 'audUsd', 'bitcoin', 'usUnemployment', ...Object.keys(fredMap)];
  const fetched  = Object.keys(indicators);
  const missing  = expected.filter(k => !fetched.includes(k));

  console.log(`\n✓ Fetched: ${fetched.join(', ')}`);
  if (missing.length) console.warn(`✗ Missing: ${missing.join(', ')}`);
  console.log(`\nWritten to ${DATA_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
