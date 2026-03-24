import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ThumbsUp, ThumbsDown, RotateCcw, DollarSign, BookOpen } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import type { AuthUser } from '../types';

const PROFILE_SERVICE = import.meta.env.VITE_PROFILE_SERVICE ?? 'http://localhost:5001';
const MATCH_SERVICE = import.meta.env.VITE_MATCH_SERVICE ?? 'http://localhost:5002';

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
];

interface Profile {
  user_id: number;
  name: string;
  role: string;
  subject: string;
  price_rate?: number;
  bio?: string;
  latitude?: number;
  longitude?: number;
}

interface DiscoverPageProps {
  user: AuthUser | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getGradient(userId: number) {
  return GRADIENTS[userId % GRADIENTS.length];
}

export function DiscoverPage({ user, onNavigate, onLogout }: DiscoverPageProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [swipedCount, setSwipedCount] = useState(0);

  const topCardRef = useRef<HTMLDivElement>(null);

  // Fetch profiles on mount
  useEffect(() => {
    if (!user) return;
    fetchProfiles();
  }, [user]);

  async function fetchProfiles() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PROFILE_SERVICE}/profile/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to fetch profiles');
      const data = await res.json();
      const list: Profile[] = Array.isArray(data) ? data : data.profiles ?? [];
      setProfiles(list);
    } catch (e) {
      setError('Could not load profiles. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSwipe(isLike: boolean) {
    if (isAnimating || currentIndex >= profiles.length) return;
    const target = profiles[currentIndex];
    setIsAnimating(true);

    // Animate card off screen
    if (topCardRef.current) {
      await gsap.to(topCardRef.current, {
        x: isLike ? 600 : -600,
        rotate: isLike ? 25 : -25,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      });
      gsap.set(topCardRef.current, { x: 0, rotate: 0, opacity: 1 });
    }

    // Call match service
    try {
      const res = await fetch(`${MATCH_SERVICE}/match/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swiper_id: user?.user_id,
          swiped_id: target.user_id,
          is_like: isLike,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.matched) {
          setMatchedProfile(target);
        }
      }
    } catch {
      // Swipe still advances even if API fails
    }

    setCurrentIndex(prev => prev + 1);
    setSwipedCount(prev => prev + 1);
    setIsAnimating(false);
  }

  function handleUndo() {
    if (currentIndex === 0 || isAnimating) return;
    setCurrentIndex(prev => prev - 1);
    setSwipedCount(prev => Math.max(0, prev - 1));
  }

  const remaining = profiles.length - currentIndex;
  const isDone = !loading && remaining === 0;

  return (
    <div className="discover-page">
      <Sidebar user={user} currentPage="discover" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main content */}
      <main className="discover-main">
        <div className="discover-header">
          <h2 className="discover-title">
            {user?.role === 'Student' ? 'Find Your Tutor' : 'Find Students'}
          </h2>
          <p className="discover-subtitle">
            {user?.role === 'Student'
              ? 'Swipe right on tutors you like, left to pass'
              : 'Swipe right on students you want to teach'}
          </p>
          {!loading && profiles.length > 0 && (
            <div className="discover-progress">
              <div
                className="discover-progress-bar"
                style={{ width: `${(swipedCount / profiles.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="discover-stack-area">
          {loading && (
            <div className="discover-state-card">
              <div className="discover-spinner" />
              <p>Loading profiles...</p>
            </div>
          )}

          {error && (
            <div className="discover-state-card">
              <p className="discover-error">{error}</p>
              <button className="btn btn-primary" onClick={fetchProfiles}>
                Retry
              </button>
            </div>
          )}

          {isDone && (
            <div className="discover-state-card">
              <div className="discover-done-icon">✨</div>
              <h3>You've seen everyone!</h3>
              <p>Check your dashboard for matches.</p>
              <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>
                Go to Dashboard
              </button>
            </div>
          )}

          {!loading && !error && !isDone && (
            <div className="card-stack">
              {/* Render up to 3 cards, back to front */}
              {[2, 1, 0].map(offset => {
                const idx = currentIndex + offset;
                if (idx >= profiles.length) return null;
                const profile = profiles[idx];
                const isTop = offset === 0;

                return (
                  <div
                    key={profile.user_id}
                    ref={isTop ? topCardRef : undefined}
                    className={`swipe-card ${isTop ? 'swipe-card--top' : ''}`}
                    style={{
                      zIndex: 10 - offset,
                      transform: offset === 0
                        ? 'translateY(0) scale(1) rotate(0deg)'
                        : offset === 1
                        ? 'translateY(18px) scale(0.96) rotate(-1.5deg)'
                        : 'translateY(34px) scale(0.92) rotate(2deg)',
                    }}
                  >
                    {/* Card top: avatar */}
                    <div
                      className="swipe-card-avatar"
                      style={{ background: getGradient(profile.user_id) }}
                    >
                      <span>{getInitials(profile.name)}</span>
                    </div>

                    {/* Card info (only on top card) */}
                    {isTop && (
                      <div className="swipe-card-body">
                        <div className="swipe-card-header-row">
                          <div>
                            <h3 className="swipe-card-name">{profile.name}</h3>
                            <span
                              className="swipe-card-role-badge"
                              data-role={profile.role?.toLowerCase()}
                            >
                              {profile.role}
                            </span>
                          </div>
                          {profile.price_rate && (
                            <div className="swipe-card-price">
                              <DollarSign size={14} />
                              <span>{profile.price_rate}/hr</span>
                            </div>
                          )}
                        </div>

                        {profile.subject && (
                          <div className="swipe-card-meta-row">
                            <BookOpen size={14} />
                            <span>{profile.subject}</span>
                          </div>
                        )}

                        {profile.bio && (
                          <p className="swipe-card-bio">{profile.bio}</p>
                        )}

                        <div className="swipe-card-remaining">
                          {remaining - 1} more profile{remaining - 1 !== 1 ? 's' : ''} to go
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!loading && !error && !isDone && (
          <div className="swipe-actions">
            <button
              className="swipe-btn swipe-btn--pass"
              onClick={() => handleSwipe(false)}
              disabled={isAnimating}
              title="Pass"
            >
              <ThumbsDown size={28} />
            </button>

            <button
              className="swipe-btn swipe-btn--undo"
              onClick={handleUndo}
              disabled={isAnimating || currentIndex === 0}
              title="Undo"
            >
              <RotateCcw size={20} />
            </button>

            <button
              className="swipe-btn swipe-btn--like"
              onClick={() => handleSwipe(true)}
              disabled={isAnimating}
              title="Like"
            >
              <ThumbsUp size={28} />
            </button>
          </div>
        )}
      </main>

      {/* Match overlay */}
      {matchedProfile && (
        <div className="match-overlay" onClick={() => setMatchedProfile(null)}>
          <div className="match-popup" onClick={e => e.stopPropagation()}>
            <div className="match-avatars">
              <div
                className="match-avatar"
                style={{ background: getGradient(user?.user_id ?? 0) }}
              >
                {getInitials(user?.name ?? 'U')}
              </div>
              <div className="match-heart">❤️</div>
              <div
                className="match-avatar"
                style={{ background: getGradient(matchedProfile.user_id) }}
              >
                {getInitials(matchedProfile.name)}
              </div>
            </div>
            <h2 className="match-title">It's a Match!</h2>
            <p className="match-subtitle">
              You and <strong>{matchedProfile.name}</strong> liked each other.
            </p>
            <div className="match-actions">
              <button
                className="btn btn-primary"
                onClick={() => { setMatchedProfile(null); onNavigate('dashboard'); }}
              >
                Go to Dashboard
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setMatchedProfile(null)}
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .discover-page {
          display: flex;
          height: 100vh;
          background: linear-gradient(135deg, #fafafa 0%, #f0f4ff 50%, #faf5ff 100%);
          overflow: hidden;
        }

        /* Main */
        .discover-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-8) var(--space-6);
          overflow-y: auto;
        }
        .discover-header {
          text-align: center;
          margin-bottom: var(--space-8);
          width: 100%;
          max-width: 420px;
        }
        .discover-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: var(--space-2);
        }
        .discover-subtitle {
          color: var(--text-light);
          font-size: 0.95rem;
          margin-bottom: var(--space-4);
        }
        .discover-progress {
          height: 4px;
          background: rgba(99, 102, 241, 0.15);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .discover-progress-bar {
          height: 100%;
          background: var(--primary-gradient);
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        /* Stack area */
        .discover-stack-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        /* State cards (loading/done/error) */
        .discover-state-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          text-align: center;
          color: var(--text-light);
        }
        .discover-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99,102,241,0.2);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .discover-done-icon { font-size: 3rem; }
        .discover-error { color: var(--error); }

        /* Card stack */
        .card-stack {
          position: relative;
          width: 340px;
          height: 480px;
        }

        .swipe-card {
          position: absolute;
          width: 340px;
          background: white;
          border-radius: var(--radius-2xl);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          transition: transform 0.25s ease;
          will-change: transform;
          top: 0;
          left: 0;
        }

        .swipe-card--top {
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.18);
          cursor: default;
        }

        .swipe-card-avatar {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 4rem;
          flex-shrink: 0;
        }

        .swipe-card-body {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .swipe-card-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .swipe-card-name {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0 0 var(--space-1);
        }

        .swipe-card-role-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          display: inline-block;
        }
        .swipe-card-role-badge[data-role="tutor"] {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
        }
        .swipe-card-role-badge[data-role="student"] {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .swipe-card-price {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary);
          background: rgba(99,102,241,0.08);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-lg);
          white-space: nowrap;
        }

        .swipe-card-meta-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .swipe-card-bio {
          font-size: 0.875rem;
          color: var(--text);
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .swipe-card-remaining {
          font-size: 0.75rem;
          color: var(--text-light);
          text-align: right;
          margin-top: auto;
        }

        /* Action buttons */
        .swipe-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-5);
          padding: var(--space-6) 0 var(--space-4);
        }

        .swipe-btn {
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .swipe-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

        .swipe-btn--pass {
          width: 64px;
          height: 64px;
          background: white;
          color: #ef4444;
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
          border: 2px solid rgba(239,68,68,0.15);
        }
        .swipe-btn--pass:hover:not(:disabled) {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
        }

        .swipe-btn--like {
          width: 72px;
          height: 72px;
          background: var(--primary-gradient);
          color: white;
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }
        .swipe-btn--like:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
        }

        .swipe-btn--undo {
          width: 44px;
          height: 44px;
          background: white;
          color: var(--text-light);
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.08);
        }
        .swipe-btn--undo:hover:not(:disabled) {
          color: var(--primary);
          transform: scale(1.05);
        }

        /* Match overlay */
        .match-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .match-popup {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--space-10) var(--space-8);
          text-align: center;
          max-width: 380px;
          width: 90%;
          box-shadow: 0 40px 100px rgba(0,0,0,0.3);
          animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes popIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .match-avatars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .match-avatar {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1.5rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        .match-heart { font-size: 2rem; }

        .match-title {
          font-size: 2rem;
          font-weight: 800;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--space-2);
        }
        .match-subtitle {
          color: var(--text-light);
          margin-bottom: var(--space-6);
          font-size: 1rem;
          line-height: 1.5;
        }
        .match-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        @media (max-width: 768px) {
          .discover-sidebar { display: none; }
          .card-stack { width: 300px; height: 440px; }
          .swipe-card { width: 300px; }
          .swipe-card-avatar { height: 170px; font-size: 3rem; }
        }
      `}</style>
    </div>
  );
}
