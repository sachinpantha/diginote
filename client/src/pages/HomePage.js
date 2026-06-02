import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useClass } from '../context/ClassContext';
import {
  HiBookOpen, HiPencilAlt, HiStar, HiBell,
  HiChevronRight, HiExclamation
} from 'react-icons/hi';

export default function HomePage() {
  const { selectedClass } = useClass();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [counts, setCounts] = useState({ note: 0, question: 0, important: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedClass) { navigate('/'); return; }
    Promise.all([
      api.get('/notices'),
      api.get('/notes', { params: { type: 'note',      class: selectedClass } }),
      api.get('/notes', { params: { type: 'question',  class: selectedClass } }),
      api.get('/notes', { params: { type: 'important', class: selectedClass } }),
    ]).then(([n, notes, qs, imp]) => {
      setNotices(n.data.slice(0, 4));
      setCounts({ note: notes.data.length, question: qs.data.length, important: imp.data.length });
    }).finally(() => setLoading(false));
  }, [selectedClass]);

  const stats = [
    { to: '/notes',     Icon: HiBookOpen,  label: 'Chapter Notes',      count: counts.note,      bg: 'bg-blue-50   border-blue-100',   iconBg: 'bg-blue-100',   countCls: 'text-blue-700',   iconCls: 'text-blue-600'   },
    { to: '/questions', Icon: HiPencilAlt, label: 'Practice Questions', count: counts.question,  bg: 'bg-violet-50 border-violet-100', iconBg: 'bg-violet-100', countCls: 'text-violet-700', iconCls: 'text-violet-600' },
    { to: '/important', Icon: HiStar,      label: 'Important Notes',    count: counts.important, bg: 'bg-amber-50  border-amber-100',  iconBg: 'bg-amber-100',  countCls: 'text-amber-700',  iconCls: 'text-amber-600'  },
  ];

  const quickLinks = [
    { to: '/notes',     Icon: HiBookOpen,  label: 'Chapter Notes',   sub: `${counts.note} materials`   },
    { to: '/questions', Icon: HiPencilAlt, label: 'Practice Q&A',    sub: `${counts.question} sets`    },
    { to: '/important', Icon: HiStar,      label: 'Important Notes', sub: `${counts.important} notes`  },
    { to: '/notices',   Icon: HiBell,      label: 'Notice Board',    sub: `${notices.length} notices`  },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">

      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 sm:w-44 sm:h-44 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
        <div className="relative">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2 sm:mb-3 uppercase tracking-wider">
            Class {selectedClass} — Computer Science
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1.5">
            Welcome to Everest DigiNotes
          </h1>
          <p className="text-primary-100 text-xs sm:text-sm max-w-lg">
            Access your chapter notes, practice questions, and important materials — all in one place.
          </p>
        </div>
      </div>

      {/* Stats — 3 cols on all screens (compact on mobile) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
        {stats.map(({ to, Icon, label, count, bg, iconBg, countCls, iconCls }) => (
          <Link key={to} to={to}
            className={`card-hover border ${bg} p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:gap-4 gap-1.5 text-center sm:text-left active:scale-[0.97]`}>
            <div className={`w-9 h-9 sm:w-12 sm:h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${iconCls}`} />
            </div>
            <div>
              <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${countCls}`}>{count}</div>
              <div className="text-gray-600 text-[10px] sm:text-xs lg:text-sm font-medium leading-tight mt-0.5">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Notices + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* Notices */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <HiBell className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              Latest Notices
            </h2>
            <Link to="/notices"
              className="text-xs sm:text-sm text-primary-600 font-semibold flex items-center gap-0.5 active:opacity-70">
              View all <HiChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {notices.length === 0
            ? <p className="text-gray-400 text-sm italic py-4">No notices posted yet.</p>
            : (
              <div className="space-y-2.5 sm:space-y-3">
                {notices.map(n => (
                  <div key={n._id}
                    className={`card p-3.5 sm:p-4 border-l-4 ${n.important
                      ? 'border-l-red-500 bg-red-50 border-red-100'
                      : 'border-l-primary-500 border-gray-100'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {n.important && <HiExclamation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />}
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{n.title}</h3>
                          {n.important && (
                            <span className="badge bg-red-100 text-red-700 text-[10px]">Important</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                        {new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Quick Links — horizontal scroll on mobile */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Access</h2>
          {/* Mobile: 2x2 grid. Desktop: list */}
          <div className="grid grid-cols-2 gap-2.5 lg:hidden">
            {quickLinks.map(({ to, Icon, label, sub }) => (
              <Link key={to} to={to}
                className="card-hover border border-gray-100 p-3.5 flex flex-col gap-2 active:scale-[0.97]">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800 leading-tight">{label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop: list */}
          <div className="hidden lg:block card border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {quickLinks.map(({ to, Icon, label, sub }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{label}</div>
                  <div className="text-xs text-gray-400">{sub}</div>
                </div>
                <HiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}
