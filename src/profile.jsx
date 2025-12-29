// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from './AuthContext';

// function Profile () {
//   const { user, logOut } = useAuth();
//   const navigate = useNavigate();
//   const handleLogout = async () => {
//     await logOut();
//     navigate("/login", { replace : true });
//   };


//     // JS part of this Profile page ----->

//     // Setting the forward procedding setup
//     const [step, setStep] = React.useState(1);

//     const nextStep = () => {
//         // processing[step - 1].style.backgroundColor = "blue"
//         if (step < 4) setStep(step + 1);

//     };
//     const prevStep = () => {
//         // processing[step - 2].style.backgroundColor = "white"
//         if (step > 1) setStep(step - 1);
//     };

//     // Checking and Storing the User's data in Firebase-> FireStore

//     const [userData, setUserData] = React.useState({
//         firstName: "",
//         lastName: "",
//         gender: "",
//         roll: "",
//         college: "",
//         course: "",
//         branch: "",
//         year: "",
//         skills: [],
//         interests: [],
//         email: "",
//         phone: "",
//         availability: ""
//     })

//     // Heading up further to the profile preview page

//     function Preview () {
//         console.log("Final UserData is : ", userData);
//         // navigate("/navbar", {replace : true})
//     }


//   return (
//     <main>
//             {/* // page dividing section  */}

//             <div className="propage">

//             <h1>Profile Completion </h1>
//             <div className="completion">
//                 {[2, 3, 4, 5].map(i => (
//                     <div
//                         key={i}
//                         className={`step-completion ${step >= i ? "active" : ""}`}
//                     ></div>
//                 ))}
//             </div>


//             {/* // Personal Information  */}

//             {step === 1 && (
//                 // <BasicIdentity
//                 //     userData={userData}
//                 //     setUserData={setUserData}
//                 // />
//                 <div className="container page">
//             <h2 className='heading'>Step - 1 : Basic Identity</h2>
//             <div className="card1">
//                 <h4 className='fhname'>First Name : </h4>
//                 <input type="text" value={userData.firstName} placeholder='First name here' className='fname' onChange={(e) =>
//                     setUserData({ ...userData, firstName: e.target.value })
//                 }
//                 />
//                 <h4 className='lhname'>Last Name : </h4>
//                 <input type="text" className="lname" placeholder='Last name here' value={userData.lastName} onChange={(e) =>
//                     setUserData({ ...userData, lastName: e.target.value })
//                 } />
//                 <h4 className='gender'>Gender : </h4>
//                 <input type="radio" name="gender" className="male-inp" className='male' value="Male" checked={userData.gender === "Male"} onChange={(e) =>
//                     setUserData({ ...userData, gender: e.target.value })
//                 }></input><h4 className='male' className='Male'>Male</h4>
//                 <input type="radio" name="gender" className="female-inp" className='female' value="Female" checked={userData.gender === "Female"} onChange={(e) =>
//                     setUserData({ ...userData, gender: e.target.value })
//                 } /><h4 className='female' className='Female'>Female</h4>
//                 <input type="radio" name="gender" className="other-inp" className='other' value="Other" checked={userData.gender === "Other"} onChange={(e) =>
//                     setUserData({ ...userData, gender: e.target.value })
//                 } /><h4 className='other' className='Other'>Other</h4>
//                 <h4 className='roll-head'>Roll number : </h4>
//                 <input type="text" inputMode='numeric' pattern='[0-9]' className="roll" placeholder='Enter Roll number ' value={userData.roll} onChange={(e) =>
//                     setUserData({ ...userData, roll: e.target.value })
//                 } />
//             </div>
//         </div>
//             )}


//             {/* // College Information  */}

//             {step === 2 && (
//                 <CollegeInfo
//                     userData={userData}
//                     setUserData={setUserData}
//                 />
//             )}


//             {/* // Interest and Skills Information  */}

//             {step === 3 && (
//                 <InterestSkills
//                     userData={userData}
//                     setUserData={setUserData}
//                 />
//             )}

//             {/* Personal Information  */}

//             {step === 4 && (
//                 <PersonalInfo
//                     userData={userData}
//                     setUserData={setUserData}
//                 />
//             )}

//             </div>

//             {/* Buttons Setup for procedding forward */}

//             <div className="btns">
//                 <button className='previous' onClick={prevStep} disabled={step === 1} >Previous</button>
//                 <button className={`next ${step === 4 ? "preview-active" : ""}`} onClick={step === 4 ? Preview : nextStep} >{step === 4 ? "Preview" : "next"}</button>
//                 {/* {step === 4 && <button className={`next ${isPreviewReady ? "preview-active" : ""}`} onClick={Preview} >Preview</button>} */}
//             </div>

