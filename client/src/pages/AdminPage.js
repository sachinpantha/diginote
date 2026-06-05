import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  HiBookOpen, HiStar, HiBell, HiLightningBolt,
  HiUpload, HiTrash, HiLogout, HiShieldCheck,
  HiPlus, HiMinus, HiPencil, HiAdjustments,
  HiSwitchHorizontal, HiCheckCircle
} from 'react-icons/hi';

const CLASSES  = ['8', '9', '10'];
const SUBJECTS = ['Computer Science', 'Mathematics', 'Science', 'English', 'Nepali', 'Social Studies', 'Optional Math'];

const emptyNote   = { title: '', chapter: '', chapterNumber: '', subject: 'Computer Science', class: '10', content: '', type: 'note' };
const emptyNotice = { title: '', message: '', important: false, class: null };
const emptyMCQ    = { type: 'mcq',  question: '', options: ['', '', '', ''], answer: 0, explanation: '', chapter: '' };
const emptyFill   = { type: 'fill', question: '', answer: '', explanation: '', chapter: '' };
const emptyModule = { title: '', chapter: '', chapterNumber: '', subject: 'Computer Science', class: '10', description: '' };

const tabs = [
  { id: 'note',      Icon: HiBookOpen,      label: 'Chapter Notes',  shortLabel: 'Notes'  },
  { id: 'important', Icon: HiStar,          label: 'Important Notes', shortLabel: 'Imp.'   },
  { id: 'notice',    Icon: HiBell,          label: 'Notices',         shortLabel: 'Notice' },
  { id: 'quiz',      Icon: HiLightningBolt, label: 'Quiz Modules',    shortLabel: 'Quiz'   },
];

