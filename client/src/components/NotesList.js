import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiBookOpen, HiPencilAlt, HiStar,
  HiChevronDown, HiDownload, HiTrash, HiSearch
} from 'react-icons/hi';

export default function NotesList({ type }) {
  const { selectedClass } = useClass();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [expandedChapter, setExpandedChapter] = useState(null);

  const cfg = {
    note:      { title: 'Chapter Notes',      Icon: HiBookOpen,  iconBg: 'bg-primary-100', iconCls: 'text-primary-700', chBg: 'bg-primary-100 text-primary-700', badgeBg: 'bg-primary-50 text-primary-700', accentBar: 'bg-primary-600' },
    question:  { title: 'Practice Questions', Icon: HiPencilAlt, iconBg: 'bg-violet-100',  iconCls: 'text-violet-700',  chBg: 'bg-violet-100  text-violet-700',  badgeBg: 'bg-violet-50  text-violet-700',  accentBar: 'bg-violet-600'  },
    important: { title: 'Important Notes',    Icon: HiStar,      iconBg: 'bg-amber-100',   iconCls: 'text-amber-700',   chBg: 'bg-amber-100   text-amber-700',   badgeBg: 'bg-amber-50   text-amber-700',   accentBar: 'bg-amber-500'   },
  }[type];

  useEffect(() => {
    if (!selectedClass && !isAdmin) { navigate('/'); return; }
    fetchNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, selectedClass, subject]);

  const fetchNotes = async () => {
    setLoading(true);
    const params = { type };
    if (selectedClass) params.class = selectedClass;
    if (subject) params.subject = subject;
    const { data } = await api.get('/notes', { params });
    setNotes(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(`/notes/${id}`);
    toast.success('Deleted');
    fetchNotes();
  };

  const grouped = notes.reduce((acc, note) => {
    if (!acc[note.chapter]) acc[note.chapter] = [];
    acc[note.chapter].push(note);
    return acc;
  }, {});
  const chapters = Object.keys(grouped);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

      {/* Sticky page header + search */}
      <div className="sticky top-14 sm:top-16 z-30 bg-slate-50 pt-2 pb-3 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 border-b border-gray-100 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 ${cfg.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <cfg.Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${cfg.iconCls}`} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">{cfg.title}</h1>
              {selectedClass && (
                <p className="text-gray-400 text-[10px] sm:text-xs">Class {selectedClass}</p>
              )}
            </div>
          </div>
          {/* Search */}
          <div className="relative w-36 sm:w-52">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              placeholder="Subject..."
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="input-field pl-8 py-2 text-xs sm:text-sm !min-h-[36px] sm:!min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : chapters.length === 0 ? (
        <Empty title={cfg.title} Icon={cfg.Icon} iconCls={cfg.iconCls} />
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {chapters.map(chapter => {
            const isOpen = expandedChapter === chapter;
            const items = grouped[chapter];
            return (
              <div key={chapter} className="card border border-gray-100 overflow-hidden">
                {/* Accent bar */}
                <div className={`h-0.5 ${cfg.accentBar}`} />

                {/* Chapter toggle */}
                <button
                  onClick={() => setExpandedChapter(isOpen ? null : chapter)}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left touch-manipulation">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${cfg.chBg}`}>
                      {items[0]?.chapterNumber || '#'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate pr-2">{chapter}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {items.length} item{items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <HiChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Items */}
                {isOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {items.map(note => (
                      <NoteItem key={note._id} note={note} isAdmin={isAdmin}
                        onDelete={handleDelete} badgeBg={cfg.badgeBg} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NoteItem({ note, isAdmin, onDelete, badgeBg }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="px-4 sm:px-5 py-3.5 sm:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title + subject badge */}
          <div className="flex items-start gap-2 flex-wrap mb-1.5">
            <h4 className="font-semibold text-gray-900 text-sm leading-snug">{note.title}</h4>
            <span className={`badge ${badgeBg} text-[10px] mt-0.5`}>{note.subject}</span>
          </div>

          {/* Content */}
          {note.content && (
            <div>
              <p className={`text-gray-500 text-xs sm:text-sm leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
                {note.content}
              </p>
              {note.content.length > 100 && (
                <button onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary-600 mt-1 font-medium touch-manipulation">
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Download button */}
          {note.fileUrl && (
            <a href={note.fileUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold
                         text-primary-700 bg-primary-50 active:bg-primary-100
                         px-3 py-2 rounded-lg border border-primary-100
                         transition-colors touch-manipulation min-h-[36px]">
              <HiDownload className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-xs">
                {note.fileName || 'View / Download'}
              </span>
            </a>
          )}
        </div>

        {/* Delete (admin only) */}
        {isAdmin && (
          <button onClick={() => onDelete(note._id)}
            className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors touch-target">
            <HiTrash className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

function Empty({ title, Icon, iconCls }) {
  return (
    <div className="card border border-gray-100 py-16 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className={`w-7 h-7 ${iconCls} opacity-40`} />
      </div>
      <h3 className="font-semibold text-gray-700 mb-1">No {title} yet</h3>
      <p className="text-gray-400 text-sm max-w-xs">
        Check back later — your teacher will upload materials soon.
      </p>
    </div>
  );
}
