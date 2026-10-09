'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) router.replace('/login');
        else setReady(true);
      });
    } else {
      if (!localStorage.getItem('bl-v19-session')) router.replace('/login');
      else setReady(true);
    }
  }, [router]);

  async function logout() {
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('bl-v19-session');
    router.push('/login');
  }

  if (!ready) return null;

  return (
    <div className="dash">
      <div className="wrap">
        <div className="dashHead"><div className="brand">BLACK LEDGER</div></div>
        <div className="dashGrid">
          <aside className="side">
            <Link className="active" href="/dashboard">Start Here</Link>
            <Link href="/academy">Academy</Link>
            <Link href="/junior">Black Ledger Junior</Link>
            <Link href="/market-intelligence">Market Intelligence</Link>
            <Link href="/legacy/member.html#screen-market">The Desk</Link>
            <Link href="/legacy/member.html#screen-journal">Journal</Link>
            <button onClick={logout} className="sideButton">Log out</button>
          </aside>
          <main>
            <div className="eyebrow">Your learning path</div>
            <h1 className="mainTitle">Continue where you left off.</h1>
            <div className="panel">
              <span className="status">V18 engine preserved</span>
              <h3>Guided academy</h3>
              <p>The full 800-lesson curriculum, practice workflows, exams, journal, and Decision Intelligence remain available during the V19 migration.</p>
              <div className="panelAction"><Link className="btn dark" href="/academy">Open academy</Link></div>
            </div>
            <div className="panel">
              <span className="status">Family learning preview</span>
              <h3>Black Ledger Junior</h3>
              <p>A simpler, kid-sized learning space with guardian-managed profiles, short lessons, adaptive challenges, and a first-answer learning ledger. Cloud storage requires the Junior Supabase migration.</p>
              <div className="panelAction"><Link className="btn dark" href="/junior">Open Junior</Link></div>
            </div>
            <div className="panel">
              <span className="status">Live context</span>
              <h3>Market Intelligence</h3>
              <p>Economic calendar, news, and ticker provider endpoints now live behind a Vercel API route.</p>
              <div className="panelAction"><Link className="btn" href="/market-intelligence">Open Market Intelligence</Link></div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
