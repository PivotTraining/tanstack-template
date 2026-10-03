import { NextRequest, NextResponse } from 'next/server';

const noStore = { 'Cache-Control': 'no-store' };

async function getJson(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);
  try {
    const response = await fetch(url, { signal: controller.signal, next: { revalidate: 60 } });
    if (!response.ok) throw new Error(`Provider ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get('view') || 'ticker';

  try {
    if (view === 'calendar') {
      const key = process.env.TRADING_ECONOMICS_API_KEY;
      if (!key) return NextResponse.json({ view, status: 'unconfigured', provider: 'Trading Economics', items: [] }, { headers: noStore });
      const raw = await getJson(`https://api.tradingeconomics.com/calendar?c=${encodeURIComponent(key)}&f=json`);
      const items = (Array.isArray(raw) ? raw : []).slice(0,180).map((r:any)=>({
        id: String(r.CalendarId ?? `${r.Date}-${r.Event}`),
        date: r.Date,
        country: r.Country,
        currency: r.Currency,
        event: r.Event ?? r.Category,
        importance: Number(r.Importance ?? 1),
        actual: r.Actual ?? null,
        previous: r.Previous ?? null,
        forecast: r.Forecast ?? null,
        source: r.Source ?? ''
      }));
      return NextResponse.json({ view, status: 'live', provider: 'Trading Economics', items });
    }

    if (view === 'news') {
      const key = process.env.FINNHUB_API_KEY;
      if (!key) return NextResponse.json({ view, status: 'unconfigured', provider: 'Finnhub', items: [] }, { headers: noStore });
      const raw = await getJson(`https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(key)}`);
      const items = (Array.isArray(raw) ? raw : []).slice(0,45).map((r:any)=>({
        id: String(r.id ?? r.url),
        headline: r.headline,
        summary: r.summary,
        source: r.source,
        url: r.url,
        datetime: r.datetime
      }));
      return NextResponse.json({ view, status: 'live', provider: 'Finnhub', items });
    }

    if (view === 'ticker') {
      const key = process.env.TWELVE_DATA_API_KEY;
      const symbols = ['EUR/USD','GBP/USD','USD/JPY','AUD/USD','XAU/USD','BTC/USD','SPY','QQQ'];
      if (!key) return NextResponse.json({ view, status: 'unconfigured', provider: 'Twelve Data', symbols, items: [] }, { headers: noStore });
      const raw = await getJson(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(','))}&apikey=${encodeURIComponent(key)}`);
      const items = symbols.map(symbol => {
        const r = raw?.[symbol];
        return r && !r.code ? {
          symbol,
          price: Number(r.close ?? r.price),
          change: Number(r.change),
          percentChange: Number(r.percent_change)
        } : null;
      }).filter(Boolean);
      return NextResponse.json({ view, status: 'live', provider: 'Twelve Data', items });
    }

    return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
  } catch (error:any) {
    return NextResponse.json({ view, status: 'provider_error', items: [], message: error?.message || 'Provider unavailable' }, { headers: noStore });
  }
}
