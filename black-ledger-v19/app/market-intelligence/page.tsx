'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Feed = { status: string; provider?: string; items?: any[] };

export default function MarketIntelligence() {
  const [calendar, setCalendar] = useState<Feed | null>(null);
  const [news, setNews] = useState<Feed | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/market-intelligence?view=calendar').then(r=>r.json()),
      fetch('/api/market-intelligence?view=news').then(r=>r.json())
    ]).then(([cal, headlines]) => {
      setCalendar(cal);
      setNews(headlines);
    });
  }, []);

  return (
    <div className="wrap">
      <nav className="nav">
        <Link className="brand" href="/">BLACK LEDGER</Link>
        <div className="navact"><Link href="/dashboard">Dashboard</Link></div>
      </nav>

      <main className="miWrap">
        <div className="eyebrow">Market Intelligence</div>
        <h1 className="mainTitle">What the market is waiting for.</h1>
        <div className="miGrid">
          <section>
            <div className="panel">
              <h3>Economic calendar</h3>
              <p>{calendar?.status === 'live' ? `Live via ${calendar.provider}` : 'Provider ready to connect. No fabricated calendar data is shown.'}</p>
            </div>
            {(calendar?.items || []).slice(0,12).map((item:any) => (
              <div className="methodRow" key={item.id}>
                <b className="currency">{item.currency || '—'}</b>
                <div><h3>{item.event}</h3><p>{item.date || ''}</p></div>
                <div className="tag">{item.actual ?? '—'} / {item.forecast ?? '—'}</div>
              </div>
            ))}
          </section>

          <aside className="newsRail">
            <h3>Market news</h3>
            {news?.status !== 'live' && <p className="muted">News provider ready to connect.</p>}
            {(news?.items || []).slice(0,10).map((item:any) => (
              <article className="newsItem" key={item.id}>
                <h4>{item.headline}</h4>
                <p>{item.source}</p>
              </article>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
}