//         </main>
//     // <>
//     //   <h1>Hey I am on profile page welcome {user.email}</h1>
//     //   <button onClick={handleLogout}>Logout</button>
//     // </>
//   )
// }

// export default Profile


import React from "react";
// import './styling.css'

function ProfileSetup() {

    const [step, setStep] = React.useState(1);

    const nextStep = () => {
        if (step < 4) setStep(step + 1);

    };
    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const [userData, setUserData] = React.useState({
        fullName: "",
        gender: "",
        roll: "",
        description: "",
        college: "",
        course: "",
        branch: "",
        year: "",
        skills: [],
        interests: [],
        email: "",
        phone: "",
        availability: ""
    })

    const [skillInput, setSkillInput] = React.useState("");
    const [skills, setSkills] = React.useState([]);

    function addSkills(skill) {
        if (!skill.trim()) return;
        if (skills.includes(skill)) return;

        setSkills([...skills, skill]);

        const selected = userData.skills.includes(skill);

        setUserData({
            ...userData,
            skills: selected ? userData.skills.filter(i => i !== skill) : [...userData.skills, skill]
        })
    }

    return (
        <main>
            <div className="complete--page--p">
                <h2 className="page--heading">Create Your Profile</h2>
                <p>Join the community and find your perfect team</p>

                <div className="boxes">
                    <div className="box">
                        <div className="circle">1</div>
                        <h4>Personal Info</h4>
                        <p>Tell us about yourself</p>
                    </div>
                    <div className="box">
                        <div className="circle">2</div>
                        <h4>Skills</h4>
                        <p>what are you good at ?</p>
                    </div>
                    <div className="box">
                        <div className="circle">3</div>
                        <h4>Interests</h4>
                        <p>What drives you ?</p>
                    </div>
                    <div className="box">
                        <div className="circle">4</div>
                        <h4>Contact Info</h4>
                        <p>How can we reach you ?</p>
                    </div>
                    <div className="box">
                        <div className="circle">5</div>
                        <h4>Review</h4>
                        <p>Almost done</p>
                    </div>
                </div>

                {step === 1 && <div className="info--section--p">
                    <h3 class="head-tag">Personal Info</h3>
                    <p class="tag">Lets start with the basics</p>
                    <h5>Full Name <span className="required">*</span></h5>
                    <input
                        type="text"
                        className="full--name"
                        placeholder="Enter your full name"
                        value={userData.value}
                        onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    />
                    <h5 className="email--heading">Email Address <span className="required">*</span></h5>
                    <input
                        type="text"
                        className="email--input"
                        placeholder="your.email@gmail.com"
                        value={userData.value}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
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
                    <h5>Year <span className="required">*</span></h5>
                    <select className="options--year" value={userData.year} onChange={(e) =>
                        setUserData({ ...userData, year: e.target.value })
                    }>
                        <option value="" disabled>Select Current Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                    <h5>Major/Field of Study <span className="required">*</span></h5>
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
                        onChange={(e) => setUserData({ ...userData, description: e.target.value })}
                    />
                    <button id="prev" className='previous' onClick={prevStep} disabled={step === 1} >Previous</button>
                    <button id="nextt" className={`next ${step === 4 ? "preview-active" : ""}`} onClick={step === 4 ? Preview : nextStep} >{step === 4 ? "Preview" : "next"}</button>
                </div>
                }
                {step === 2 && <div className="skills--info--p">
                    <h3 class="head-tag skills">Your Skills</h3>
                    <p class="tag skills">Let others discover what you bring to a team</p>
                    <h5 className="technical--heading">Technical Skills <span className="required">*</span></h5>
                    <p className="tag">Add skills you can Confidently contribute</p>
                    <button className="suggestion" onClick={() => addSkills("React JS")}>React JS &gt;</button>
                    <button className="suggestion" onClick={() => addSkills("Node.Js")}>Node.js &gt;</button>
                    <button className="suggestion" onClick={() => addSkills("UI/UX Designer")}>UI/UX Designer &gt;</button>
                    <button className="suggestion" onClick={() => addSkills("UI/UX Designer")}>Machine Learning &gt;</button>
                    <button className="suggestion" onClick={() => addSkills("UI/UX Designer")}>Marketing &gt;</button>
                    <button className="suggestion" onClick={() => addSkills("UI/UX Designer")}>Robotics &gt;</button>
                    <div className="skill--input--area">
                        <input
                            type="text"
                            className="skill--input"
                            placeholder="Add custom skill ..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addSkills(skillInput);
                                    setSkillInput("");
                                }
                            }}
                        />
                        <button className="add--skill" >Add</button>
                    </div>
                    <div className="skill-choosen">
                        {skills.map((skill, index) => (
                            <h3 className="skills" key={index}>{skill}</h3>
                        ))}
                    </div>
                </div>

                }

            </div>
        </main>
    )
}

export default ProfileSetup;