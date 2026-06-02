import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ClassProvider } from './context/ClassContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ClassSelect from './pages/ClassSelect';
import NotesPage from './pages/NotesPage';
import QuestionsPage from './pages/QuestionsPage';
import ImportantPage from './pages/ImportantPage';
import NoticesPage from './pages/NoticesPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function Layout() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const noNav = location.pathname === '/' || location.pathname === '/admin/login';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {/* bottom padding on mobile so content clears the tab bar */}
      <div className={!noNav && !isAdmin ? 'pb-20 md:pb-0' : ''}>
        <Routes>
          <Route path="/"            element={<ClassSelect />} />
          <Route path="/home"        element={<HomePage />} />
          <Route path="/notes"       element={<NotesPage />} />
          <Route path="/questions"   element={<QuestionsPage />} />
          <Route path="/important"   element={<ImportantPage />} />
          <Route path="/notices"     element={<NoticesPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin"       element={<AdminPage />} />
        </Routes>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={2500}
        toastClassName="!rounded-xl !text-sm !font-medium"
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ClassProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </ClassProvider>
    </AuthProvider>
  );
}
