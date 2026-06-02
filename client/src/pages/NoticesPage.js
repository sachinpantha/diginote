import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { HiBell, HiExclamation, HiTrash } from 'react-icons/hi';

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    const { data } = await api.get('/notices');
    setNotices(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await api.delete(`/notices/${id}`);
    toast.success('Notice deleted');
    fetchNotices();
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-7">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <HiBell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">Notice Board</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Official announcements from your teacher</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : notices.length === 0 ? (
        <div className="card border border-gray-100 py-16 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <HiBell className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600">No notices posted yet.</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for announcements.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n._id}
              className={`card border overflow-hidden ${n.important ? 'border-red-200' : 'border-gray-100'}`}>
              {/* Colored top bar */}
              <div className={`h-1 ${n.important ? 'bg-red-500' : 'bg-primary-500'}`} />

              <div className="p-4 sm:p-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {n.important && (
                      <HiExclamation className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{n.title}</h3>
                    {n.important && (
                      <span className="badge bg-red-100 text-red-700 text-[10px]">Important</span>
                    )}
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(n._id)}
                      className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors touch-target">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{n.message}</p>

                <p className="text-[10px] sm:text-xs text-gray-400 mt-3">
                  {new Date(n.createdAt).toLocaleDateString('en-GB', {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
