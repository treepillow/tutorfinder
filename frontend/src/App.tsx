import { useState } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';

type Page = 'landing' | 'login' | 'register' | 'dashboard';

export interface AuthUser {
  token: string;
  user_id: number;
  role: string;
  name: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('tf_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (user: AuthUser) => {
    localStorage.setItem('tf_user', JSON.stringify(user));
    setAuthUser(user);
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('tf_user');
    setAuthUser(null);
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      {currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'dashboard' && (
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      <main className="main-content">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} user={authUser} onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default App;
