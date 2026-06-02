import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';
import { useState } from 'react';
import {
  HiHome, HiBookOpen, HiPencilAlt, HiStar, HiBell,
  HiMenuAlt3, HiX, HiSwitchHorizontal, HiLogout, HiShieldCheck
} from 'react-icons/hi';

const navLinks = [
  { to: '/home',      label: 'Home',      Icon: HiHome      },
  { to: '/notes',     label: 'Notes',     Icon: HiBookOpen  },
  { to: '/questions', label: 'Questions', Icon: HiPencilAlt },
  { to: '/important', label: 'Important', Icon: HiStar      },
  { to: '/notices',   label: 'Notices',   Icon: HiBell      },
];

export default function Navbar() {
  const { isAdmin, logout } = useAuth();
  const { selectedClass, clearClass } = useClass();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => { logout(); navigate('/admin/login'); };
  const handleChangeClass = () => { clearClass(); navigate('/'); };

  if (!selectedClass && !isAdmin) return null;

  return (
    <>
      {/* ── TOP BAR (desktop) / HEADER (mobile) ─────────────────────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <HiBookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-gray-900 text-sm sm:text-base leading-tight block truncate">
                  Everest DigiNotes
                </span>
                {selectedClass && !isAdmin && (
                  <span className="text-xs text-primary-600 font-medium leading-tight block">
                    Class {selectedClass}
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(({ to, label, Icon }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2">
              {isAdmin ? (
                <>
                  <span className="flex items-center gap-1.5 text-xs bg-primary-50 text-primary-700 font-semibold px-3 py-1.5 rounded-full border border-primary-200">
                    <HiShieldCheck className="w-3.5 h-3.5" /> Admin
                  </span>
                  <button onClick={handleLogout}
                    className="flex items-center gap-1.5 btn-danger text-xs">
                    <HiLogout className="w-3.5 h-3.5" /> Logout
                  </button>
                </>
              ) : (
                <button onClick={handleChangeClass}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors">
                  <HiSwitchHorizontal className="w-4 h-4" />
                  <span>Class {selectedClass}</span>
                </button>
              )}
            </div>

            {/* Mobile: right side actions */}
            <div className="flex md:hidden items-center gap-1">
              {isAdmin ? (
                <button onClick={handleLogout}
                  className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg font-medium">
                  <HiLogout className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleChangeClass}
                  className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg font-medium">
                  <HiSwitchHorizontal className="w-4 h-4" />
                  <span>Cl. {selectedClass}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── BOTTOM TAB BAR (mobile only) ─────────────────────────────── */}
      {!isAdmin && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
          <div className="flex items-stretch">
            {navLinks.map(({ to, label, Icon }) => {
              const active = isActive(to);
              return (
                <Link key={to} to={to}
                  className={`flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-0.5 transition-colors touch-manipulation
                    ${active ? 'text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}>
                  <div className={`p-1 rounded-lg transition-all ${active ? 'bg-primary-50' : ''}`}>
                    <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-medium leading-none ${active ? 'text-primary-700' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
