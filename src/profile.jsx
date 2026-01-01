
import React from "react";
import './style.css'
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import{ auth, dataBase } from "./firebase"

function ProfileSetup() {

    const [step, setStep] = React.useState(1);

    const nextStep = () => {
        if (step < 5) setStep(step + 1);

    };
    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const [userData, setUserData] = React.useState({
        fullName: "",
        roll: "",
        bio: "",
        college: "",
        course: "",
        branch: "",
        year: "",
        technicalSkills: [],
        softSkills: [],
        interests: [],
        generalInterest: [],
        experience: "",
        nitpemail: "",
        pemail: "",
        phone: "",
        availability: "",
        profileCompleted: true
    })

    // Logic for step 2 starts here ------------------>

    //  for Technical skills ---------------------------->
    const [skillInput, setSkillInput] = React.useState("");
    const techSkills = ["React js", "Node JS", " UI / Ux Developer", "Robotics"]
    const toggleTechSkills = (skill) => {
        if (!skill.trim()) return;
        setUserData((prev) => {
            if (!prev.technicalSkills.includes(skill) && prev.technicalSkills.length >= 10) return prev;
            return {
                ...prev, technicalSkills: prev.technicalSkills.includes(skill) ? prev.technicalSkills.filter((i) => i !== skill) : [...prev.technicalSkills, skill]
            }
        })
        setSkillInput("");
    }
    //   for Soft Skills ---------------------------->
    const [softSkillInput, setSoftSkillInput] = React.useState("");
    const softSkills = ["Leadership", "Problem Solving", "Critical Thinking", "Team work"]
    const toggleSoftSklls = (skill) => {
        if (!skill) return;
        setUserData((prev) => {
            if (!prev.softSkills.includes(skill) && prev.softSkills.length >= 10) return prev;
            return {
                ...prev, softSkills: prev.softSkills.includes(skill) ? prev.softSkills.filter((i) => i !== skill) : [...prev.softSkills, skill]
            }
        }
        )
        setSoftSkillInput("")
    }
    //  For Experience level of user ------------------------------->
    const experience = ["Beginner", "Intermediate", "Advanced", "Expert"]
    const toggleExperience = (level) => {
        setUserData((prev) => ({
            ...prev,
            experience: prev.experience === level ? "" : level
        })
        )
    }
    // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    //  Logic for step 3 starts here --------------------------------->

    // for Interest of user -------------------------->
    const mainInterest = ["Web Development", "Data Science", "AI / Ml", "Game development", "Social Impact", "App Decelopment", "E-Commerce", "Sports", "Health Tech"]
    const toggleMainInterest = (interest) => {
        setUserData((prev) => ({
            ...prev, interests: prev.interests.includes(interest) ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest]
        }))
    }
    // for General interests also ------------------------------------>
    const interests = ["Startups", "Research", "Open Source", "Competition", "Hackathon", "Freelancing", "Learning New Tech"];
    const toggleGeneralInterest = (interest) => {
        setUserData((prev) => ({
            ...prev, generalInterest: prev.generalInterest.includes(interest) ? prev.generalInterest.filter((i) => i !== interest) : [...prev.generalInterest, interest]
        })
        )
    }

    // for contact info ---------------------------------------->\
    const availability = ["Yes", "No"];
    const toggleAvailability = (value) => {
        setUserData((prev) => ({
            ...prev,
            availability: prev.availability === value ? "" : value
        }))
    }
    // for navigating to the next page ------------------>
    const navigate = useNavigate();
    const routeHomePage = async () => {
        const uid = auth.currentUser.uid;

        await updateDoc(doc(dataBase, "users", uid), {
            ...userData,
            profileCompleted: true,
        });
        navigate("/home", {replace : true})
    }
    //  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    return (
        <main>
            <div className="complete--page--p">
                <h2 className="page--heading">Create Your Profile</h2>
                <p>Join the community and find your perfect team</p>

                <div className="boxes">
                    <div className="box">
                        <div className={`circle ${step === 1 ? "onStep" : ""}  ${step > 1 ? "passedStep" : ""}`}><span>{step < 2 ? "1" : "✔"}</span></div>
                        <h4>Personal Info</h4>
                        <p className="render">Tell us about yourself</p>
                    </div>
                    <div className="box">
                        <div className={`circle ${step === 2 ? "onStep" : ""}  ${step > 2 ? "passedStep" : ""}`}><span>{step < 3 ? "2" : "✔"}</span></div>
                        <h4>Skills</h4>
                        <p className="render">what are you good at ?</p>
                    </div>
                    <div className="box">
                        <div className={`circle ${step === 3 ? "onStep" : ""}  ${step > 3 ? "passedStep" : ""}`}><span>{step < 4 ? "3" : "✔"}</span></div>
                        <h4>Interests</h4>
                        <p className="render">What drives you ?</p>
                    </div>
                    <div className="box">
                        <div className={`circle ${step === 4 ? "onStep" : ""}  ${step > 4 ? "passedStep" : ""}`}><span>{step < 5 ? "4" : "✔"}</span></div>
                        <h4>Contact Info</h4>
                        <p className="render">How can we reach you ?</p>
                    </div>
                    <div className="box">
                        <div className={`circle ${step === 5 ? "onStep" : ""}`}>5</div>
                        <h4>Review</h4>
                        <p className="render">Almost done</p>
                    </div>
                </div>

                {step === 1 && <div className="info--section--p">
                    <h3 class="head-tag">Personal Info</h3>
                    <p class="tag">Lets start with the basics</p>
                    <h5 className="name--heading">Full Name <span className="required">*</span></h5>
                    <input
                        type="text"
                        className="full--name"
                        placeholder="Enter your full name"
                        value={userData.value}
                        onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    />
                    <h5 className="email--heading">NITP Email <span className="required">*</span></h5>
                    <input
                        type="text"
                        className="email--input"
                        placeholder="nitp email id"
                        value={userData.value}
                        onChange={(e) => setUserData({ ...userData, nitpemail: e.target.value })}
                    />
                    <h5 className="college--input">University <span className="required">*</span></h5>
                    <select
                        className='options--college'
                        value={userData.college}
                        onChange={(e) => setUserData({ ...userData, college: e.target.value })
                        }>
                        <option value="" disabled>Select Your College</option>
                        <option value="NITP" className='college-selection'>national Institute of Technology Patna</option>
                    </select>
                    <h5 className="year--heading">Year <span className="required">*</span></h5>
                    <select className="options--year" value={userData.year} onChange={(e) =>
                        setUserData({ ...userData, year: e.target.value })
                    }>
                        <option value="" disabled>Select Current Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                    <h5 className="branch--heading">Major/Field of Study <span className="required">*</span></h5>
                    <select className='options--branch' value={userData.branch} onChange={(e) =>
                        setUserData({ ...userData, branch: e.target.value })
                    }>
                        <option value="" disabled>Select Your Branch</option>
                        <option value="CSE">Computer Science</option>
                        <option value="ECE">Electronics and Communication</option>
                        <option value="MNC">Mathematics and Computing</option>
                    </select>
                    <h5 className="bio--heading">Bio </h5>
                    <input
                        type="text"
                        className="bio--input"
                        placeholder="Tell us a bit about yourself... (optional)"
                        value={userData.value}
                        onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                    />
                    <button
                        id="prev"
                        className={`previous ${step === 1 ? "disabled" : ""}`}
                        onClick={prevStep}
                        disabled={step === 1}
                    >
                        Previous</button>
                    <button
                        id="nextt"
                        className={`next ${step === 4 ? "preview-active" : ""} ${(!userData.fullName || userData.nitpemail === "" || userData.college === "" || userData.year === "" || userData.branch === "") ? "disabled" : ""}`}
                        onClick={step === 4 ? Preview : nextStep}
                        disabled={!userData.fullName || userData.nitpemail === "" || userData.college === "" || userData.year === "" || userData.branch === ""}
                    >
                        {step === 4 ? "Preview" : "next"}
                    </button>
                </div>
                }

                {step === 2 && <div className="skills--info--p">
                    <h3 class="head-tag skills">Your Skills</h3>
                    <p class="tag skills">Let others discover what you bring to a team</p>
                    <h4 className="technical--heading">Technical Skills <span className="required">*</span></h4>
                    <p className="tag">Add skills you can Confidently contribute</p>
                    {
                        techSkills.map((skill) => (
                            <button
                                key={skill}
                                className={`suggestion ${userData.technicalSkills.includes(skill) ? "suggestion--clicked" : ""}`}
                                onClick={() => toggleTechSkills(skill)}
                            >
                                {skill}
                            </button>
                        ))
                    }
                    <div className="skill--input--area">
                        <input
                            type="text"
                            className="skill--input"
                            placeholder="Add custom Technical skills ..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();

                                    const skill = skillInput.trim();
                                    if (!skill) return;

                                    toggleTechSkills(skill)
                                    setSkillInput("");
                                }
                            }}
                        />
                        <button className="add--skill" onClick={() => toggleTechSkills(skillInput)}>Add</button>
                    </div>
                    <div className="skill-choosen">
                        {userData.technicalSkills.map((skill) => (
                            <span
                                key={skill}
                                className="skills"
                                onClick={() => toggleTechSkills(skill)}
                            >
                                {skill} ✕
                            </span>
                        ))}
                    </div>
                    <h4 className="technical--heading">Soft Skills <span className="required">*</span></h4>
                    <p className="tag">Talent that you have</p>
                    {
                        softSkills.map((skill) => (
                            <button
                                key={skill}
                                className={`suggestion--softskill ${userData.softSkills.includes(skill) ? "suggestion--clicked" : ""}`}
                                onClick={() => toggleSoftSklls(skill)}
                            >
                                {skill} ✕
                            </button>
                        ))
                    }
                    <div className="softSkill--input--area">
                        <input
                            type="text"
                            className="softSkill--input"
                            placeholder="Add custom Soft skills ..."
                            value={softSkillInput}
                            onChange={(e) => setSoftSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();

                                    const skill = softSkillInput.trim();
                                    if (!skill) return;

                                    toggleSoftSklls(skill)
                                    setSoftSkillInput("");
                                }
                            }}
                        />
                        <button className="add--skill" onClick={() => toggleSoftSklls(softSkillInput)}>Add</button>
                    </div>
                    <div className="skill-choosen">
                        {
                            userData.softSkills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="skills"
                                    onClick={() => toggleSoftSklls(skill)}
                                >
                                    {skill} ✕
                                </span>
                            ))}
                    </div>
                    <h4 className="technical--heading">Experience Level <span className="required">*</span></h4>
                    <div className="exp--boxes">
                        {
                            experience.map((exp) => (
                                <button
                                    key={exp}
                                    className={`exp--box ${userData.experience.includes(exp) ? "clicked--exp" : ""}`}
                                    onClick={() => toggleExperience(exp)}
                                >
                                    {exp}
                                </button>
                            ))
                        }
                    </div>
                    <div className="btns--change">
                        <button
                            id="prev2"
                            className='previous'
                            onClick={prevStep}
                            disabled={step === 1}
                        >
                            Previous</button>
                        <button
                            id="next2"
                            className={`next ${step === 4 ? "preview-active" : ""} ${(userData.technicalSkills.length === 0 || userData.softSkills.length === 0 || userData.experience === "") ? "disabled" : ""}
                          >`}
                            onClick={step === 4 ? Preview : nextStep}
                            disabled={userData.technicalSkills.length === 0 || userData.softSkills.length === 0 || userData.experience === ""}
                        >
                            {step === 4 ? "Preview" : "next"}</button>
                    </div>
                </div>
                }

                {step === 3 && <div className="interest--info--p">
                    <h3 className="head-tag">Your Interest</h3>
                    <p class="tag skills">Let others discover what you bring to a team</p>
                    <h4 className="technical--heading">Project Types you are interested in <span className="required">*</span></h4>
                    <div className="interest--boxes">
                        {
                            mainInterest.map((interest) => (
                                <button
                                    key={interest}
                                    className={`box--interest ${userData.interests.includes(interest) ? "interest--choosen" : ""}`}
                                    onClick={() => toggleMainInterest(interest)}
                                >
                                    {interest}
                                </button>
                            ))
                        }
                    </div>
                    <h4 id="tech--head" className="technical--heading">General Interests <span className="required">*</span></h4>
                    <p class="tag skills">What else are you passionate about ?</p>
                    <div className="general--interest--boxes">
                        {
                            interests.map((interest) => (
                                <button
                                    key={interest}
                                    className={`general--interest ${userData.generalInterest.includes(interest) ? "gen--interest--choosen" : ""}`}
                                    onClick={() => toggleGeneralInterest(interest)}
                                >
                                    {interest}
                                </button>
                            ))
                        }
                    </div>
                    <div className="btns--change">
                        <button
                            id="prev3"
                            className='previous'
                            onClick={prevStep}
                            disabled={step === 1} >Previous</button>
                        <button
                            id="next3"
                            className={`next ${step === 4 ? "preview-active" : ""} ${(userData.interests.length === 0 || userData.generalInterest.length === 0) ? "disabled" : ""}`}
                            onClick={step === 4 ? Preview : nextStep}
                            disabled={userData.interests.length === 0 || userData.generalInterest.length === 0}
                        >
                            {step === 4 ? "Preview" : "next"}
                        </button>
                    </div>
                </div>
                }

                {step === 4 && <div className="contact--info--p">
                    <h3 className="head-tag">Contact Info</h3>
                    <p class="tag skills">How can we reach you out ?</p>
                    <h4 className="technical--heading">Roll number <span className="required">*</span></h4>
                    <input
                        type="number"
                        placeholder="Enter Roll Number"
                        className="contact--input"
                        value={userData.value}
                        onChange={(e) => setUserData({ ...userData, roll: e.currentTarget.value })}
                    />
                    <h4 className="technical--heading"> Active Email Id<span className="required">*</span></h4>
                    <input
                        type="text"
                        placeholder="Enter Personal Email Id"
                        className="contact--input"
                        value={userData.value}
                        onChange={(e) => setUserData({ ...userData, pemail: e.target.value })}
                    />
                    <h4 className="technical--heading"> Active Phone Number<span className="required">*</span></h4>
                    <input
                        type="number"
                        placeholder="Enter Active Phone Number"
                        className="contact--input"
                        value={userData.value}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    />
                    <h4 className="availability--heading">Availability <span className="required">*</span></h4>
                    <p id="later--option" className="tag skills">You can change that later too</p>
                    <div className="available">
                        {
                            availability.map((value) => (
                                <button
                                    key={value}
                                    className={`avail ${userData.availability.includes(value) ? "avail--choosen" : ""}`}
                                    onClick={() => toggleAvailability(value)}
                                >
                                    {value}
                                </button>
                            ))
                        }
                    </div>
                    <div className="last--buttons">
                        <button
                            id="prev4"
                            className='previous'
                            onClick={prevStep}
                        >
                            previous</button>
                        <button
                            id="preview"
                            className={`next ${(userData.roll === "" || userData.pemail === "" || userData.phone === "" || userData.availability === "") ? "disabled" : "preview--active"}`}
                            onClick={nextStep}
                            disabled={userData.roll === "" || userData.pemail === "" || userData.phone === "" || userData.availability === ""}
                        >
                            Preview</button>
                    </div>
                </div>
                }

                {step === 5 && <div className="preview--page--p">
                    <svg
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        className="completion-icon"
                    >
                        <circle
                            cx="32"
                            cy="32"
                            r="26"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                        <path
                            d="M22 33 L29 40 L44 24"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <h3 className="head-tag">Review Your Profile</h3>
                    <p className="tag skills">Make sure everything looks good before submitting</p>
                    <div className="section section--1">
                        <h3 className="head-tag section--info">Personal Information</h3>
                        <p><strong>Name: </strong><span className="print--text">{userData.fullName}</span></p>
                        <p><strong>NITP-Email: </strong><span className="print--text">{userData.nitpemail}</span></p>
                        <p><strong>College: </strong><span className="print--text">{userData.college}</span></p>
                        <p><strong>Major/Field: </strong><span className="print--text">{userData.branch}</span></p>
                        <p><strong>Year: </strong><span className="print--text">{userData.year}</span></p>
                    </div>
                    <div className="section section--2">
                        <h3 className="head-tag section--info">Skills & Experience</h3>
                        <p><strong>Technical Skills: </strong></p> 
                        <ul className="techSkill--setup">
                            {
                                userData.technicalSkills.map((skill) => (
                                    <li
                                    key={skill}
                                    className="added--techSkill"
                                    >
                                        {skill}
                                    </li>
                                ))
                            }
                        </ul>
                        <p><strong>Soft Skills: </strong></p>
                        <ul className="softSkill--setup">
                            {
                                userData.softSkills.map((skill) => (
                                    <li
                                    key={skill}
                                    className="added--softSkill"
                                    >
                                        {skill}
                                    </li>
                                ))
                            }
                        </ul>
                        <p><strong>Experience: </strong><span className="print--text added--exp">{userData.experience}</span></p>
                    </div>
                    <div className="section section--3">
                        <h3 className="head-tag section--info">Interests</h3>
                        <p><strong>Project Types: </strong></p> 
                        <ul className="interest--setup">
                            {
                                userData.interests.map((interest) => (
                                    <li
                                    key={interest}
                                    className="added--interest"
                                    >
                                        {interest}
                                    </li>
                                ))
                            }
                        </ul>
                        <p><strong>General Interest: </strong></p>
                        <ul className="gen--interest--setup">
                            {
                                userData.generalInterest.map((interest) => (
                                    <li 
                                    key={interest}
                                    className="added--genInterest"
                                    >
                                        {interest}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div className="section section--4">
                        <h3 className="head-tag section--info">Contact Information</h3>
                        <p><strong>Roll Number: </strong><span className="print--text">{userData.roll}</span></p> 
                        <p><strong>Mobile Number: </strong><span className="print--text">{userData.phone}</span></p>
                        <p><strong>Active Email: </strong><span className="print--text">{userData.pemail}</span></p>
                        <p><strong>Availability: </strong><span className="print--text">{userData.availability}</span></p>
                    </div>
                    <div className="final--btns">
                            <button
                                className='previous'
                                onClick={prevStep}
                                 >Edit Profile</button>
                            <button
                                className="next submission"
                                onClick={routeHomePage}
                            >
                                Create profile
                            </button>
                        </div>
                </div>
                }
            </div>
        </main>
    )
}

export default ProfileSetup;