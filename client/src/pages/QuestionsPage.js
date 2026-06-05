import { useState, useEffect, useCallback } from 'react';
import NotesList from '../components/NotesList';
import api from '../api';
import { useClass } from '../context/ClassContext';
import {
  HiPencilAlt, HiLightningBolt, HiBookOpen, HiCheckCircle,
  HiXCircle, HiArrowRight, HiRefresh, HiStar, HiChevronDown,
  HiFilter, HiPlay, HiClock
} from 'react-icons/hi';

export default function QuestionsPage() {
  const [tab, setTab] = useState('notes');
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        <TabBtn active={tab === 'notes'} onClick={() => setTab('notes')} Icon={HiPencilAlt}>
          Practice Q&amp;A
        </TabBtn>
        <TabBtn active={tab === 'quiz'} onClick={() => setTab('quiz')} Icon={HiLightningBolt}>
          <span className="flex items-center gap-1.5">
            Quiz Modules
            <span className="hidden sm:inline-flex items-center gap-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              ⚡ NEW
            </span>
          </span>
        </TabBtn>
      </div>

      {tab === 'notes' ? <NotesList type="question" /> : <QuizSection />}
    </div>
  );
}

function TabBtn({ active, onClick, Icon, children }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap
        ${active ? 'border-violet-600 text-violet-700 bg-violet-50 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

/* ─────────────────── QUIZ SECTION ─────────────────── */
function QuizSection() {
  const { selectedClass } = useClass();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null); // { module, questions }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClass) params.class = selectedClass;
      if (subject) params.subject = subject;
      const { data } = await api.get('/quiz', { params });
      setModules(data);
    } catch { /* silent */ }
    setLoading(false);
  }, [selectedClass, subject]);

  useEffect(() => { load(); }, [load]);

  if (activeQuiz) {
    return <QuizGame module={activeQuiz.module} questions={activeQuiz.questions}
      onExit={() => setActiveQuiz(null)} />;
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <HiFilter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input placeholder="Filter by subject..." value={subject}
          onChange={e => setSubject(e.target.value)}
          className="input-field py-2 text-sm flex-1" />
      </div>

      {loading ? <Spinner /> : modules.length === 0 ? <EmptyQuiz /> : (
        <div className="space-y-3">
          {modules.map(m => (
            <ModuleCard key={m._id} module={m} onStart={async () => {
              try {
                const { data } = await api.get(`/quiz/${m._id}/questions`);
                setActiveQuiz({ module: m, questions: data });
              } catch { alert('Could not load questions. Try again.'); }
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({ module: m, onStart }) {
  return (
    <div className="card border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
      <div className="p-4 sm:p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white font-bold text-base">{m.chapterNumber || '#'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug truncate">{m.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{m.chapter} · {m.subject} · Class {m.class}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-violet-600 font-semibold bg-violet-50 px-2 py-0.5 rounded-full">
              <HiBookOpen className="w-3 h-3" /> {m.questionCount} Qs
            </span>
            {m.description && (
              <span className="text-[11px] text-gray-400 truncate">{m.description}</span>
            )}
          </div>
        </div>
        <button onClick={onStart}
          className="flex-shrink-0 flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm touch-manipulation">
          <HiPlay className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── QUIZ GAME ─────────────────── */
function QuizGame({ module: m, questions, onExit }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);   // for MCQ: option index
  const [fillValue, setFillValue] = useState('');   // for fill-in
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);       // {correct, answer}
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timer, setTimer] = useState(0);

  // Timer
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTimer(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  const q = questions[idx];
  const isMCQ = q.type === 'mcq' || !q.type;
  const isFill = q.type === 'fill';

  const checkAnswer = () => {
    let correct = false;
    if (isMCQ) correct = selected === q.answer;
    if (isFill) correct = fillValue.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
    setRevealed(true);
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    setBestStreak(s => Math.max(s, newStreak));
    if (correct) setScore(s => s + 1);
    setResults(r => [...r, { correct, userAnswer: isMCQ ? q.options?.[selected] : fillValue }]);
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setFillValue('');
    setRevealed(false);
  };

  const restart = () => {
    setIdx(0); setSelected(null); setFillValue('');
    setRevealed(false); setScore(0); setDone(false);
    setResults([]); setStreak(0); setBestStreak(0); setTimer(0);
  };

  const pct = Math.round((score / questions.length) * 100);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (done) return (
    <ResultScreen score={score} total={questions.length} pct={pct}
      bestStreak={bestStreak} time={fmt(timer)} results={results} questions={questions}
      onRestart={restart} onExit={onExit} moduleTitle={m.title} />
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit}
          className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg font-medium transition-colors">
          ← Exit
        </button>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-100">
            <HiClock className="w-3.5 h-3.5" /> {fmt(timer)}
          </span>
          {streak >= 2 && (
            <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-full border border-orange-100 animate-bounce">
              🔥 {streak}x
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
          <span>Question {idx + 1} of {questions.length}</span>
          <span className="text-violet-600 font-semibold">Score: {score}/{idx}</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
        </div>
        <div className="flex gap-1 mt-2">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
              i < results.length
                ? results[i].correct ? 'bg-green-400' : 'bg-red-400'
                : i === idx ? 'bg-violet-400' : 'bg-gray-200'
            }`} />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="card border border-gray-100 overflow-hidden shadow-sm">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
        <div className="p-5 sm:p-6">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              isFill ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-violet-50 text-violet-600 border border-violet-100'
            }`}>
              {isFill ? '✏️ Fill in the Blank' : '🎯 Multiple Choice'}
            </span>
            {q.chapter && (
              <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{q.chapter}</span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug mb-5">{q.question}</h2>

          {/* MCQ Options */}
          {isMCQ && q.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.answer;
                const isChosen  = i === selected;
                let cls = 'border-2 border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50';
                if (revealed) {
                  if (isCorrect) cls = 'border-2 border-green-400 bg-green-50 text-green-800';
                  else if (isChosen && !isCorrect) cls = 'border-2 border-red-400 bg-red-50 text-red-700';
                  else cls = 'border-2 border-gray-100 bg-gray-50 text-gray-400';
                } else if (isChosen) {
                  cls = 'border-2 border-violet-500 bg-violet-50 text-violet-800 shadow-sm';
                }
                return (
                  <button key={i} disabled={revealed}
                    onClick={() => setSelected(i)}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 text-left touch-manipulation ${cls}
                      ${!revealed ? 'active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}>
                    {/* Option label */}
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      revealed
                        ? isCorrect ? 'bg-green-400 text-white' : isChosen ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-400'
                        : isChosen ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {revealed && isCorrect && <HiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    {revealed && isChosen && !isCorrect && <HiXCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill in the blank */}
          {isFill && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Type your answer..."
                value={fillValue}
                onChange={e => setFillValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !revealed && fillValue.trim()) checkAnswer(); }}
                disabled={revealed}
                className={`input-field text-sm sm:text-base py-3 font-medium transition-colors ${
                  revealed
                    ? fillValue.trim().toLowerCase() === String(q.answer).trim().toLowerCase()
                      ? '!border-green-400 !bg-green-50 !text-green-800'
                      : '!border-red-400 !bg-red-50 !text-red-700'
                    : ''
                }`}
              />
              {revealed && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                  fillValue.trim().toLowerCase() === String(q.answer).trim().toLowerCase()
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {fillValue.trim().toLowerCase() === String(q.answer).trim().toLowerCase()
                    ? <><HiCheckCircle className="w-4 h-4 flex-shrink-0" /> Correct! 🎉</>
                    : <><HiXCircle className="w-4 h-4 flex-shrink-0" /> Correct answer: <strong>{q.answer}</strong></>
                  }
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {revealed && q.explanation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs sm:text-sm text-blue-700">
              💡 <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="px-5 pb-5 pt-0 flex items-center justify-between gap-3">
          {!revealed ? (
            <button
              disabled={isMCQ ? selected === null : !fillValue.trim()}
              onClick={checkAnswer}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors touch-manipulation">
              Check Answer
            </button>
          ) : (
            <button onClick={next}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm touch-manipulation">
              {idx + 1 >= questions.length ? '🏁 See Results' : 'Next Question'}
              <HiArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── RESULT SCREEN ─────────────────── */
function ResultScreen({ score, total, pct, bestStreak, time, results, questions, onRestart, onExit, moduleTitle }) {
  const grade = pct >= 80 ? { emoji: '🏆', label: 'Excellent!', cls: 'text-yellow-600' }
    : pct >= 60 ? { emoji: '👍', label: 'Good Job!', cls: 'text-green-600' }
    : pct >= 40 ? { emoji: '📚', label: 'Keep Practicing!', cls: 'text-blue-600' }
    : { emoji: '💪', label: 'Don\'t Give Up!', cls: 'text-red-600' };

  return (
    <div className="animate-fade-in">
      {/* Score card */}
      <div className="card border border-gray-100 overflow-hidden shadow-sm mb-4">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />
        <div className="p-6 text-center">
          <div className="text-5xl mb-2">{grade.emoji}</div>
          <h2 className={`text-2xl font-black mb-1 ${grade.cls}`}>{grade.label}</h2>
          <p className="text-sm text-gray-500 mb-5">{moduleTitle}</p>

          <div className="text-6xl font-black text-gray-900 mb-1">{pct}<span className="text-3xl text-gray-400">%</span></div>
          <p className="text-gray-500 text-sm mb-6">{score} correct out of {total}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Score', value: `${score}/${total}`, icon: '🎯', bg: 'bg-violet-50', txt: 'text-violet-700' },
              { label: 'Best Streak', value: `${bestStreak}🔥`, icon: '⚡', bg: 'bg-orange-50', txt: 'text-orange-700' },
              { label: 'Time', value: time, icon: '⏱️', bg: 'bg-blue-50', txt: 'text-blue-700' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className={`font-black text-sm ${s.txt}`}>{s.value}</div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors touch-manipulation">
              <HiRefresh className="w-4 h-4" /> Try Again
            </button>
            <button onClick={onExit}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors touch-manipulation">
              All Modules
            </button>
          </div>
        </div>
      </div>

      {/* Review */}
      <div className="card border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Answer Review</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {questions.map((q, i) => (
            <div key={i} className="px-5 py-3.5">
              <div className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${results[i]?.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                  {results[i]?.correct
                    ? <HiCheckCircle className="w-4 h-4 text-green-500" />
                    : <HiXCircle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{q.question}</p>
                  {!results[i]?.correct && (
                    <p className="text-xs text-green-700 mt-1 font-medium">
                      ✅ {q.options ? q.options[q.answer] : q.answer}
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-xs text-gray-400 mt-1">💡 {q.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );
}

function EmptyQuiz() {
  return (
    <div className="card border border-gray-100 py-16 px-6 flex flex-col items-center text-center">
      <div className="text-5xl mb-4">🎮</div>
      <h3 className="font-bold text-gray-700 mb-1">No Quiz Modules Yet</h3>
      <p className="text-gray-400 text-sm max-w-xs">Your teacher will add quiz modules soon. Check back later!</p>
    </div>
  );
}
