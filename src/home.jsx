import React from 'react'
import { useRef } from 'react'
import './style.css'

const Home = () => {

  const howItWorkRef = useRef(null);
  const scrollHowItWorks = () => {
    howItWorkRef.current.scrollIntoView({ behavior : "smooth"});
  }

  return (
    <div className='connectU--m'>
      <div className="nav--bar">
        <img src="./src/assets/connectU_logo.png" alt="logo" className='main--logo'/>
        <a href='#' className='Home--btn'>Home</a>
        <button onClick={scrollHowItWorks} className='btn--howItWorks'>How It Works ?</button>
      </div>
      <section className='section--home'>
        <h2>Main Description Site</h2>
      </section>
      <section className='section--howItWorks' ref={howItWorkRef}>
        <h2>How it works !!</h2>
      </section>

    </div>
  )
}

export default Home