import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Search, 
  Calendar, 
  MessageCircle, 
  Star, 
  ArrowRight,
  BookOpen,
  Users,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      heroTl
        .fromTo('.hero-badge', 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6 }
        )
        .fromTo('.hero-title', 
          { y: 50, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8 }, 
          '-=0.3'
        )
        .fromTo('.hero-subtitle', 
          { y: 40, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6 }, 
          '-=0.4'
        )
        .fromTo('.hero-cta', 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5 }, 
          '-=0.3'
        )
        .fromTo('.hero-visual', 
          { scale: 0.8, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 1 }, 
          '-=0.6'
        );

      // Floating animation for hero elements
      gsap.to('.float-1', {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
      
      gsap.to('.float-2', {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 0.5
      });
      
      gsap.to('.float-3', {
        y: -25,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1
      });

      // Stats counter animation
      gsap.fromTo('.stat-item', 
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
          }
        }
      );

      // How it works cards
      gsap.fromTo('.how-card', 
        { y: 60, opacity: 0, rotateX: 15 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: 'top 75%',
          }
        }
      );

      // Reviews animation
      gsap.fromTo('.review-card', 
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: reviewsRef.current,
            start: 'top 75%',
          }
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <Award size={16} />
                <span>Trusted by 10,000+ students</span>
              </div>
              
              <h1 className="hero-title">
                Find Your Perfect{' '}
                <span className="gradient-text">Tutor</span>{' '}
                Today
              </h1>
              
              <p className="hero-subtitle">
                Connect with expert tutors who match your learning style, schedule, 
                and academic goals. Start your journey to academic excellence.
              </p>
              
              <div className="hero-cta">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => onNavigate('register')}
                >
                  Get Started
                  <ArrowRight size={20} />
                </button>
                <button 
                  className="btn btn-secondary btn-lg"
                  onClick={() => onNavigate('login')}
                >
                  Sign In
                </button>
              </div>

              <div ref={statsRef} className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">5,000+</div>
                  <div className="stat-label">Expert Tutors</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50,000+</div>
                  <div className="stat-label">Happy Students</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-graphic">
                <div className="floating-card float-1 card-tutor">
                  <div className="floating-avatar" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <span>JD</span>
                  </div>
                  <div className="floating-info">
                    <div className="floating-name">John D.</div>
                    <div className="floating-subject">Mathematics</div>
                    <div className="floating-rating">
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
                
                <div className="floating-card float-2 card-student">
                  <div className="floating-avatar" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <span>MS</span>
                  </div>
                  <div className="floating-info">
                    <div className="floating-name">Mary S.</div>
                    <div className="floating-subject">Looking for Physics</div>
                    <div className="floating-badge">New Match!</div>
                  </div>
                </div>
                
                <div className="floating-card float-3 card-match">
                  <div className="match-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="match-text">Perfect Match!</div>
                </div>

                <div className="hero-illustration">
                  <svg viewBox="0 0 400 300" className="hero-svg">
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    
                    {/* Abstract shapes */}
                    <circle cx="200" cy="150" r="120" fill="url(#grad1)" />
                    <circle cx="150" cy="100" r="60" fill="rgba(99, 102, 241, 0.2)" />
                    <circle cx="280" cy="180" r="80" fill="rgba(168, 85, 247, 0.15)" />
                    <circle cx="100" cy="200" r="40" fill="rgba(99, 102, 241, 0.1)" />
                    
                    {/* Books */}
                    <rect x="160" y="120" width="30" height="80" rx="4" fill="#6366f1" />
                    <rect x="170" y="110" width="30" height="80" rx="4" fill="#8b5cf6" />
                    <rect x="180" y="100" width="30" height="80" rx="4" fill="#a855f7" />
                    
                    {/* Graduation cap */}
                    <path d="M200 60 L240 80 L200 100 L160 80 Z" fill="#4f46e5" />
                    <rect x="198" y="80" width="4" height="30" fill="#4f46e5" />
                    <circle cx="240" cy="80" r="8" fill="#fbbf24" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-wave">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path 
              d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,60 1440,50 L1440,100 L0,100 Z" 
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">Three Simple Steps to Success</h2>
            <p className="section-subtitle">
              Getting started with TutorFinder is easy. Follow these simple steps to connect with your ideal tutor.
            </p>
          </div>

          <div className="how-cards">
            <div className="how-card">
              <div className="how-card-icon">
                <Search size={32} />
              </div>
              <div className="how-card-number">01</div>
              <h3 className="how-card-title">Find Your Tutor</h3>
              <p className="how-card-desc">
                Browse through our extensive network of verified tutors. Filter by subject, location, price, and availability.
              </p>
            </div>

            <div className="how-card">
              <div className="how-card-icon">
                <Calendar size={32} />
              </div>
              <div className="how-card-number">02</div>
              <h3 className="how-card-title">Schedule Sessions</h3>
              <p className="how-card-desc">
                Book sessions at times that work for you. Our smart matching system finds tutors available when you need them.
              </p>
            </div>

            <div className="how-card">
              <div className="how-card-icon">
                <MessageCircle size={32} />
              </div>
              <div className="how-card-number">03</div>
              <h3 className="how-card-title">Start Learning</h3>
              <p className="how-card-desc">
                Connect with your tutor and begin your learning journey. Track progress and achieve your academic goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-content">
              <span className="section-badge">Why Choose Us</span>
              <h2 className="section-title">Personalized Learning Experience</h2>
              <p className="section-subtitle">
                We believe every student deserves a tailored learning experience. Our platform uses advanced matching algorithms to pair you with tutors who understand your unique needs.
              </p>
              
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4>Verified Tutors</h4>
                    <p>All tutors are background-checked and verified</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4>All Subjects</h4>
                    <p>From math to music, find tutors for any subject</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Star size={20} />
                  </div>
                  <div>
                    <h4>Rated & Reviewed</h4>
                    <p>Read honest reviews from real students</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="feature-visual">
              <div className="feature-graphic">
                <div className="feature-floating feature-floating-1">
                  <BookOpen size={32} />
                </div>
                <div className="feature-floating feature-floating-2">
                  <Star size={28} />
                </div>
                <div className="feature-floating feature-floating-3">
                  <Users size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" ref={reviewsRef} className="reviews-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">
              Join thousands of satisfied students who found their perfect tutor match.
            </p>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="review-text">
                "TutorFinder helped me find an amazing math tutor who understood exactly what I needed. My grades improved from a C to an A in just one semester!"
              </p>
              <div className="review-author">
                <div className="review-avatar" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <span>SK</span>
                </div>
                <div>
                  <div className="review-name">Sarah K.</div>
                  <div className="review-role">High School Student</div>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="review-text">
                "As a tutor, this platform has connected me with wonderful students. The scheduling system is seamless and the payment process is hassle-free."
              </p>
              <div className="review-author">
                <div className="review-avatar" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <span>MR</span>
                </div>
                <div>
                  <div className="review-name">Michael R.</div>
                  <div className="review-role">Physics Tutor</div>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="review-text">
                "The flexibility to choose between online and in-person sessions made all the difference. I could fit tutoring around my busy schedule."
              </p>
              <div className="review-author">
                <div className="review-avatar" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <span>EJ</span>
                </div>
                <div>
                  <div className="review-name">Emily J.</div>
                  <div className="review-role">University Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>Join thousands of students and tutors on TutorFinder today.</p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('register')}
            >
              Create Free Account
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          padding-top: 80px;
        }

        .hero-section {
          position: relative;
          padding: var(--space-20) 0;
          background: linear-gradient(135deg, #fafafa 0%, #f0f4ff 50%, #faf5ff 100%);
          overflow: hidden;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-12);
          align-items: center;
        }

        .hero-content {
          max-width: 560px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: white;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary);
          box-shadow: var(--shadow);
          margin-bottom: var(--space-6);
        }

        .hero-title {
          margin-bottom: var(--space-6);
          line-height: 1.1;
        }

        .gradient-text {
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: var(--space-8);
          line-height: 1.7;
        }

        .hero-cta {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-12);
        }

        .hero-stats {
          display: flex;
          gap: var(--space-10);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-dark);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .hero-visual {
          position: relative;
          height: 500px;
        }

        .hero-graphic {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hero-illustration {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-svg {
          width: 100%;
          max-width: 400px;
          height: auto;
        }

        .floating-card {
          position: absolute;
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-4);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          z-index: 10;
        }

        .card-tutor {
          top: 10%;
          left: 0;
        }

        .card-student {
          top: 30%;
          right: 0;
        }

        .card-match {
          bottom: 20%;
          left: 10%;
          flex-direction: column;
          text-align: center;
          padding: var(--space-5);
        }

        .floating-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .floating-name {
          font-weight: 700;
          color: var(--text-dark);
          font-size: 0.875rem;
        }

        .floating-subject {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .floating-rating {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--warning);
        }

        .floating-badge {
          font-size: 0.625rem;
          font-weight: 700;
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
        }

        .match-icon {
          width: 56px;
          height: 56px;
          background: var(--primary-gradient);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: var(--space-2);
        }

        .match-text {
          font-weight: 700;
          color: var(--primary);
          font-size: 0.875rem;
        }

        .hero-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
        }

        .hero-wave svg {
          width: 100%;
          height: 100%;
        }

        /* How It Works Section */
        .how-it-works-section {
          padding: var(--space-20) 0;
          background: white;
        }

        .section-badge {
          display: inline-block;
          padding: var(--space-2) var(--space-4);
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          margin-bottom: var(--space-4);
        }

        .how-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-8);
          margin-top: var(--space-12);
        }

        .how-card {
          text-align: center;
          padding: var(--space-8);
          background: var(--bg);
          border-radius: var(--radius-2xl);
          transition: all var(--transition);
          position: relative;
          overflow: hidden;
        }

        .how-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
        }

        .how-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--primary-gradient);
          transform: scaleX(0);
          transition: transform var(--transition);
        }

        .how-card:hover::before {
          transform: scaleX(1);
        }

        .how-card-icon {
          width: 80px;
          height: 80px;
          background: var(--primary-gradient);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto var(--space-6);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }

        .how-card-number {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          font-size: 4rem;
          font-weight: 800;
          color: var(--primary);
          opacity: 0.1;
          line-height: 1;
        }

        .how-card-title {
          font-size: 1.5rem;
          margin-bottom: var(--space-4);
        }

        .how-card-desc {
          color: var(--text-light);
          line-height: 1.7;
        }

        /* Features Section */
        .features-section {
          padding: var(--space-20) 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
          align-items: center;
        }

        .feature-list {
          margin-top: var(--space-8);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          box-shadow: var(--shadow);
          flex-shrink: 0;
        }

        .feature-item h4 {
          font-size: 1.125rem;
          margin-bottom: var(--space-1);
        }

        .feature-item p {
          font-size: 0.875rem;
        }

        .feature-visual {
          position: relative;
          height: 400px;
        }

        .feature-graphic {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--primary-gradient);
          border-radius: var(--radius-2xl);
          overflow: hidden;
        }

        .feature-floating {
          position: absolute;
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-lg);
          color: var(--primary);
        }

        .feature-floating-1 {
          top: 20%;
          left: 15%;
          animation: float 4s ease-in-out infinite;
        }

        .feature-floating-2 {
          top: 40%;
          right: 20%;
          animation: float 3.5s ease-in-out infinite 0.5s;
        }

        .feature-floating-3 {
          bottom: 25%;
          left: 30%;
          animation: float 5s ease-in-out infinite 1s;
        }

        /* Reviews Section */
        .reviews-section {
          padding: var(--space-20) 0;
          background: white;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-8);
          margin-top: var(--space-12);
        }

        .review-card {
          background: var(--bg);
          padding: var(--space-8);
          border-radius: var(--radius-2xl);
          transition: all var(--transition);
        }

        .review-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .review-stars {
          display: flex;
          gap: var(--space-1);
          margin-bottom: var(--space-4);
        }

        .review-text {
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: var(--space-6);
          color: var(--text);
        }

        .review-author {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .review-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .review-name {
          font-weight: 700;
          color: var(--text-dark);
        }

        .review-role {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        /* CTA Section */
        .cta-section {
          padding: var(--space-20) 0;
          background: var(--primary-gradient);
          text-align: center;
        }

        .cta-content h2 {
          color: white;
          margin-bottom: var(--space-4);
        }

        .cta-content p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.25rem;
          margin-bottom: var(--space-8);
        }

        .cta-content .btn-primary {
          background: white;
          color: var(--primary);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .cta-content .btn-primary:hover {
          background: var(--bg);
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-grid,
          .features-grid {
            grid-template-columns: 1fr;
            gap: var(--space-8);
          }

          .how-cards,
          .reviews-grid {
            grid-template-columns: 1fr;
          }

          .hero-visual {
            height: 350px;
            order: -1;
          }

          .hero-stats {
            gap: var(--space-6);
          }

          .floating-card {
            transform: scale(0.9);
          }
        }

        @media (max-width: 768px) {
          .hero-cta {
            flex-direction: column;
          }

          .hero-stats {
            flex-direction: column;
            gap: var(--space-4);
          }

          .floating-card {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
