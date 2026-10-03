import Link from 'next/link';

const pairs = ['EUR/USD','GBP/USD','USD/JPY','XAU/USD','BTC/USD','SPY','QQQ'];

export default function Home() {
  return (
    <>
      <div className="wrap">
        <nav className="nav">
          <Link className="brand" href="/">BLACK LEDGER</Link>
          <div className="navlinks">
            <Link href="#method">How it works</Link>
            <Link href="/market-intelligence">Market Intelligence</Link>
            <Link href="/academy">Academy</Link>
          </div>
          <div className="navact">
            <Link href="/login">Log in</Link>
            <Link className="btn dark" href="/login?mode=signup">Start learning</Link>
          </div>
        </nav>
      </div>
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="eyebrow">Guided trading education</div>
            <h1>Learn the market.<br/>Practice the skill.<br/>Prove you understand it.</h1>
            <p>Black Ledger builds a learning path around what you already know, teaches one competency at a time, and lets you practice before real money is at risk.</p>
            <div className="heroActions">
              <Link className="btn dark" href="/login?mode=signup">Build my learning path</Link>
              <Link className="btn" href="/market-intelligence">Market intelligence</Link>
            </div>
          </div>
        </section>

        <section className="section" id="method">
          <div className="wrap">
            <div className="sectionGrid">
              <div>
                <div className="eyebrow">The Black Ledger method</div>
                <h2>A path, not a pile of content.</h2>
              </div>
              <p style={{color:'#67645e',margin:0,lineHeight:1.8}}>Placement, instruction, practice, knowledge checks, and mastery gates keep the learner moving through a deliberate sequence instead of guessing what to click next.</p>
            </div>
            <div className="method" style={{marginTop:44}}>
              {[
                ['01','Assess what you already know.','Placement'],
                ['02','Learn one competency at a time.','Instruction'],
                ['03','Practice the decision, not just the definition.','Application'],
                ['04','Prove understanding before advancement.','Mastery']
              ].map(([n,t,g]) => (
                <div className="methodRow" key={n}>
                  <b>{n}</b>
                  <div><h3>{t}</h3><p>Every step creates evidence of understanding and a clear next action.</p></div>
                  <div className="tag">{g}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="darkSection">
          <div className="wrap">
            <div className="sectionGrid">
              <div>
                <div className="eyebrow darkEyebrow">Market Intelligence</div>
                <h2>Know what the market is waiting for.</h2>
              </div>
              <p className="lead">Economic events, actual versus forecast data, market-moving news, and a live ticker sit inside the learning environment so context is taught alongside mechanics.</p>
            </div>
            <div className="darkTable">
              <div className="event"><span>8:30 AM</span><span>USD</span><span>High-impact U.S. release</span><span>—</span><span>—</span><span>—</span></div>
              <div className="event"><span>10:00 AM</span><span>USD</span><span>Medium-impact U.S. release</span><span>—</span><span>—</span><span>—</span></div>
            </div>
          </div>
        </section>

        <div className="ticker">
          <div className="tickerInner">
            {[...pairs,...pairs].map((p,i)=><span key={i}><strong>{p}</strong>&nbsp;&nbsp;feed ready</span>)}
          </div>
        </div>

        <section className="section">
          <div className="wrap">
            <div className="sectionGrid">
              <div><div className="eyebrow">The Practice Desk</div><h2>Grade the decision, not the luck.</h2></div>
              <p style={{color:'#67645e',margin:0,lineHeight:1.8}}>A profitable simulated trade can still be a poor decision. Black Ledger separates process quality from outcome so discipline is reinforced instead of gambling psychology.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap"><strong>BLACK LEDGER</strong><div style={{marginTop:12}}>Educational use only. No guarantees of profit or personalized investment advice.</div></div>
      </footer>
    </>
  );
}
