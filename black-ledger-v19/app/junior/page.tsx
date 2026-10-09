'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { getNextQuestion, juniorLessons, type JuniorLesson } from '@/lib/junior-curriculum';
import './junior.css';

type Learner = { id: string; display_name: string };
type AnswerEvent = {
  attempt_id: string;
  learner_id: string;
  lesson_id: string;
  question_id: string;
  difficulty: number;
  selected_choice: number;
  is_correct: boolean;
  answer_number: number;
  elapsed_ms: number;
  created_at?: string;
};
type Screen = 'pick' | 'home' | 'lesson';

function percent(items: boolean[]) {
  return items.length ? Math.round(100 * items.filter(Boolean).length / items.length) : 0;
}

export default function JuniorPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [guardianId, setGuardianId] = useState<string | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [learner, setLearner] = useState<Learner | null>(null);
  const [alias, setAlias] = useState('');
  const [history, setHistory] = useState<AnswerEvent[]>([]);
  const [screen, setScreen] = useState<Screen>('pick');
  const [lessonId, setLessonId] = useState(juniorLessons[0].id);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState('');
  const [answerCount, setAnswerCount] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [lastChoice, setLastChoice] = useState<number | null>(null);
  const [wrongChoices, setWrongChoices] = useState<number[]>([]);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function initialize() {
      const client = getSupabaseBrowser();
      if (client) {
        const { data, error: authError } = await client.auth.getUser();
        if (!active) return;
        if (authError || !data.user) {
          router.replace('/login');
          return;
        }
        setGuardianId(data.user.id);
        setCloudEnabled(true);
        const result = await client.from('junior_learners').select('id,display_name').order('created_at', { ascending: true });
        if (!active) return;
        if (result.error) setError('Junior storage is not configured yet. The parent account needs the Junior database migration.');
        else setLearners((result.data || []) as Learner[]);
      } else {
        if (!localStorage.getItem('bl-v19-session')) {
          router.replace('/login');
          return;
        }
      }
      if (active) setReady(true);
    }
    void initialize();
    return () => { active = false; };
  }, [router]);

  const firstAttempts = useMemo(() => history.filter(event => event.answer_number === 1), [history]);
  const completed = useMemo(() => new Set(history.filter(event => event.is_correct).map(event => event.question_id)), [history]);
  const accuracy = percent(firstAttempts.map(event => event.is_correct));
  const completedAnswers = history.filter(event => event.is_correct);
  const avgSeconds = completedAnswers.length
    ? Math.round(completedAnswers.reduce((total, event) => total + event.elapsed_ms, 0) / completedAnswers.length / 1000)
    : null;
  const improvement = firstAttempts.length >= 6
    ? percent(firstAttempts.slice(-3).map(item => item.is_correct)) - percent(firstAttempts.slice(0, 3).map(item => item.is_correct))
    : null;

  const lesson = juniorLessons.find(item => item.id === lessonId) || juniorLessons[0];
  const question = lesson.questions.find(item => item.id === questionId) || null;
  const lessonFinished = lesson.questions.every(item => completed.has(item.id));
  const attemptsForLesson = (target: JuniorLesson) => firstAttempts
    .filter(item => item.lesson_id === target.id)
    .map(item => item.is_correct);

  function newQuestion(nextId: string | null) {
    setQuestionId(nextId);
    setAttemptId(crypto.randomUUID());
    setAnswerCount(0);
    setLastChoice(null);
    setWrongChoices([]);
    setAnsweredCorrectly(false);
    setStartedAt(Date.now());
  }

  function openLesson(target: JuniorLesson) {
    setLessonId(target.id);
    const next = getNextQuestion(target, completed, attemptsForLesson(target));
    newQuestion(next?.id || null);
    setScreen('lesson');
    setError('');
  }

  function continueLesson() {
    const next = getNextQuestion(lesson, completed, attemptsForLesson(lesson));
    newQuestion(next?.id || null);
  }

  async function selectLearner(profile: Learner) {
    setBusy(true);
    setError('');
    const client = getSupabaseBrowser();
    if (client && guardianId) {
      const result = await client.from('junior_answer_events')
        .select('attempt_id,learner_id,lesson_id,question_id,difficulty,selected_choice,is_correct,answer_number,elapsed_ms,created_at')
        .eq('learner_id', profile.id)
        .order('created_at', { ascending: true })
        .limit(5000);
      if (result.error) {
        setError('Learning history could not be loaded. Check the Junior database setup.');
        setBusy(false);
        return;
      }
      setHistory((result.data || []) as AnswerEvent[]);
    } else setHistory([]);
    setLearner(profile);
    setScreen('home');
    setBusy(false);
  }

  async function addLearner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = alias.trim().slice(0, 24);
    if (name.length < 2) {
      setError('Use a nickname with at least two characters.');
      return;
    }
    setBusy(true);
    setError('');
    const client = getSupabaseBrowser();
    let profile: Learner;
    if (client && guardianId) {
      const result = await client.from('junior_learners')
        .insert({ guardian_id: guardianId, display_name: name })
        .select('id,display_name')
        .single();
      if (result.error || !result.data) {
        setError('Could not save this learner. Make sure the Junior database migration is installed.');
        setBusy(false);
        return;
      }
      profile = result.data as Learner;
    } else {
      profile = { id: 'preview-' + crypto.randomUUID(), display_name: name };
    }
    setLearners(previous => [...previous, profile]);
    setAlias('');
    setBusy(false);
    await selectLearner(profile);
  }

  async function chooseAnswer(index: number) {
    if (!question || !learner || busy || answeredCorrectly || wrongChoices.includes(index)) return;
    const answerNumber = answerCount + 1;
    const correct = index === question.correctIndex;
    const record: AnswerEvent = {
      attempt_id: attemptId,
      learner_id: learner.id,
      lesson_id: lesson.id,
      question_id: question.id,
      difficulty: question.level,
      selected_choice: index,
      is_correct: correct,
      answer_number: answerNumber,
      elapsed_ms: Math.max(0, Date.now() - startedAt)
    };
    setBusy(true);
    setError('');
    const client = getSupabaseBrowser();
    if (client && guardianId) {
      const { error: insertError } = await client.from('junior_answer_events')
        .insert({ ...record, guardian_id: guardianId });
      if (insertError) {
        setError('That answer was not saved. Please try again before moving on.');
        setBusy(false);
        return;
      }
    }
    setHistory(previous => [...previous, record]);
    setAnswerCount(answerNumber);
    setLastChoice(index);
    if (correct) setAnsweredCorrectly(true);
    else setWrongChoices(previous => [...previous, index]);
    setBusy(false);
  }

  if (!ready) return <main className="jr jrLoading">Opening Black Ledger Junior…</main>;

  return (
    <div className="jr">
      <header className="jrBar">
        <div className="jrBarInner">
          <Link href="/dashboard" className="jrBrand">BLACK LEDGER <span>JUNIOR</span></Link>
          <div className="jrRight">
            {learner && <button className="jrTextButton" onClick={() => { setScreen('home'); setError(''); }}>{learner.display_name}&apos;s space</button>}
            <Link className="jrTextButton" href="/dashboard">Adult dashboard ↗</Link>
          </div>
        </div>
      </header>
      <div className="jrShell">
        {!cloudEnabled && (
          <div className="jrBanner" role="status">
            <strong>Practice preview:</strong> This browser is not connected to Supabase. Answers work for this visit only and do not save across devices.
          </div>
        )}
        {error && <div className="jrError" role="alert">{error}</div>}

        {screen === 'pick' && (
          <main className="jrEntry">
            <span className="jrKicker">WELCOME TO BLACK LEDGER JUNIOR</span>
            <h1>Big money ideas.<br/><em>Kid-sized steps.</em></h1>
            <p>This is your practice space. No real money, no complicated words, and no rushing.</p>
            <h2>Who&apos;s learning today?</h2>
            <div className="jrProfiles">
              {learners.map((profile, index) => (
                <button key={profile.id} disabled={busy} onClick={() => void selectLearner(profile)} className="jrProfile">
                  <span className="jrAvatar">{['★', '◆', '●', '✦'][index % 4]}</span>
                  <strong>{profile.display_name}</strong>
                  <span>Open my space →</span>
                </button>
              ))}
            </div>
            <form className="jrAdd" onSubmit={event => void addLearner(event)}>
              <label htmlFor="jrAlias">Add a learner using a nickname, not a full name</label>
              <div className="jrAddRow">
                <input id="jrAlias" maxLength={24} minLength={2} placeholder="Example: FutureTrader" value={alias} onChange={event => setAlias(event.target.value)} required />
                <button disabled={busy} type="submit">Add learner</button>
              </div>
            </form>
            <p className="jrFine">Learner profiles are managed through an adult account. Independent child sign-in and school rosters are not enabled yet.</p>
          </main>
        )}

        {screen === 'home' && learner && (
          <main className="jrHome">
            <div className="jrTopline">
              <span className="jrKicker">YOUR LEARNING HQ</span>
              <button className="jrTextButton" onClick={() => { setScreen('pick'); setLearner(null); setHistory([]); }}>Switch learner ↗</button>
            </div>
            <h1>Hey, {learner.display_name}.<br/><em>Ready to level up?</em></h1>
            <p className="jrIntro">Learn one thing, try it yourself, then find out why the answer works. Your first tries matter because they show how you&apos;re growing.</p>
            <section className="jrStats" aria-label="My learning ledger summary">
              <div><span>FIRST-TRY ACCURACY</span><strong>{firstAttempts.length ? accuracy + '%' : 'New'}</strong><small>{firstAttempts.length} questions tried</small></div>
              <div><span>AVERAGE TIME TO GET IT</span><strong>{avgSeconds === null ? '—' : avgSeconds + 's'}</strong><small>Includes time spent correcting answers</small></div>
              <div><span>ACCURACY TREND</span><strong>{improvement === null ? 'Building' : (improvement > 0 ? '+' : '') + improvement + ' pts'}</strong><small>{improvement === null ? 'Answer 6 questions to see a trend' : 'Recent 3 vs. first 3 questions'}</small></div>
            </section>
            <div className="jrSectionHeading"><h2>Pick your next mission</h2><p>Start anywhere. The questions get harder as you learn.</p></div>
            <div className="jrLessonList">
              {juniorLessons.map((item, index) => {
                const done = item.questions.filter(entry => completed.has(entry.id)).length;
                return (
                  <button key={item.id} className="jrLesson" onClick={() => openLesson(item)}>
                    <span className={'jrLessonIcon jrColor' + index}>{['◈', '↗', '◎'][index]}</span>
                    <span className="jrLessonCopy"><strong>{item.title}</strong><small>{item.subtitle}</small><span className="jrTrack"><i style={{ width: (done / item.questions.length * 100) + '%' }} /></span></span>
                    <span className="jrLessonProgress">{done}/{item.questions.length}<br/>done</span>
                    <span className="jrLessonArrow">→</span>
                  </button>
                );
              })}
            </div>
            <section className="jrLedger">
              <div className="jrSectionHeading"><h2>My Learning Ledger</h2><p>Every answer counts, even the ones you fixed.</p></div>
              {history.length === 0 ? <p className="jrEmpty">Your learning story starts with your first question.</p> : (
                <div className="jrTableScroll">
                  <table>
                    <thead><tr><th>Question</th><th>Answer #</th><th>Result</th><th>Time so far</th></tr></thead>
                    <tbody>{history.slice(-10).reverse().map((item, index) => (
                      <tr key={item.attempt_id + '-' + item.answer_number + '-' + index}>
                        <td>{item.question_id.replace('-', ' #')}</td>
                        <td>{item.answer_number === 1 ? 'First try' : 'Correction ' + (item.answer_number - 1)}</td>
                        <td><strong className={item.is_correct ? 'jrYes' : 'jrNo'}>{item.is_correct ? 'Got it' : 'Keep learning'}</strong></td>
                        <td>{Math.round(item.elapsed_ms / 1000)}s</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </section>
            <p className="jrFine">For learning only. There is no real-money trading in Junior.</p>
          </main>
        )}

        {screen === 'lesson' && learner && (
          <main className="jrClass">
            <button className="jrBack" onClick={() => { setScreen('home'); setError(''); }}>← My missions</button>
            <div className="jrClassHead">
              <div><span className="jrKicker">MISSION · {lesson.title.toUpperCase()}</span><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></div>
              <div className="jrPill">{lesson.questions.filter(item => completed.has(item.id)).length} of {lesson.questions.length} complete</div>
            </div>
            <div className="jrTeach"><span>💡 HERE&apos;S THE IDEA</span><p>{lesson.analogy}</p><strong>Remember: {lesson.remember}</strong></div>
            {question && !lessonFinished ? (
              <section className="jrPractice" aria-labelledby="jrQuestion">
                <div className="jrQuestionLabel"><span>YOUR TURN</span><span>{question.level === 1 ? 'Starter' : question.level === 2 ? 'Explorer' : 'Challenge'} level</span></div>
                <h2 id="jrQuestion">{question.prompt}</h2>
                <div className="jrChoices">
                  {question.choices.map((choice, index) => (
                    <button key={index} type="button" disabled={busy || answeredCorrectly || wrongChoices.includes(index)}
                      onClick={() => void chooseAnswer(index)}
                      className={[lastChoice === index && answeredCorrectly ? 'jrChoiceCorrect' : '', wrongChoices.includes(index) ? 'jrChoiceWrong' : ''].join(' ')}>
                      <b>{String.fromCharCode(65 + index)}</b><span>{choice}</span><span aria-hidden="true">{wrongChoices.includes(index) ? '↺' : lastChoice === index && answeredCorrectly ? '✓' : '→'}</span>
                    </button>
                  ))}
                </div>
                {lastChoice !== null && !answeredCorrectly && <div className="jrFeedback" role="status">Good try. That one isn&apos;t right yet. Read the idea above and choose again.</div>}
                {answeredCorrectly && <div className="jrFeedback jrFeedbackGood" role="status"><strong>That&apos;s it!</strong> {question.explanation}<br/><button onClick={continueLesson}>Next question →</button></div>}
                <p className="jrFine">You can change your mind. We track the first answer and how you improved, not just the final score.</p>
              </section>
            ) : (
              <section className="jrComplete">
                <div className="jrCompleteIcon">✦</div>
                <h2>Mission complete!</h2>
                <p>You finished this mission. Come back anytime to review what you learned.</p>
                <button onClick={() => setScreen('home')}>See my Learning Ledger →</button>
              </section>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
