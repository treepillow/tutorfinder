import { useState } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MatchesPage } from './pages/MatchesPage';
import { RequestsPage } from './pages/RequestsPage';
import type { AuthUser } from './types';
import './App.css';

type Page = 'landing' | 'login' | 'register' | 'discover' | 'matches' | 'requests';

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('tf_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    try {
      const stored = localStorage.getItem('tf_user');
      return stored ? 'discover' : 'landing';
    } catch {
      return 'landing';
    }
  });

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (user: AuthUser) => {
    localStorage.setItem('tf_user', JSON.stringify(user));
    setAuthUser(user);
    setCurrentPage('discover');
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
      {currentPage === 'landing' && (
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      <main className="main-content">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />}
        {currentPage === 'discover' && <DiscoverPage user={authUser} onNavigate={handleNavigate} onLogout={handleLogout} />}
        {currentPage === 'matches' && <MatchesPage user={authUser} onNavigate={handleNavigate} onLogout={handleLogout} />}
        {currentPage === 'requests' && <RequestsPage user={authUser} onNavigate={handleNavigate} onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default App;
