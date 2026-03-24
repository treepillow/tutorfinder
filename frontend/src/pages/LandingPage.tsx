import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import lottie from 'lottie-web';

function LottiePlayer({ animationData, loop, style }: { animationData: object; loop: boolean; style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      animationData,
      loop,
      autoplay: true,
      renderer: 'svg',
    });
    return () => anim.destroy();
  }, [animationData, loop]);
  return <div ref={containerRef} style={style} />;
}
import { 
  Star, 
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Users,
  Award,
  Search,
  Calendar,
  MessageCircle
} from 'lucide-react';

import calendarAnimation from '../assets/schedule.json';
import educationAnimation from '../assets/Education edit.json';
import teacherAnimation from '../assets/Teacher.json';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(3);

  const profiles = [
    { id: 1, name: 'John D.', role: 'Tutor', subject: 'Mathematics', rating: 4.9, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', initials: 'JD', description: 'Expert math tutor with 10+ years experience' },
    { id: 2, name: 'Sarah M.', role: 'Student', subject: 'Looking for Physics', rating: null, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', initials: 'SM', description: 'High school student seeking physics help' },
    { id: 3, name: 'Alex K.', role: 'Tutor', subject: 'Chemistry', rating: 5.0, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', initials: 'AK', description: 'PhD in Chemistry, patient and thorough' },
    { id: 4, name: 'Emily R.', role: 'Student', subject: 'Needs Math Help', rating: null, color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', initials: 'ER', description: 'College freshman struggling with calculus' },
    { id: 5, name: 'Mike T.', role: 'Tutor', subject: 'Physics', rating: 4.8, color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', initials: 'MT', description: 'Physics enthusiast making complex topics simple' },
    { id: 6, name: 'Lisa W.', role: 'Student', subject: 'Biology Tutor', rating: null, color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', initials: 'LW', description: 'Pre-med student looking for biology guidance' },
    { id: 7, name: 'David C.', role: 'Tutor', subject: 'English Lit', rating: 4.9, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', initials: 'DC', description: 'Published author and literature expert' },
    { id: 8, name: 'Anna B.', role: 'Student', subject: 'History Help', rating: null, color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', initials: 'AB', description: 'AP History student aiming for top scores' },
  ];

  const goToCard = (newIndex: number) => {
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= profiles.length) newIndex = profiles.length - 1;
    setActiveIndex(newIndex);
  };

  const prevCard = () => goToCard(activeIndex - 1);
  const nextCard = () => goToCard(activeIndex + 1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.hero-subtitle',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
      );

      // Fade-in animation for carousel cards on page load
      gsap.fromTo('.carousel-card',
        { 
          opacity: 0, 
          scale: 0.9
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: {
            each: 0.08,
            from: 'center'
          },
          ease: 'power2.out',
          delay: 0.4
        }
      );

      // How it works section animation
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
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Reviews section animation
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
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-page">
      <section ref={heroRef} className="hero-section minimal">
        <div className="container">
          <div className="hero-header">
            <h1 className="hero-title">
              Tutor<span className="gradient-text">Finder</span>
            </h1>
            <p className="hero-subtitle">
              Connecting students with the perfect tutors
            </p>
          </div>

          <div className="hero-visual">
            <div className="carousel-wrapper">
              <button 
                className="carousel-nav prev" 
                onClick={prevCard}
                disabled={activeIndex === 0}
              >
                <ArrowLeft size={28} />
              </button>

              <div className="carousel-track">
                {profiles.map((profile, index) => {
                  const offset = index - activeIndex;
                  const absOffset = Math.abs(offset);
                  
                  const x = offset * 200;
                  const y = absOffset * 15;
                  const scale = offset === 0 ? 1.05 : Math.max(0.85 - absOffset * 0.08, 0.5);
                  const opacity = absOffset > 3 ? 0 : (offset === 0 ? 1 : Math.max(0.7 - absOffset * 0.2, 0.3));
                  const rotateY = offset * -12;
                  const blur = offset === 0 ? 0 : Math.min(absOffset * 2, 6);
                  const zIndex = 10 - absOffset;
                  
                  return (
                    <div
                      key={profile.id}
                      className={`carousel-card ${offset === 0 ? 'active' : ''}`}
                      style={{
                        transform: `translateX(${x}px) translateY(${y}px) scale(${scale}) rotateY(${rotateY}deg)`,
                        opacity,
                        zIndex,
                        filter: `blur(${blur}px)`,
                      }}
                      onClick={() => goToCard(index)}
                    >
                      <div className="carousel-card-inner">
                        <div className="profile-avatar-large" style={{ background: profile.color }}>
                          <span>{profile.initials}</span>
                        </div>
                        <div className="profile-details">
                          <div className="profile-name-large">{profile.name}</div>
                          <div className="profile-role-badge-large" data-role={profile.role.toLowerCase()}>
                            {profile.role}
                          </div>
                          <div className="profile-subject-large">{profile.subject}</div>
                          <div className="profile-rating-large" style={{ visibility: profile.rating ? 'visible' : 'hidden' }}>
                            <Star size={16} fill="#fbbf24" color="#fbbf24" />
                            <span>{profile.rating}</span>
                          </div>
                          <p className="profile-description" style={{ visibility: offset === 0 ? 'visible' : 'hidden' }}>{profile.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                className="carousel-nav next" 
                onClick={nextCard}
                disabled={activeIndex === profiles.length - 1}
              >
                <ArrowRight size={28} />
              </button>

              <div className="carousel-dots">
                {profiles.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => goToCard(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-wave">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,60 1440,50 L1440,100 L0,100 Z" fill="white" />
          </svg>
        </div>
      </section>

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
              <div className="how-card-icon lottie-icon">
                <LottiePlayer animationData={calendarAnimation} loop={true} style={{ width: 48, height: 48 }} />
              </div>
              <div className="how-card-number">02</div>
              <h3 className="how-card-title">Schedule Sessions</h3>
              <p className="how-card-desc">
                Book sessions at times that work for you. Our smart matching system finds tutors available when you need them.
              </p>
            </div>

            <div className="how-card">
              <div className="how-card-icon lottie-icon">
                <LottiePlayer animationData={educationAnimation} loop={true} style={{ width: 48, height: 48 }} />
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
              <div className="feature-graphic lottie-feature">
                <LottiePlayer animationData={teacherAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

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
        .landing-page { padding-top: 80px; }
        .hero-section.minimal { position: relative; padding: var(--space-12) 0 var(--space-20); background: linear-gradient(135deg, #fafafa 0%, #f0f4ff 50%, #faf5ff 100%); overflow: hidden; min-height: 600px; }
        .hero-header { text-align: center; margin-bottom: var(--space-8); }
        .hero-title { font-size: 3rem; font-weight: 800; margin-bottom: var(--space-2); line-height: 1.1; }
        .hero-subtitle { font-size: 1.125rem; color: var(--text-light); margin: 0; }
        .gradient-text { background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-visual { position: relative; height: 420px; display: flex; align-items: center; justify-content: center; perspective: 1200px; }
        .carousel-wrapper { position: relative; width: 100%; max-width: 900px; height: 100%; display: flex; align-items: center; justify-content: center; }
        .carousel-track { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transform-style: preserve-3d; }
        .carousel-card { position: absolute; width: 260px; height: 300px; background: white; border-radius: var(--radius-2xl); padding: var(--space-6); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); cursor: pointer; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), filter 0.5s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform, opacity, filter; overflow: hidden; }
        .carousel-card.active { box-shadow: 0 35px 90px rgba(0, 0, 0, 0.25); }
        .carousel-card:hover:not(.active) { filter: brightness(1.1); }
        .carousel-card-inner { display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-4); }
        .profile-avatar-large { width: 85px; height: 85px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.75rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); }
        .profile-details { display: flex; flex-direction: column; gap: var(--space-2); }
        .profile-name-large { font-weight: 800; color: var(--text-dark); font-size: 1.25rem; }
        .profile-role-badge-large { font-size: 0.7rem; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full); display: inline-block; align-self: center; }
        .profile-role-badge-large[data-role="tutor"] { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
        .profile-role-badge-large[data-role="student"] { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .profile-subject-large { font-size: 0.9rem; color: var(--text-light); }
        .profile-rating-large { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.9rem; font-weight: 600; color: var(--warning); }
        .profile-description { font-size: 0.8rem; color: var(--text-light); margin-top: var(--space-2); line-height: 1.5; max-width: 200px; }
        .carousel-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 50px; height: 50px; background: white; border: none; border-radius: var(--radius-full); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--primary); transition: all 0.2s; z-index: 20; }
        .carousel-nav:hover:not(:disabled) { transform: translateY(-50%) scale(1.1); background: var(--primary); color: white; box-shadow: 0 6px 25px rgba(99, 102, 241, 0.3); }
        .carousel-nav:disabled { opacity: 0.3; cursor: not-allowed; }
        .carousel-nav.prev { left: 0; }
        .carousel-nav.next { right: 0; }
        .carousel-dots { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); display: flex; gap: var(--space-2); z-index: 20; }
        .dot { width: 10px; height: 10px; border-radius: var(--radius-full); background: rgba(99, 102, 241, 0.3); border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .dot:hover { background: rgba(99, 102, 241, 0.5); }
        .dot.active { background: var(--primary); width: 30px; }
        .hero-wave { position: absolute; bottom: 0; left: 0; right: 0; height: 100px; }
        .hero-wave svg { width: 100%; height: 100%; }
        .how-it-works-section { padding: var(--space-20) 0; background: white; }
        .section-badge { display: inline-block; padding: var(--space-2) var(--space-4); background: rgba(99, 102, 241, 0.1); color: var(--primary); font-size: 0.875rem; font-weight: 600; border-radius: var(--radius-full); margin-bottom: var(--space-4); }
        .how-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-8); margin-top: var(--space-12); }
        .how-card { text-align: center; padding: var(--space-8); background: var(--bg); border-radius: var(--radius-2xl); transition: all var(--transition); position: relative; overflow: hidden; }
        .how-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }
        .how-card:hover .how-card-icon { transform: scale(1.1) rotate(5deg); }
        .how-card-icon { width: 80px; height: 80px; background: var(--primary-gradient); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; color: white; margin: 0 auto var(--space-6); transition: transform 0.3s ease; animation: iconFloat 3s ease-in-out infinite; }
        .how-card-icon.lottie-icon { background: white; padding: var(--space-2); }
        .how-card:nth-child(1) .how-card-icon { animation-delay: 0s; }
        .how-card:nth-child(2) .how-card-icon { animation-delay: 0.5s; }
        .how-card:nth-child(3) .how-card-icon { animation-delay: 1s; }
        @keyframes iconFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .how-card-number { position: absolute; top: var(--space-4); right: var(--space-4); font-size: 4rem; font-weight: 800; color: var(--primary); opacity: 0.1; }
        .how-card-title { font-size: 1.5rem; margin-bottom: var(--space-4); }
        .how-card-desc { color: var(--text-light); line-height: 1.7; }
        .features-section { padding: var(--space-20) 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-16); align-items: center; }
        .feature-list { margin-top: var(--space-8); display: flex; flex-direction: column; gap: var(--space-6); }
        .feature-item { display: flex; align-items: flex-start; gap: var(--space-4); }
        .feature-icon { width: 48px; height: 48px; background: white; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; color: var(--primary); box-shadow: var(--shadow); }
        .feature-visual { position: relative; height: 400px; }
        .feature-graphic { position: relative; width: 100%; height: 100%; background: var(--primary-gradient); border-radius: var(--radius-2xl); overflow: hidden; }
        .feature-graphic.lottie-feature { background: white; display: flex; align-items: center; justify-content: center; }
        .feature-floating { position: absolute; background: white; border-radius: var(--radius-lg); padding: var(--space-4); box-shadow: var(--shadow-lg); color: var(--primary); }
        .feature-floating-1 { top: 20%; left: 15%; }
        .feature-floating-2 { top: 40%; right: 20%; }
        .feature-floating-3 { bottom: 25%; left: 30%; }
        .reviews-section { padding: var(--space-20) 0; background: white; }
        .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-8); margin-top: var(--space-12); }
        .review-card { background: var(--bg); padding: var(--space-8); border-radius: var(--radius-2xl); transition: all var(--transition); }
        .review-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .review-stars { display: flex; gap: var(--space-1); margin-bottom: var(--space-4); }
        .review-text { font-size: 1rem; line-height: 1.7; margin-bottom: var(--space-6); color: var(--text); }
        .review-author { display: flex; align-items: center; gap: var(--space-3); }
        .review-avatar { width: 48px; height: 48px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.875rem; }
        .review-name { font-weight: 700; color: var(--text-dark); }
        .review-role { font-size: 0.875rem; color: var(--text-light); }
        .cta-section { padding: var(--space-20) 0; background: var(--primary-gradient); text-align: center; }
        .cta-content h2 { color: white; margin-bottom: var(--space-4); }
        .cta-content p { color: rgba(255, 255, 255, 0.9); font-size: 1.25rem; margin-bottom: var(--space-8); }
        .cta-content .btn-primary { background: white; color: var(--primary); }
        @media (max-width: 1024px) { .features-grid { grid-template-columns: 1fr; } .carousel-nav { display: none; } .carousel-card { width: 220px; } }
        @media (max-width: 768px) { .how-cards, .reviews-grid { grid-template-columns: 1fr; } .hero-title { font-size: 2rem; } .carousel-card { width: 170px; padding: var(--space-4); } .profile-avatar-large { width: 60px; height: 60px; font-size: 1.25rem; } }
      `}</style>
    </div>
  );
}