export default function AdminPage() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('note');
  const [noteForm, setNoteForm]     = useState(emptyNote);
  const [noticeForm, setNoticeForm] = useState(emptyNotice);
  const [file, setFile]             = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [recentNotes, setRecentNotes]     = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  const [moduleMeta, setModuleMeta] = useState(emptyModule);
  const [questions, setQuestions]   = useState([{ ...emptyMCQ }]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchRecent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab]);

  const fetchRecent = async () => {
    if (tab === 'notice') {
      const { data } = await api.get('/notices');
      setRecentNotices(data.slice(0, 8));
    } else if (tab === 'quiz') {
      const { data } = await api.get('/quiz');
      setRecentQuizzes(data.slice(0, 8));
    } else {
      const { data } = await api.get('/notes', { params: { type: tab } });
      setRecentNotes(data.slice(0, 8));
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault(); setUploading(true);
    const fd = new FormData();
    Object.entries(noteForm).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      await api.post('/notes', fd);
      toast.success('Uploaded!');
      setNoteForm({ ...emptyNote, type: tab }); setFile(null); fetchRecent();
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/notices', noticeForm); toast.success('Notice posted!'); setNoticeForm(emptyNotice); fetchRecent(); }
    catch { toast.error('Failed'); }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    const valid = questions.every(q =>
      q.question.trim() &&
      (q.type === 'fill' ? String(q.answer).trim() : q.options.every(o => o.trim()))
    );
    if (!valid) { toast.error('Fill all question fields'); return; }
    setPublishing(true);
    try {
      await api.post('/quiz', { ...moduleMeta, questions });
      toast.success('Quiz module published!');
      setModuleMeta(emptyModule);
      setQuestions([{ ...emptyMCQ }]);
      fetchRecent();
    } catch { toast.error('Failed to publish'); } finally { setPublishing(false); }
  };

  const deleteNote   = async (id) => { await api.delete(`/notes/${id}`);   toast.success('Deleted'); fetchRecent(); };
  const deleteNotice = async (id) => { await api.delete(`/notices/${id}`); toast.success('Deleted'); fetchRecent(); };
  const deleteQuiz   = async (id) => { await api.delete(`/quiz/${id}`);    toast.success('Deleted'); fetchRecent(); };

  const addQuestion  = (type) => setQuestions(qs => [...qs, type === 'mcq' ? { ...emptyMCQ } : { ...emptyFill }]);
  const removeQ      = (i)    => setQuestions(qs => qs.filter((_, idx) => idx !== i));
  const updateQ      = (i, field, val) => setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOption = (qi, oi, val)   => setQuestions(qs => qs.map((q, idx) =>
    idx === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q
  ));

  if (!isAdmin) return null;
  const activeTab = tabs.find(t => t.id === tab);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-7">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <HiShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">Manage notes, quiz modules &amp; notices</p>
        </div>
        <button onClick={() => { logout(); navigate('/admin/login'); }}
          className="flex items-center gap-1.5 btn-danger text-xs sm:text-sm">
          <HiLogout className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-5 sm:mb-7 border-b border-gray-200">
        {tabs.map(({ id, Icon, label, shortLabel }) => (
          <button key={id}
            onClick={() => { setTab(id); setNoteForm({ ...emptyNote, type: id }); }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 -mb-px transition-colors whitespace-nowrap flex-shrink-0 touch-manipulation
              ${tab === id
                ? id === 'quiz' ? 'border-violet-600 text-violet-700 bg-violet-50' : 'border-primary-600 text-primary-700 bg-primary-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── QUIZ TAB ── */}
      {tab === 'quiz' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-7">
          <div className="lg:col-span-3">
            <form onSubmit={handleQuizSubmit} className="space-y-4">

              {/* Module meta card */}
              <div className="card border border-gray-100 p-4 sm:p-5 space-y-3.5">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                  <HiLightningBolt className="w-4 h-4 text-violet-600" /> New Quiz Module
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Class *</label>
                    <select value={moduleMeta.class} onChange={e => setModuleMeta(f => ({ ...f, class: e.target.value }))} className="input-field">
                      {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Subject *</label>
                    <select value={moduleMeta.subject} onChange={e => setModuleMeta(f => ({ ...f, subject: e.target.value }))} className="input-field">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="form-label">Chapter *</label>
                    <input placeholder="e.g. Binary Number System" value={moduleMeta.chapter}
                      onChange={e => setModuleMeta(f => ({ ...f, chapter: e.target.value }))} required className="input-field" />
                  </div>
                  <div>
                    <label className="form-label">Ch. No.</label>
                    <input type="number" placeholder="1" value={moduleMeta.chapterNumber}
                      onChange={e => setModuleMeta(f => ({ ...f, chapterNumber: e.target.value }))} className="input-field" min="0" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Module Title *</label>
                  <input placeholder="e.g. Chapter 2 MCQ Practice" value={moduleMeta.title}
                    onChange={e => setModuleMeta(f => ({ ...f, title: e.target.value }))} required className="input-field" />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <input placeholder="Optional short description" value={moduleMeta.description}
                    onChange={e => setModuleMeta(f => ({ ...f, description: e.target.value }))} className="input-field" />
                </div>
              </div>

              {/* Question cards */}
              {questions.map((q, qi) => (
                <div key={qi} className="card border border-gray-100 overflow-hidden">
                  {/* Card top bar */}
                  <div className={`h-0.5 ${q.type === 'fill' ? 'bg-blue-400' : 'bg-violet-500'}`} />
                  <div className="p-4 sm:p-5 space-y-3">

                    {/* Q header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {qi + 1}
                        </span>
                        <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          q.type === 'fill'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-violet-50 text-violet-600 border border-violet-100'
                        }`}>
                          {q.type === 'fill'
                            ? <><HiPencil className="w-3 h-3" /> Fill-in</>
                            : <><HiAdjustments className="w-3 h-3" /> MCQ</>}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => updateQ(qi, 'type', q.type === 'fill' ? 'mcq' : 'fill')}
                          className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors touch-manipulation">
                          <HiSwitchHorizontal className="w-3 h-3" />
                          <span className="hidden sm:inline">Switch</span>
                        </button>
                        {questions.length > 1 && (
                          <button type="button" onClick={() => removeQ(qi)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation">
                            <HiMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <div>
                      <label className="form-label">Question *</label>
                      <textarea placeholder="Enter question..." value={q.question} rows={2}
                        onChange={e => updateQ(qi, 'question', e.target.value)}
                        required className="input-field resize-none text-sm" />
                    </div>

                    {/* Chapter tag */}
                    <div>
                      <label className="form-label">Chapter tag <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                      <input placeholder="e.g. Binary Numbers" value={q.chapter}
                        onChange={e => updateQ(qi, 'chapter', e.target.value)} className="input-field text-sm" />
                    </div>

                    {/* MCQ options — 2-column on mobile too */}
                    {q.type === 'mcq' && (
                      <div>
                        <label className="form-label">Options * <span className="text-gray-400 font-normal normal-case">(tap circle = correct)</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-colors ${
                              q.answer === oi ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'
                            }`}>
                              <button type="button" onClick={() => updateQ(qi, 'answer', oi)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors touch-manipulation ${
                                  q.answer === oi ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                                }`}>
                                {q.answer === oi && <HiCheckCircle className="w-3.5 h-3.5 text-white" />}
                              </button>
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                q.answer === oi ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <input placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                                required className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 min-w-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fill answer */}
                    {q.type === 'fill' && (
                      <div>
                        <label className="form-label">Correct Answer *</label>
                        <input placeholder="e.g. Arithmetic Logic Unit" value={q.answer}
                          onChange={e => updateQ(qi, 'answer', e.target.value)} required className="input-field text-sm" />
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <label className="form-label">Explanation <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                      <input placeholder="Brief explanation shown after answer..." value={q.explanation}
                        onChange={e => updateQ(qi, 'explanation', e.target.value)} className="input-field text-sm" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add question buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => addQuestion('mcq')}
                  className="flex items-center justify-center gap-1.5 border-2 border-dashed border-violet-300 text-violet-600 hover:bg-violet-50 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors touch-manipulation">
                  <HiPlus className="w-4 h-4" />
                  <HiAdjustments className="w-3.5 h-3.5" />
                  Add MCQ
                </button>
                <button type="button" onClick={() => addQuestion('fill')}
                  className="flex items-center justify-center gap-1.5 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors touch-manipulation">
                  <HiPlus className="w-4 h-4" />
                  <HiPencil className="w-3.5 h-3.5" />
                  Add Fill-in
                </button>
              </div>

              <button type="submit" disabled={publishing}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm touch-manipulation">
                {publishing
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</>
                  : <><HiLightningBolt className="w-4 h-4" /> Publish Module ({questions.length} Q{questions.length > 1 ? 's' : ''})</>}
              </button>
            </form>
          </div>

          {/* Published modules sidebar */}
          <div className="lg:col-span-2">
            <button onClick={() => setShowRecent(!showRecent)}
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm mb-2 touch-manipulation">
              <span className="text-sm font-bold text-gray-900">Published Modules</span>
              <HiLightningBolt className="w-4 h-4 text-violet-400" />
            </button>
            <div className={`card border border-gray-100 overflow-hidden ${!showRecent ? 'hidden lg:block' : ''}`}>
              <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wide">Published Modules</h2>
              </div>
              {recentQuizzes.length === 0
                ? <p className="text-gray-400 text-sm text-center py-8">No modules yet.</p>
                : (
                  <div className="divide-y divide-gray-100">
                    {recentQuizzes.map(q => (
                      <div key={q._id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{q.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400">Class {q.class} · {q.subject} · {q.questionCount} Qs</p>
                        </div>
                        <button onClick={() => deleteQuiz(q._id)}
                          className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors touch-target">
                          <HiTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>

      ) : (
        /* ── NOTE / IMPORTANT / NOTICE TABS ── */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-7">
          <div className="lg:col-span-3">
            <div className="card border border-gray-100 p-4 sm:p-6">
              <h2 className="font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2 text-sm sm:text-base">
                <activeTab.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                {tab === 'notice' ? 'Post New Notice' : `Upload ${activeTab.label}`}
              </h2>

              {tab !== 'notice' ? (
                <form onSubmit={handleNoteSubmit} className="space-y-3.5 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="form-label">Class *</label>
                      <select value={noteForm.class} onChange={e => setNoteForm(f => ({ ...f, class: e.target.value }))} className="input-field">
                        {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Subject *</label>
                      <select value={noteForm.subject} onChange={e => setNoteForm(f => ({ ...f, subject: e.target.value }))} className="input-field">
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="col-span-2">
                      <label className="form-label">Chapter Name *</label>
                      <input placeholder="e.g. Introduction to Computer" value={noteForm.chapter}
                        onChange={e => setNoteForm(f => ({ ...f, chapter: e.target.value }))} required className="input-field" />
                    </div>
                    <div>
                      <label className="form-label">Ch. No.</label>
                      <input type="number" placeholder="1" value={noteForm.chapterNumber}
                        onChange={e => setNoteForm(f => ({ ...f, chapterNumber: e.target.value }))} className="input-field" min="0" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Title *</label>
                    <input placeholder="e.g. Notes on Binary Number System" value={noteForm.title}
                      onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))} required className="input-field" />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea placeholder="Optional description..." value={noteForm.content} rows={3}
                      onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))} className="input-field resize-none" />
                  </div>
                  <div>
                    <label className="form-label">Attach File (PDF, DOC, Image)</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all touch-manipulation">
                      {file ? (
                        <div className="text-center px-4">
                          <HiUpload className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                          <p className="text-xs sm:text-sm font-semibold text-primary-700 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <HiUpload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs sm:text-sm text-gray-500 font-medium">Tap to attach a file</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX, PNG, JPG</p>
                        </div>
                      )}
                      <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden"
                        onChange={e => { setFile(e.target.files[0]); setNoteForm(f => ({ ...f, type: tab })); }} />
                    </label>
                    {file && (
                      <button type="button" onClick={() => setFile(null)} className="text-xs text-red-500 mt-1.5 touch-manipulation">Remove file</button>
                    )}
                  </div>
                  <button type="submit" disabled={uploading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 py-3">
                    {uploading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                      : <><HiUpload className="w-4 h-4" /> Upload</>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleNoticeSubmit} className="space-y-3.5 sm:space-y-4">
                  <div>
                    <label className="form-label">Send To *</label>
                    <select value={noticeForm.class ?? ''} onChange={e => setNoticeForm(f => ({ ...f, class: e.target.value || null }))} className="input-field">
                      <option value="">All Classes</option>
                      {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Notice Title *</label>
                    <input placeholder="e.g. Exam Schedule Updated" value={noticeForm.title}
                      onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))} required className="input-field" />
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea placeholder="Write the notice message here..." value={noticeForm.message} rows={5}
                      onChange={e => setNoticeForm(f => ({ ...f, message: e.target.value }))} required className="input-field resize-none" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer select-none touch-manipulation py-1">
                    <div className="relative flex-shrink-0">
                      <input type="checkbox" className="sr-only" checked={noticeForm.important}
                        onChange={e => setNoticeForm(f => ({ ...f, important: e.target.checked }))} />
                      <div className={`w-11 h-6 rounded-full transition-colors ${noticeForm.important ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${noticeForm.important ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Mark as Important</span>
                  </label>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <HiBell className="w-4 h-4" /> Post Notice
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Recent panel */}
          <div className="lg:col-span-2">
            <button onClick={() => setShowRecent(!showRecent)}
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm mb-2 touch-manipulation">
              <span className="text-sm font-bold text-gray-900">Recent Uploads</span>
              <HiBookOpen className={`w-4 h-4 text-gray-400 transition-transform ${showRecent ? 'rotate-180' : ''}`} />
            </button>
            <div className={`card border border-gray-100 overflow-hidden ${!showRecent ? 'hidden lg:block' : ''}`}>
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wide">Recent Uploads</h2>
              </div>
              {tab !== 'notice' ? (
                recentNotes.length === 0
                  ? <p className="text-gray-400 text-sm text-center py-8">Nothing uploaded yet.</p>
                  : (
                    <div className="divide-y divide-gray-100">
                      {recentNotes.map(n => (
                        <div key={n._id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 active:bg-gray-100">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{n.title}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400">Class {n.class} · {n.chapter}</p>
                          </div>
                          <button onClick={() => deleteNote(n._id)}
                            className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors touch-target">
                            <HiTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
              ) : (
                recentNotices.length === 0
                  ? <p className="text-gray-400 text-sm text-center py-8">No notices yet.</p>
                  : (
                    <div className="divide-y divide-gray-100">
                      {recentNotices.map(n => (
                        <div key={n._id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 active:bg-gray-100">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{n.title}</p>
                              {n.important && <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-400">{n.class ? `Class ${n.class}` : 'All Classes'} · {new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => deleteNotice(n._id)}
                            className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors touch-target">
                            <HiTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
