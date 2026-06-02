import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  HiBookOpen, HiPencilAlt, HiStar, HiBell,
  HiUpload, HiTrash, HiLogout, HiShieldCheck
} from 'react-icons/hi';

const CLASSES  = ['8', '9', '10'];
const SUBJECTS = ['Computer Science', 'Mathematics', 'Science', 'English', 'Nepali', 'Social Studies', 'Optional Math'];

const emptyNote   = { title: '', chapter: '', chapterNumber: '', subject: 'Computer Science', class: '10', content: '', type: 'note' };
const emptyNotice = { title: '', message: '', important: false };

const tabs = [
  { id: 'note',      Icon: HiBookOpen,  label: 'Chapter Notes',  shortLabel: 'Notes'     },
  { id: 'question',  Icon: HiPencilAlt, label: 'Practice Q&A',   shortLabel: 'Q&A'       },
  { id: 'important', Icon: HiStar,      label: 'Important Notes', shortLabel: 'Important' },
  { id: 'notice',    Icon: HiBell,      label: 'Notices',         shortLabel: 'Notices'   },
];

export default function AdminPage() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('note');
  const [noteForm, setNoteForm] = useState(emptyNote);
  const [noticeForm, setNoticeForm] = useState(emptyNotice);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchRecent();
  }, [isAdmin, tab]);

  const fetchRecent = async () => {
    if (tab === 'notice') {
      const { data } = await api.get('/notices');
      setRecentNotices(data.slice(0, 8));
    } else {
      const { data } = await api.get('/notes', { params: { type: tab } });
      setRecentNotes(data.slice(0, 8));
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const fd = new FormData();
    Object.entries(noteForm).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      await api.post('/notes', fd);
      toast.success('Uploaded!');
      setNoteForm({ ...emptyNote, type: tab });
      setFile(null);
      fetchRecent();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', noticeForm);
      toast.success('Notice posted!');
      setNoticeForm(emptyNotice);
      fetchRecent();
    } catch {
      toast.error('Failed');
    }
  };

  const deleteNote   = async (id) => { await api.delete(`/notes/${id}`);   toast.success('Deleted'); fetchRecent(); };
  const deleteNotice = async (id) => { await api.delete(`/notices/${id}`); toast.success('Deleted'); fetchRecent(); };

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
          <p className="text-gray-400 text-xs sm:text-sm">Manage notes, questions &amp; notices</p>
        </div>
        <button onClick={() => { logout(); navigate('/admin/login'); }}
          className="flex items-center gap-1.5 btn-danger text-xs sm:text-sm">
          <HiLogout className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Scrollable tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-5 sm:mb-7 border-b border-gray-200 pb-0">
        {tabs.map(({ id, Icon, label, shortLabel }) => (
          <button key={id}
            onClick={() => { setTab(id); setNoteForm({ ...emptyNote, type: id }); }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 -mb-px transition-colors whitespace-nowrap flex-shrink-0 touch-manipulation
              ${tab === id
                ? 'border-primary-600 text-primary-700 bg-primary-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-7">

        {/* Upload Form */}
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
                    <select value={noteForm.class}
                      onChange={e => setNoteForm(f => ({ ...f, class: e.target.value }))}
                      className="input-field">
                      {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Subject *</label>
                    <select value={noteForm.subject}
                      onChange={e => setNoteForm(f => ({ ...f, subject: e.target.value }))}
                      className="input-field">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="col-span-2">
                    <label className="form-label">Chapter Name *</label>
                    <input placeholder="e.g. Introduction to Computer"
                      value={noteForm.chapter}
                      onChange={e => setNoteForm(f => ({ ...f, chapter: e.target.value }))}
                      required className="input-field" />
                  </div>
                  <div>
                    <label className="form-label">Ch. No.</label>
                    <input type="number" placeholder="1"
                      value={noteForm.chapterNumber}
                      onChange={e => setNoteForm(f => ({ ...f, chapterNumber: e.target.value }))}
                      className="input-field" min="0" />
                  </div>
                </div>

                <div>
                  <label className="form-label">Title *</label>
                  <input placeholder="e.g. Notes on Binary Number System"
                    value={noteForm.title}
                    onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))}
                    required className="input-field" />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea placeholder="Optional description..."
                    value={noteForm.content} rows={3}
                    onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
                    className="input-field resize-none" />
                </div>

                {/* File drop zone */}
                <div>
                  <label className="form-label">Attach File (PDF, DOC, Image)</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 active:bg-primary-50 transition-all touch-manipulation">
                    {file ? (
                      <div className="text-center px-4">
                        <HiUpload className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-1" />
                        <p className="text-xs sm:text-sm font-semibold text-primary-700 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <HiUpload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Tap to attach a file</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX, PNG, JPG</p>
                      </div>
                    )}
                    <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden"
                      onChange={e => { setFile(e.target.files[0]); setNoteForm(f => ({ ...f, type: tab })); }} />
                  </label>
                  {file && (
                    <button type="button" onClick={() => setFile(null)}
                      className="text-xs text-red-500 mt-1.5 touch-manipulation">Remove file</button>
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
                  <label className="form-label">Notice Title *</label>
                  <input placeholder="e.g. Exam Schedule Updated"
                    value={noticeForm.title}
                    onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))}
                    required className="input-field" />
                </div>
                <div>
                  <label className="form-label">Message *</label>
                  <textarea placeholder="Write the notice message here..."
                    value={noticeForm.message} rows={5}
                    onChange={e => setNoticeForm(f => ({ ...f, message: e.target.value }))}
                    required className="input-field resize-none" />
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

        {/* Recent Uploads — collapsible on mobile */}
        <div className="lg:col-span-2">
          {/* Mobile toggle */}
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
                          <p className="text-[10px] sm:text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
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
    </div>
  );
}
