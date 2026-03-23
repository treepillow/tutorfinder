import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Mail, Lock, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.login-container',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )
      .fromTo('.login-logo',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5 },
        '-=0.4'
      )
      .fromTo('.login-title',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.3'
      )
      .fromTo('.login-form-group',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=0.2'
      )
      .fromTo('.login-footer',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.3'
      );

      // Floating shapes animation
      gsap.to('.floating-shape', {
        y: -30,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: {
          each: 0.5,
          from: 'random'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    onNavigate('dashboard');
  };

  return (
    <div ref={containerRef} className="login-page">
      {/* Floating Background Shapes */}
      <div className="floating-shapes">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo" onClick={() => onNavigate('landing')}>
            <div className="logo-icon-large">
              <GraduationCap size={40} />
            </div>
            <span className="logo-text-large">TutorFinder</span>
          </div>

          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">Welcome Back!</h1>
            <p className="login-subtitle">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  className="form-input input-with-icon"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input input-with-icon"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="login-form-group login-options">
              <label className="form-check">
                <input type="checkbox" className="form-check-input" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>or continue with</span>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <button type="button" className="social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button type="button" className="social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('register'); }}>
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fafafa 0%, #f0f4ff 50%, #faf5ff 100%);
          position: relative;
          overflow: hidden;
          padding: var(--space-6);
        }

        .floating-shapes {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.5;
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1));
          top: -100px;
          right: -100px;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.1));
          bottom: -50px;
          left: -50px;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1));
          top: 40%;
          left: 10%;
        }

        .shape-4 {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.1));
          bottom: 20%;
          right: 15%;
        }

        .shape-5 {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 114, 182, 0.1));
          top: 20%;
          left: 20%;
        }

        .login-container {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-light);
        }

        .login-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-8);
          cursor: pointer;
          transition: transform var(--transition-fast);
        }

        .login-logo:hover {
          transform: scale(1.02);
        }

        .logo-icon-large {
          width: 72px;
          height: 72px;
          background: var(--primary-gradient);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--shadow-md);
        }

        .logo-text-large {
          font-size: 1.75rem;
          font-weight: 800;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .login-title {
          font-size: 1.875rem;
          margin-bottom: var(--space-2);
        }

        .login-subtitle {
          color: var(--text-light);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }

        .input-with-icon {
          padding-left: var(--space-12);
        }

        .password-toggle {
          position: absolute;
          right: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: var(--space-1);
          transition: color var(--transition-fast);
        }

        .password-toggle:hover {
          color: var(--primary);
        }

        .login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-2);
        }

        .forgot-link {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary);
          transition: color var(--transition-fast);
        }

        .forgot-link:hover {
          color: var(--primary-dark);
        }

        .login-submit {
          width: 100%;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-divider {
          display: flex;
          align-items: center;
          margin: var(--space-8) 0;
          color: var(--text-light);
          font-size: 0.875rem;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .login-divider span {
          padding: 0 var(--space-4);
        }

        .social-login {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: white;
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-dark);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .social-btn:hover {
          border-color: var(--primary);
          background: var(--bg);
        }

        .login-footer {
          text-align: center;
          margin-top: var(--space-8);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-light);
        }

        .login-footer p {
          color: var(--text-light);
        }

        .login-footer a {
          color: var(--primary);
          font-weight: 600;
          transition: color var(--transition-fast);
        }

        .login-footer a:hover {
          color: var(--primary-dark);
        }

        @media (max-width: 640px) {
          .login-card {
            padding: var(--space-6);
          }

          .social-login {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
