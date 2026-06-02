import { useEffect, useState } from 'react';
import logo from '../assets/logo.jpg';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('pwa-dismissed')) return;
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') dismiss();
    else dismiss();
  };

  const dismiss = () => {
    localStorage.setItem('pwa-dismissed', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm
                    bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3
                    animate-[slideUp_0.3s_ease]">
      <img src={logo} alt="DigiNotes" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm leading-tight">Install DigiNotes</p>
        <p className="text-gray-400 text-xs mt-0.5">Add to home screen for quick access</p>
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        <button onClick={handleInstall}
          className="bg-primary-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-800 transition-colors">
          Install
        </button>
        <button onClick={dismiss}
          className="text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          Not now
        </button>
      </div>
    </div>
  );
}
