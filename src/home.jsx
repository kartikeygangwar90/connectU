import React from 'react'
import { useRef } from 'react'
import './style.css'
import { replace } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import logo from '../src/assets/connectU_logo.png'

const Home = () => {

  const howItWorkRef = useRef(null);
  const scrollHowItWorks = () => {
    howItWorkRef.current.scrollIntoView({ behavior: "smooth" });
  }

  const home = useRef(null);
  const scrollHome = () => {
    home.current.scrollIntoView({ behavior: "smooth" });
  }

  const about = useRef(null);
  const scrollAbout = () => {
    about.current.scrollIntoView( {behavior: "smooth" });
  }

  const words = ["Connect","Collborate", "Create", "Explore"];

  const [typedWord, setTypedWord] = React.useState("");
  const [wordIndex, setWordIndex] = React.useState(0);
  const [charIndex, setCharindex]  = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  React.useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if(!isDeleting && charIndex < currentWord.length) {
      timeout = setTimeout(() => {
        setTypedWord(currentWord.slice(0, charIndex+1))
        setCharindex(charIndex+1);
      }, 120)
    }
    else if(isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setTypedWord(currentWord.slice(0, charIndex - 1));
        setCharindex(charIndex-1);
      }, 80);
    }
    else{
      timeout = setTimeout(() => {
        if(!isDeleting) setIsDeleting(true);
        else {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, 800)
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  const navigate = useNavigate();
  const WelcomeMainPage = () => {
    navigate("/mainpage", {replace : true})
  }

  return (
    <div className='connectU--m'>
      <div className="nav--bar">
        <img src={logo} alt="logo" className='main--logo' />
        <button className='btn--home' onClick={scrollHome}>Home</button>
        <button onClick={scrollHowItWorks} className='btn--howItWorks'>How It Works ?</button>
      </div>
      <section className='section--home' ref={home}>
        <div className="logo--section">
          <h1 className='connectu--heading'>
            connect<span>U</span>
          </h1>
          <h3>"Build Better Teams for Every Event"</h3>
        </div>
        <div className="description">
          <h3>Build Your Dream Team for College Competitions</h3>
          <h3>Find the right Teammates with matching skills, interests and Experience .</h3>
        </div>
        <button className='getStarted--btn' onClick={WelcomeMainPage}>Get Started</button>
      </section>
      <section className='web--description' ref={about}>
        <p className='intro--text'>We help you to </p>

        <h2 className='typing--line'>
          {/* <span className='static-text'>Connect ,</span> */}
          <span className='dynamic--text'>{typedWord}</span>
          <span className='cursor--typing'>|</span>
        </h2>

        <p className='desc--para'>
          <strong>Many</strong> college students <strong>miss out</strong> on competitions and events not because of lack of talent, but due to <strong>limited awareness</strong>, difficulty in finding the right teammates, and lack of direct access to seniors or event organizers.<br></br>
          <strong>connectU</strong> is built to solve this problem by acting as a <strong>one-stop platform</strong> where students can discover upcoming college events, <strong>find or form teams</strong> based on skills and interests, and <strong>communicate</strong> directly with teammates and seniors for quick guidance. By bringing opportunities, <strong>collaboration</strong>, and mentorship into a single space, connectU helps students participate <strong>with</strong> confidence and clarity.
        </p>
        <h4 className='conclusion'>connectU connects students, ideas, and opportunities—so no ambition goes unheard or unsupported.</h4>
      </section>
      <section className='section--howItWorks' ref={howItWorkRef}>
        <h2 className='working--heading'>How it works !!</h2>
        <div className="working--boxes">
          <div className="working--box">
            <h3>Register & Set Up Your Profile</h3>
            <p>"Share your skills, interests, availability, and Contact Info"</p>
          </div>
          <div className="working--box">
            <h3>Search & Filter for Teammates</h3>
            <p>"Use smart filters to find ideal team members."</p>
          </div>
          <div className="working--box">
            <h3>Connect & Build Teams</h3>
            <p>"Send requests and form your team instantly"</p>
          </div>
        </div>
      </section>
      <section className='section--footer'>
        <div className="footer--content">
          <h2>connectU</h2>
          <button className='navigation--btn' onClick={scrollHome}>Home</button><span>|</span>
          <button className='navigation--btn'onClick={scrollAbout}>About</button><span>|</span>
          <button className='navigation--btn'>Contact</button>
        </div>
      </section>

    </div>
  )
}

export default Home