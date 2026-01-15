import React from "react";
import { useRef, useEffect, useState } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import logo from "./assets/connect.webp";
import { useAuth } from "./AuthContext";

// Define words outside component to avoid unnecessary re-renders
const TYPING_WORDS = ["Connect", "Collaborate", "Create", "Compete"];

const Home = () => {
  const { logOut } = useAuth();
  const howItWorkRef = useRef(null);
  const featuresRef = useRef(null);
  const home = useRef(null);
  const about = useRef(null);

  const scrollHowItWorks = () => {
    howItWorkRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollHome = () => {
    home.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollAbout = () => {
    about.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollFeatures = () => {
    featuresRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const [typedWord, setTypedWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharindex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  useEffect(() => {
    const currentWord = TYPING_WORDS[wordIndex];
    let timeout;

    if (!isDeleting && charIndex < currentWord.length) {
      timeout = setTimeout(() => {
        setTypedWord(currentWord.slice(0, charIndex + 1));
        setCharindex(charIndex + 1);
      }, 120);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setTypedWord(currentWord.slice(0, charIndex - 1));
        setCharindex(charIndex - 1);
      }, 80);
    } else {
      timeout = setTimeout(() => {
        if (!isDeleting) setIsDeleting(true);
        else {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
        }
      }, 800);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useNavigate();

  const WelcomeMainPage = () => {
    navigate("/app/events", { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const stats = [
    { number: "500+", label: "Students Registered" },
    { number: "100+", label: "Teams Formed" },
    { number: "50+", label: "Events Listed" },
    { number: "95%", label: "Success Rate" },
  ];

  const features = [
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Smart Matching",
      description:
        "Our algorithm matches you with teammates based on skills, interests, and experience level.",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: "Event Discovery",
      description:
        "Browse upcoming hackathons, competitions, and events. Never miss an opportunity again.",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: "Direct Communication",
      description:
        "Connect directly with potential teammates and team leaders through our platform.",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: "Skill Showcase",
      description:
        "Highlight your technical and soft skills to attract the right teams and opportunities.",
    },
  ];

  return (
    <div className="connectU--m">
      <nav className={`nav--bar ${isNavScrolled ? "nav--scrolled" : ""}`}>
        <img src={logo} alt="ConnectU Logo" className="main--logo" />
        <div style={{ flex: 1 }} />
        <button className="btn--home" onClick={scrollHome}>
          Home
        </button>
        <button className="btn--howItWorks" onClick={scrollFeatures}>
          Features
        </button>
        <button className="btn--howItWorks" onClick={scrollHowItWorks}>
          How It Works
        </button>
        <button
          className="btn--howItWorks"
          onClick={handleLogout}
          style={{
            background: "rgba(239, 68, 68, 0.2)",
            color: "#fca5a5",
            marginLeft: "0.5rem",
          }}
        >
          Logout
        </button>
      </nav>

      <section className="section--home" ref={home}>
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="logo--section">
          <span className="hero-badge">🎓 Built for NIT Patna Students</span>
          <h1 className="connectu--heading">
            connect<span>U</span>
          </h1>
          <h3>"Build Better Teams for Every Event"</h3>
        </div>

        <div className="description">
          <h3>Build Your Dream Team for College Competitions</h3>
          <h3>
            Find the right teammates with matching skills, interests, and
            experience.
          </h3>
        </div>

        <div className="hero-buttons">
          <button className="getStarted--btn" onClick={WelcomeMainPage}>
            <span>Get Started</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button className="secondary-btn" onClick={scrollHowItWorks}>
            Learn More
          </button>
        </div>

        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="web--description" ref={about}>
        <p className="intro--text">We help you to</p>
        <h2 className="typing--line">
          <span className="dynamic--text">{typedWord}</span>
          <span className="cursor--typing">|</span>
        </h2>

        <p className="desc--para">
          <strong>Many</strong> college students <strong>miss out</strong> on
          competitions and events not because of lack of talent, but due to{" "}
          <strong>limited awareness</strong>, difficulty in finding the right
          teammates, and lack of direct access to seniors or event organizers.
          <br />
          <br />
          <strong>ConnectU</strong> is built to solve this problem by acting as
          a <strong>one-stop platform</strong> where students can discover
          upcoming college events, <strong>find or form teams</strong> based on
          skills and interests, and <strong>communicate</strong> directly with
          teammates and seniors for quick guidance.
        </p>

        <h4 className="conclusion">
          ConnectU connects students, ideas, and opportunities—so no ambition
          goes unheard or unsupported.
        </h4>
      </section>

      <section className="features-section" ref={featuresRef}>
        <h2 className="features-heading">Why Choose ConnectU?</h2>
        <p className="features-subheading">
          Everything you need to find the perfect team
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section--howItWorks" ref={howItWorkRef}>
        <h2 className="working--heading">How ConnectU Works</h2>
        <p className="working-subheading">
          Get started in just three simple steps
        </p>

        <div className="working--boxes">
          <div className="working--box">
            <div className="step-number">1</div>
            <div className="step-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>Create Your Profile</h3>
            <p>
              Share your skills, interests, availability, and contact info to
              let others discover you.
            </p>
          </div>

          <div className="working--box">
            <div className="step-number">2</div>
            <div className="step-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>Discover & Search</h3>
            <p>
              Browse events, find teams looking for members, or search for
              teammates with specific skills.
            </p>
          </div>

          <div className="working--box">
            <div className="step-number">3</div>
            <div className="step-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h3>Connect & Build</h3>
            <p>
              Send team requests, connect with members, and build your dream
              team instantly.
            </p>
          </div>
        </div>

        <div className="cta-section">
          <h3>Ready to find your perfect team?</h3>
          <button className="getStarted--btn" onClick={WelcomeMainPage}>
            <span>Start Exploring</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      <section className="section--footer">
        <div className="footer--content">
          <div className="footer-brand">
            <h2>connectU</h2>
            <p>Building better teams for NIT Patna</p>
          </div>
          <div className="footer-links">
            <button className="navigation--btn" onClick={scrollHome}>
              Home
            </button>
            <span>|</span>
            <button className="navigation--btn" onClick={scrollAbout}>
              About
            </button>
            <span>|</span>
            <button className="navigation--btn" onClick={scrollFeatures}>
              Features
            </button>
            <span>|</span>
            <button
              className="navigation--btn"
              onClick={() => navigate("/policy")}
            >
              Terms
            </button>
          </div>
          <p className="footer-copyright">
            © 2026 ConnectU. Made with ❤️ for NIT Patna students.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
