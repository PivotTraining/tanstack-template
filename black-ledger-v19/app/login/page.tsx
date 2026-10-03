'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function Login() {
  const query = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState(query.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) router.replace('/dashboard');
      });
    }
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    const supabase = getSupabaseBrowser();

    if (supabase) {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (mode === 'signup' && !result.data.session) {
        setMessage('Check your email to confirm your account.');
        return;
      }

      router.push('/dashboard');
      return;
    }

    const users = JSON.parse(localStorage.getItem('bl-v19-users') || '{}');
    if (mode === 'signup') {
      if (users[email]) {
        setMessage('An account already exists for this email.');
        return;
      }
      users[email] = { password };
      localStorage.setItem('bl-v19-users', JSON.stringify(users));
      localStorage.setItem('bl-v19-session', email);
      router.push('/dashboard');
      return;
    }

    if (!users[email] || users[email].password !== password) {
      setMessage('Email or password is incorrect.');
      return;
    }

    localStorage.setItem('bl-v19-session', email);
    router.push('/dashboard');
  }

  return (
    <div className="loginShell">
      <section className="loginBrand">
        <div className="brand">BLACK LEDGER</div>
        <h1>Build market skill before putting capital at risk.</h1>
        <div className="loginMeta">V19 · Vercel production architecture</div>
      </section>
      <section className="loginPanel">
        <form className="form" onSubmit={submit}>
          <h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
          <p>{mode === 'signup' ? 'Your Trading Inventory begins after signup.' : 'Continue your learning path.'}</p>
          <div className="field"><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div className="field"><label>Password</label><input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <button className="btn dark" type="submit">{mode === 'signup' ? 'Create account' : 'Log in'}</button>
          {message && <div className="notice">{message}</div>}
          <div className="notice">
            <button className="linkButton" type="button" onClick={()=>setMode(mode === 'signup' ? 'login' : 'signup')}>
              {mode === 'signup' ? 'Already have an account? Log in' : 'Need an account? Sign up'}
            </button>
          </div>
          <div className="notice">When Supabase environment variables are connected, this form automatically uses cloud authentication. Until then, it uses a browser-local transitional account.</div>
        </form>
      </section>
    </div>
  );
}
