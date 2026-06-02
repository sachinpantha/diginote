import { useNavigate } from 'react-router-dom';
import { useClass } from '../context/ClassContext';
import { HiChevronRight, HiAcademicCap } from 'react-icons/hi';
import logo from '../assets/logo.jpg';

const classes = [
  { id: '8',  label: 'Class 8',  desc: 'Grade 8 — Secondary Level' },
  { id: '9',  label: 'Class 9',  desc: 'Grade 9 — Secondary Level' },
  { id: '10', label: 'Class 10', desc: 'Grade 10 — SLC / SEE Level' },
];

export default function ClassSelect() {
  const { selectClass, selectedClass } = useClass();
  const navigate = useNavigate();

  const handleSelect = (cls) => { selectClass(cls); navigate('/home'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col items-center justify-center px-5 safe-top safe-bottom">

      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <img src={logo} alt="Everest DigiNotes" className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto mb-4 sm:mb-5 object-cover border-2 border-white/30 shadow-lg" />
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
          Everest DigiNotes
        </h1>
        <p className="text-primary-200 text-base sm:text-lg">
          Your academic companion for Notes &amp; Practice
        </p>
      </div>

      {/* Class picker */}
      <div className="w-full max-w-sm sm:max-w-md">
        <p className="text-center text-primary-100 font-medium mb-4 text-xs uppercase tracking-widest">
          Select Your Class to Continue
        </p>
        <div className="space-y-3">
          {classes.map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] touch-manipulation
                ${selectedClass === id
                  ? 'bg-white border-white text-primary-800 shadow-xl'
                  : 'bg-white/10 border-white/20 text-white active:bg-white/30 backdrop-blur'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedClass === id ? 'bg-primary-100' : 'bg-white/15'}`}>
                  <HiAcademicCap className={`w-5 h-5 sm:w-6 sm:h-6 ${selectedClass === id ? 'text-primary-700' : 'text-white'}`} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg sm:text-xl leading-tight">{label}</div>
                  <div className={`text-xs sm:text-sm mt-0.5 ${selectedClass === id ? 'text-primary-600' : 'text-primary-200'}`}>
                    {desc}
                  </div>
                </div>
              </div>
              <HiChevronRight className="w-5 h-5 flex-shrink-0 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-primary-400 text-[10px] uppercase tracking-widest mb-1">Computer Science Notes by</p>
        <p className="text-white font-bold text-base sm:text-lg">Mr. Sachin Pantha</p>
        <p className="text-primary-200 text-xs sm:text-sm">Head of Department — Computer Science</p>
        <p className="text-primary-300 text-xs mt-0.5">Sector 2</p>
      </div>
    </div>
  );
}
