import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  const isLoggedIn = currentPage === 'dashboard';

  return (
    <header ref={headerRef} className="header">
      <div className="header-container">
        <a 
          href="#" 
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('landing');
          }}
        >
          <div className="logo-icon">
            <GraduationCap size={28} />
          </div>
          <span className="logo-text">TutorFinder</span>
        </a>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          {!isLoggedIn ? (
            <>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#reviews" className="nav-link">Reviews</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>
                Sign In
              </a>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('register')}
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <span className="nav-link active">Dashboard</span>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate('landing')}
              >
                Sign Out
              </button>
              <div className="avatar avatar-sm" style={{ background: 'var(--primary-gradient)' }}>
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>JD</span>
              </div>
            </>
          )}
        </nav>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(250, 250, 250, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-light);
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: var(--space-4) var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: var(--primary-gradient);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--shadow-md);
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }

        .nav-link {
          font-weight: 600;
          color: var(--text);
          transition: color var(--transition-fast);
          position: relative;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .nav-link.active {
          color: var(--primary);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary-gradient);
          border-radius: var(--radius-full);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-dark);
          cursor: pointer;
          padding: var(--space-2);
        }

        @media (max-width: 768px) {
          .nav {
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            background: var(--bg);
            flex-direction: column;
            padding: var(--space-6);
            gap: var(--space-4);
            border-bottom: 1px solid var(--border);
            transform: translateY(-100%);
            opacity: 0;
            pointer-events: none;
            transition: all var(--transition);
          }

          .nav-open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }

          .mobile-menu-btn {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
