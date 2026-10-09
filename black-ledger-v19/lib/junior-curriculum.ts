export type JuniorLevel = 1 | 2 | 3;

export type JuniorQuestion = {
  id: string;
  level: JuniorLevel;
  prompt: string;
  choices: [string, string, string];
  correctIndex: number;
  explanation: string;
};

export type JuniorLesson = {
  id: string;
  title: string;
  subtitle: string;
  analogy: string;
  remember: string;
  questions: JuniorQuestion[];
};

export const juniorLessons: JuniorLesson[] = [
  {
    id: 'market',
    title: 'The Money Marketplace',
    subtitle: 'Start with what buying and selling really mean.',
    analogy: 'Think about a school fair. People have things to sell. Other people choose what to buy. A financial market also connects buyers and sellers, but they trade investments.',
    remember: 'A stock is a small piece of ownership in a company. Its price can go up or down.',
    questions: [
      { id: 'market-1', level: 1, prompt: 'What is a market?', choices: ['A place where people buy and sell', 'A video game score', 'A promise to get rich'], correctIndex: 0, explanation: 'A market connects people who want to buy with people who want to sell.' },
      { id: 'market-2', level: 1, prompt: 'What does one share of stock represent?', choices: ['A coupon for free food', 'A small piece of a company', 'Money the company promises to double'], correctIndex: 1, explanation: 'Owning stock means owning a small part of a company. It does not promise a profit.' },
      { id: 'market-3', level: 2, prompt: 'More people want to buy a stock than sell it at today’s price. What might happen?', choices: ['The price could rise', 'The price must stay the same', 'Everyone earns money'], correctIndex: 0, explanation: 'More demand can push the price higher, but market prices are never guaranteed.' },
      { id: 'market-4', level: 2, prompt: 'A share drops from $20 to $15. What happened?', choices: ['Its price went up $5', 'Its price went down $5', 'It is now free'], correctIndex: 1, explanation: '20 minus 15 equals 5. The share lost $5 in price.' },
      { id: 'market-5', level: 3, prompt: 'Two friends both buy a stock. Can one sell at a loss and the other at a gain?', choices: ['No, everyone gets the same result', 'Yes, they may buy and sell at different prices', 'Only on Tuesdays'], correctIndex: 1, explanation: 'Entry and exit prices matter. Two people can have very different outcomes.' },
      { id: 'market-6', level: 3, prompt: 'A popular company has a rising stock price. What can you safely conclude?', choices: ['It will rise forever', 'Buying it is risk-free', 'Its recent price rose, but the future is unknown'], correctIndex: 2, explanation: 'Past price moves do not tell us for sure what will happen next.' }
    ]
  },
  {
    id: 'charts',
    title: 'Chart Detective',
    subtitle: 'Learn to read a picture of price over time.',
    analogy: 'A chart is like tracking your height on a wall. The marks show where something was at different times, not where it has to go next.',
    remember: 'Across the bottom is time. Up and down shows price. A line or candle shows what happened, not what is guaranteed.',
    questions: [
      { id: 'charts-1', level: 1, prompt: 'What does a price chart usually show?', choices: ['How a price changed over time', 'A secret answer key', 'How rich a trader is'], correctIndex: 0, explanation: 'A chart records prices over a period of time.' },
      { id: 'charts-2', level: 1, prompt: 'On a common price chart, what does left to right usually show?', choices: ['People watching', 'Time passing', 'Bank accounts'], correctIndex: 1, explanation: 'Time usually moves from left to right.' },
      { id: 'charts-3', level: 2, prompt: 'A line moves from $8 to $12. What is true?', choices: ['Price went up $4', 'Price fell $4', 'Price stayed the same'], correctIndex: 0, explanation: '12 minus 8 equals 4. The line shows a $4 increase.' },
      { id: 'charts-4', level: 2, prompt: 'A chart has climbed for five days. What happens on day six?', choices: ['It must go up', 'We cannot know for sure', 'It must go down'], correctIndex: 1, explanation: 'A trend is a clue about the past, not a promise about the next day.' },
      { id: 'charts-5', level: 3, prompt: 'One chart covers one hour. Another covers one year. Why might they look different?', choices: ['They cover different amounts of time', 'One must be fake', 'Prices only move each year'], correctIndex: 0, explanation: 'The timeframe changes which price moves we can see.' },
      { id: 'charts-6', level: 3, prompt: 'Your practice chart suddenly drops. Which response shows good thinking?', choices: ['Guess that it will bounce', 'Pause, look for context, and follow your practice rules', 'Keep clicking buy until it rises'], correctIndex: 1, explanation: 'Careful observation and a plan beat guessing.' }
    ]
  },
  {
    id: 'risk',
    title: 'The Smart Decision Lab',
    subtitle: 'Learn why protecting your money matters.',
    analogy: 'Think of a soccer goalkeeper. Scoring goals matters, but protecting the net matters too. Good traders pay attention to risk before any possible reward.',
    remember: 'Practice with pretend money. Never trade real money just because a chart looks exciting.',
    questions: [
      { id: 'risk-1', level: 1, prompt: 'What is paper trading?', choices: ['Trading with pretend money to practice', 'Buying paper at the store', 'A guaranteed way to earn money'], correctIndex: 0, explanation: 'Paper trading simulates choices without risking real money.' },
      { id: 'risk-2', level: 1, prompt: 'Can investments lose value?', choices: ['Never', 'Only if you make a typo', 'Yes'], correctIndex: 2, explanation: 'Prices can go down, and people can lose money.' },
      { id: 'risk-3', level: 2, prompt: 'A friend says a trade is guaranteed to double. What should you think?', choices: ['That promise is a warning sign', 'It must be true', 'Borrow money immediately'], correctIndex: 0, explanation: 'No market investment comes with a guaranteed doubling of money.' },
      { id: 'risk-4', level: 2, prompt: 'Your practice plan says stop after two mistakes. You make two mistakes. What next?', choices: ['Keep going to win it back', 'Stop and review what happened', 'Hide the mistakes'], correctIndex: 1, explanation: 'Following your plan protects your decision-making.' },
      { id: 'risk-5', level: 3, prompt: 'Two practice trades earn the same amount. One used a clear plan and the other was a random guess. Which is stronger learning?', choices: ['The planned decision', 'The random guess', 'They teach exactly the same thing'], correctIndex: 0, explanation: 'We grade the quality of the decision, not just the result.' },
      { id: 'risk-6', level: 3, prompt: 'After a practice loss, which journal note will help you learn most?', choices: ['“I am bad at this.”', '“The market is unfair.”', '“I ignored my rule. Next time I will check it first.”'], correctIndex: 2, explanation: 'Specific observations and a next step help us improve.' }
    ]
  }
];

export function getNextQuestion(lesson: JuniorLesson, completed: Set<string>, firstAnswers: boolean[]) {
  const remaining = lesson.questions.filter(q => !completed.has(q.id));
  if (!remaining.length) return null;
  const foundation = Math.min(...remaining.map(q => q.level)) as JuniorLevel;
  const lastFour = firstAnswers.slice(-4);
  const accuracy = lastFour.filter(Boolean).length / (lastFour.length || 1);
  // Nudge stronger learners up one tier. Never skip unfinished questions permanently.
  const challengeLevel = lastFour.length === 4 && accuracy >= 0.75
    ? Math.min(3, foundation + 1)
    : foundation;
  return remaining.find(q => q.level === challengeLevel) || remaining[0];
}
