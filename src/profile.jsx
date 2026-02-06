import React, { useState } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, dataBase } from "./firebase";

function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const [userData, setUserData] = useState({
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
    categoryInterests: [],
    activities: [],
    experience: "",
    nitpemail: "",
    pemail: "",
    phone: "",
    availability: "",
    // Social links - optional
    githubUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    portfolioUrl: "",
    profileCompleted: true,
  });

  // Technical skills
  const [skillInput, setSkillInput] = useState("");
  const techSkills = [
    "React.js",
    "Node.js",
    "Python",
    "Machine Learning",
    "UI/UX Design",
    "Java",
    "C++",
    "Data Science",
    "Flutter",
    "AWS",
  ];

  const toggleTechSkills = (skill) => {
    if (!skill.trim()) return;
    setUserData((prev) => {
      if (
        !prev.technicalSkills.includes(skill) &&
        prev.technicalSkills.length >= 10
      )
        return prev;
      return {
        ...prev,
        technicalSkills: prev.technicalSkills.includes(skill)
          ? prev.technicalSkills.filter((i) => i !== skill)
          : [...prev.technicalSkills, skill],
      };
    });
    setSkillInput("");
  };

  // Soft Skills
  const [softSkillInput, setSoftSkillInput] = useState("");
  const softSkills = [
    "Leadership",
    "Problem Solving",
    "Critical Thinking",
    "Team Work",
    "Communication",
    "Time Management",
    "Creativity",
    "Adaptability",
  ];

  const toggleSoftSkills = (skill) => {
    if (!skill) return;
    setUserData((prev) => {
      if (!prev.softSkills.includes(skill) && prev.softSkills.length >= 10)
        return prev;
      return {
        ...prev,
        softSkills: prev.softSkills.includes(skill)
          ? prev.softSkills.filter((i) => i !== skill)
          : [...prev.softSkills, skill],
      };
    });
    setSoftSkillInput("");
  };

  // Experience level
  const experience = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const toggleExperience = (level) => {
    setUserData((prev) => ({
      ...prev,
      experience: prev.experience === level ? "" : level,
    }));
  };

  // Project interests
  const mainInterest = [
    "Web Development",
    "Data Science",
    "AI / ML",
    "Game Development",
    "Social Impact",
    "App Development",
    "E-Commerce",
    "Sports Tech",
    "Health Tech",
    "IoT",
    "Blockchain",
    "Cybersecurity",
  ];

  const toggleMainInterest = (interest) => {
    setUserData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // General interests
  const interests = [
    "Startups",
    "Research",
    "Open Source",
    "Competitions",
    "Hackathons",
    "Freelancing",
    "Learning New Tech",
    "Content Creation",
  ];

  const toggleGeneralInterest = (interest) => {
    setUserData((prev) => ({
      ...prev,
      generalInterest: prev.generalInterest.includes(interest)
        ? prev.generalInterest.filter((i) => i !== interest)
        : [...prev.generalInterest, interest],
    }));
  };

  // Event Category Interests (Research, Hackathon, Startup removed - skills already collected)
  const eventCategories = [
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "esports", name: "Esports", icon: "🎮" },
    { id: "cultural", name: "Cultural", icon: "🎭" },
  ];

  const toggleCategoryInterest = (category) => {
    setUserData((prev) => ({
      ...prev,
      categoryInterests: prev.categoryInterests.includes(category)
        ? prev.categoryInterests.filter((c) => c !== category)
        : [...prev.categoryInterests, category],
    }));
  };

  // Activities & Hobbies - Separated by category
  const [activityInput, setActivityInput] = useState("");
  const sportsActivities = ["Football", "Cricket", "Basketball", "Badminton", "Table Tennis", "Athletics", "Chess", "Volleyball", "Tennis", "Swimming"];
  const esportsActivities = ["Valorant", "BGMI", "FIFA", "COD", "Free Fire", "CS2", "Minecraft", "League of Legends", "Dota 2", "Rocket League"];
  const culturalActivities = ["Dance", "Music", "Singing", "Drama", "Art", "Photography", "Content Creation", "Poetry", "Writing", "Painting"];

  // Get activities based on selected categories


  const toggleActivity = (activity) => {
    if (!activity.trim()) return;
    setUserData((prev) => {
      if (!prev.activities.includes(activity) && prev.activities.length >= 10)
        return prev;
      return {
        ...prev,
        activities: prev.activities.includes(activity)
          ? prev.activities.filter((a) => a !== activity)
          : [...prev.activities, activity],
      };
    });
    setActivityInput("");
  };

  // Availability
  const availability = ["Yes", "No"];
  const toggleAvailability = (value) => {
    setUserData((prev) => ({
      ...prev,
      availability: prev.availability === value ? "" : value,
    }));
  };

  // Navigation
  const navigate = useNavigate();

  const routeHomePage = async () => {
    if (!auth.currentUser) return;

    setIsSubmitting(true);
    try {
      const uid = auth.currentUser.uid;
      await setDoc(doc(dataBase, "users", uid), {
        ...userData,
        email: auth.currentUser.email, // Required by Firestore rules
        profileCompleted: true,
      }, { merge: true });
      navigate("/app/events", { replace: true });
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation helpers
  const isStep1Valid =
    userData.fullName.trim() &&
    userData.nitpemail.trim().toLowerCase().endsWith("@nitp.ac.in") &&
    userData.college &&
    userData.year &&
    userData.branch;

  const isStep2Valid =
    userData.technicalSkills.length > 0 &&
    userData.softSkills.length > 0 &&
    userData.experience;

  const isStep3Valid =
    userData.interests.length > 0 && userData.generalInterest.length > 0 && userData.categoryInterests.length > 0;

  const isStep4Valid =
    userData.roll.trim() &&
    userData.pemail.trim() &&
    userData.phone.trim() &&
    userData.availability;

  return (
    <main>
      <div className="complete--page--p">
        <h2 className="page--heading">Create Your Profile</h2>
        <p>Join the community and find your perfect team</p>

        {/* Progress Steps */}
        <div className="boxes">
          <div className="box">
            <div
              className={`circle ${step === 1 ? "onStep" : ""} ${step > 1 ? "passedStep" : ""
                }`}
            >
              <span>{step < 2 ? "1" : "✔"}</span>
            </div>
            <h4>Personal Info</h4>
            <p className="render">Tell us about yourself</p>
          </div>
          <div className="box">
            <div
              className={`circle ${step === 2 ? "onStep" : ""} ${step > 2 ? "passedStep" : ""
                }`}
            >
              <span>{step < 3 ? "2" : "✔"}</span>
            </div>
            <h4>Skills</h4>
            <p className="render">What are you good at?</p>
          </div>
          <div className="box">
            <div
              className={`circle ${step === 3 ? "onStep" : ""} ${step > 3 ? "passedStep" : ""
                }`}
            >
              <span>{step < 4 ? "3" : "✔"}</span>
            </div>
            <h4>Interests</h4>
            <p className="render">What drives you?</p>
          </div>
          <div className="box">
            <div
              className={`circle ${step === 4 ? "onStep" : ""} ${step > 4 ? "passedStep" : ""
                }`}
            >
              <span>{step < 5 ? "4" : "✔"}</span>
            </div>
            <h4>Contact Info</h4>
            <p className="render">How can we reach you?</p>
          </div>
          <div className="box">
            <div className={`circle ${step === 5 ? "onStep" : ""}`}>5</div>
            <h4>Review</h4>
            <p className="render">Almost done!</p>
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="info--section--p">
            <h3 className="head-tag">Personal Information</h3>
            <p className="tag">Let's start with the basics</p>

            <h5 className="name--heading">
              Full Name <span className="required">*</span>
            </h5>
            <input
              type="text"
              className="full--name"
              placeholder="Enter your full name"
              value={userData.fullName}
              onChange={(e) =>
                setUserData({ ...userData, fullName: e.target.value })
              }
            />

            <h5 className="email--heading">
              NITP Email <span className="required">*</span>
            </h5>
            <input
              type="email"
              className="email--input"
              placeholder="your.email@nitp.ac.in"
              value={userData.nitpemail}
              onChange={(e) =>
                setUserData({ ...userData, nitpemail: e.target.value })
              }
            />
            {!userData.nitpemail.endsWith("@nitp.ac.in") && userData.nitpemail.length > 0 && (
              <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>Email must end with @nitp.ac.in</p>
            )}

            <h5 className="college--input">
              University <span className="required">*</span>
            </h5>
            <select
              className="options--college"
              value={userData.college}
              onChange={(e) =>
                setUserData({ ...userData, college: e.target.value })
              }
            >
              <option value="" disabled>
                Select your college
              </option>
              <option value="NIT Patna">
                National Institute of Technology Patna
              </option>
            </select>

            <h5 className="year--heading">
              Year <span className="required">*</span>
            </h5>
            <select
              className="options--year"
              value={userData.year}
              onChange={(e) =>
                setUserData({ ...userData, year: e.target.value })
              }
            >
              <option value="" disabled>
                Select your current year
              </option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>

            <h5 className="branch--heading">
              Branch/Major <span className="required">*</span>
            </h5>
            <select
              className="options--branch"
              value={userData.branch}
              onChange={(e) =>
                setUserData({ ...userData, branch: e.target.value })
              }
            >
              <option value="" disabled>
                Select your branch
              </option>
              <option value="CSE">Computer Science & Engineering</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="EE">Electrical Engineering</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CE">Civil Engineering</option>
              <option value="MNC">Mathematics & Computing</option>
              <option value="Architecture">Architecture</option>
            </select>

            <h5 className="bio--heading">Bio (Optional)</h5>
            <input
              type="text"
              className="bio--input"
              placeholder="Tell us a bit about yourself..."
              value={userData.bio}
              onChange={(e) =>
                setUserData({ ...userData, bio: e.target.value })
              }
            />

            <div className="btns--change">
              <button className="previous disabled" disabled>
                Previous
              </button>
              <button
                className={`next ${!isStep1Valid ? "disabled" : ""}`}
                onClick={nextStep}
                disabled={!isStep1Valid}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="skills--info--p">
            <h3 className="head-tag skills">Your Skills</h3>
            <p className="tag skills">
              Let others discover what you bring to a team
            </p>

            <h4 className="technical--heading">
              Technical Skills <span className="required">*</span>
            </h4>
            <p className="tag">Select or add skills you can confidently contribute</p>

            <div style={{ marginBottom: "1rem" }}>
              <button
                className={`suggestion ${userData.technicalSkills.includes("None")
                  ? "suggestion--clicked"
                  : ""
                  }`}
                onClick={() => {
                  setUserData(prev => ({
                    ...prev,
                    technicalSkills: prev.technicalSkills.includes("None")
                      ? prev.technicalSkills.filter(s => s !== "None")
                      : ["None"]
                  }));
                }}
                style={{ marginRight: '0.5rem' }}
              >
                None
              </button>
              {techSkills.map((skill) => (
                <button
                  key={skill}
                  className={`suggestion ${userData.technicalSkills.includes(skill)
                    ? "suggestion--clicked"
                    : ""
                    }`}
                  onClick={() => toggleTechSkills(skill)}
                  disabled={userData.technicalSkills.includes("None")}
                  style={{ opacity: userData.technicalSkills.includes("None") ? 0.5 : 1 }}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="skill--input--area">
              <input
                type="text"
                className="skill--input"
                placeholder="Add custom skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    toggleTechSkills(skillInput.trim());
                  }
                }}
              />
              <button
                className="add--skill"
                onClick={() => toggleTechSkills(skillInput.trim())}
              >
                Add
              </button>
            </div>

            {userData.technicalSkills.length > 0 && (
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
            )}

            <h4 className="technical--heading" style={{ marginTop: "2rem" }}>
              Soft Skills <span className="required">*</span>
            </h4>
            <p className="tag">Select your interpersonal strengths</p>

            <div style={{ marginBottom: "1rem" }}>
              <button
                className={`suggestion ${userData.softSkills.includes("None")
                  ? "suggestion--clicked"
                  : ""
                  }`}
                onClick={() => {
                  setUserData(prev => ({
                    ...prev,
                    softSkills: prev.softSkills.includes("None")
                      ? prev.softSkills.filter(s => s !== "None")
                      : ["None"]
                  }));
                }}
                style={{ marginRight: '0.5rem' }}
              >
                None
              </button>
              {softSkills.map((skill) => (
                <button
                  key={skill}
                  className={`suggestion ${userData.softSkills.includes(skill)
                    ? "suggestion--clicked"
                    : ""
                    }`}
                  onClick={() => toggleSoftSkills(skill)}
                  disabled={userData.softSkills.includes("None")}
                  style={{ opacity: userData.softSkills.includes("None") ? 0.5 : 1 }}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="softSkill--input--area">
              <input
                type="text"
                className="softSkill--input"
                placeholder="Add custom soft skill..."
                value={softSkillInput}
                onChange={(e) => setSoftSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    toggleSoftSkills(softSkillInput.trim());
                  }
                }}
              />
              <button
                className="add--skill"
                onClick={() => toggleSoftSkills(softSkillInput.trim())}
              >
                Add
              </button>
            </div>

            {userData.softSkills.length > 0 && (
              <div className="skill-choosen">
                {userData.softSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="skills"
                    onClick={() => toggleSoftSkills(skill)}
                  >
                    {skill} ✕
                  </span>
                ))}
              </div>
            )}

            <h4 className="technical--heading" style={{ marginTop: "2rem" }}>
              Experience Level <span className="required">*</span>
            </h4>
            <div className="exp--boxes">
              {experience.map((exp) => (
                <button
                  key={exp}
                  className={`exp--box ${userData.experience === exp ? "clicked--exp" : ""
                    }`}
                  onClick={() => toggleExperience(exp)}
                >
                  {exp}
                </button>
              ))}
            </div>

            <div className="btns--change">
              <button className="previous" onClick={prevStep}>
                Previous
              </button>
              <button
                className={`next ${!isStep2Valid ? "disabled" : ""}`}
                onClick={nextStep}
                disabled={!isStep2Valid}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="interest--info--p">
            <h3 className="head-tag">Your Interests</h3>
            <p className="tag skills">
              Help us match you with the right teams and projects
            </p>

            <h4 className="technical--heading">
              Project Types <span className="required">*</span>
            </h4>
            <p className="tag">What kind of projects excite you?</p>

            <div className="interest--boxes">
              <button
                className={`box--interest ${userData.interests.includes("None")
                  ? "interest--choosen"
                  : ""
                  }`}
                onClick={() => {
                  setUserData(prev => ({
                    ...prev,
                    interests: prev.interests.includes("None")
                      ? prev.interests.filter(i => i !== "None")
                      : ["None"]
                  }));
                }}
                style={{ marginRight: '0.5rem' }}
              >
                None
              </button>
              {mainInterest.map((interest) => (
                <button
                  key={interest}
                  className={`box--interest ${userData.interests.includes(interest)
                    ? "interest--choosen"
                    : ""
                    }`}
                  onClick={() => toggleMainInterest(interest)}
                  disabled={userData.interests.includes("None")}
                  style={{ opacity: userData.interests.includes("None") ? 0.5 : 1 }}
                >
                  {interest}
                </button>
              ))}
            </div>

            <h4
              id="tech--head"
              className="technical--heading"
              style={{ marginTop: "2rem" }}
            >
              General Interests <span className="required">*</span>
            </h4>
            <p className="tag skills">What else are you passionate about?</p>

            <div className="general--interest--boxes">
              <button
                className={`general--interest ${userData.generalInterest.includes("None")
                  ? "gen--interest--choosen"
                  : ""
                  }`}
                onClick={() => {
                  setUserData(prev => ({
                    ...prev,
                    generalInterest: prev.generalInterest.includes("None")
                      ? prev.generalInterest.filter(i => i !== "None")
                      : ["None"]
                  }));
                }}
                style={{ marginRight: '0.5rem' }}
              >
                None
              </button>
              {interests.map((interest) => (
                <button
                  key={interest}
                  className={`general--interest ${userData.generalInterest.includes(interest)
                    ? "gen--interest--choosen"
                    : ""
                    }`}
                  onClick={() => toggleGeneralInterest(interest)}
                  disabled={userData.generalInterest.includes("None")}
                  style={{ opacity: userData.generalInterest.includes("None") ? 0.5 : 1 }}
                >
                  {interest}
                </button>
              ))}
            </div>

            <h4
              className="technical--heading"
              style={{ marginTop: "2rem" }}
            >
              Event Categories <span className="required">*</span>
            </h4>
            <p className="tag skills">What types of events do you want to participate in?</p>

            <div className="general--interest--boxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                className={`general--interest ${userData.categoryInterests.includes("None")
                  ? "gen--interest--choosen"
                  : ""
                  }`}
                onClick={() => {
                  setUserData(prev => ({
                    ...prev,
                    categoryInterests: prev.categoryInterests.includes("None")
                      ? prev.categoryInterests.filter(c => c !== "None")
                      : ["None"],
                    activities: [] // Clear activities when None is selected
                  }));
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>🚫</span> None
              </button>
              {eventCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`general--interest ${userData.categoryInterests.includes(cat.name)
                    ? "gen--interest--choosen"
                    : ""
                    }`}
                  onClick={() => toggleCategoryInterest(cat.name)}
                  disabled={userData.categoryInterests.includes("None")}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: userData.categoryInterests.includes("None") ? 0.5 : 1 }}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>

            {(userData.categoryInterests.includes("Sports") ||
              userData.categoryInterests.includes("Esports") ||
              userData.categoryInterests.includes("Cultural")) && (
                <>
                  <h4
                    className="technical--heading"
                    style={{ marginTop: "2rem" }}
                  >
                    Activities & Hobbies
                  </h4>
                  <p className="tag skills">Select activities related to your chosen categories</p>

                  {/* Sports Activities */}
                  {userData.categoryInterests.includes("Sports") && (
                    <div style={{ marginBottom: "1rem" }}>
                      <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚽ Sports</p>
                      {sportsActivities
                        .filter(a => !userData.activities.includes(a))
                        .map((activity) => (
                          <button
                            key={activity}
                            className="suggestion"
                            onClick={() => toggleActivity(activity)}
                          >
                            {activity}
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Esports Activities */}
                  {userData.categoryInterests.includes("Esports") && (
                    <div style={{ marginBottom: "1rem" }}>
                      <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>🎮 Esports</p>
                      {esportsActivities
                        .filter(a => !userData.activities.includes(a))
                        .map((activity) => (
                          <button
                            key={activity}
                            className="suggestion"
                            onClick={() => toggleActivity(activity)}
                          >
                            {activity}
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Cultural Activities */}
                  {userData.categoryInterests.includes("Cultural") && (
                    <div style={{ marginBottom: "1rem" }}>
                      <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>🎭 Cultural</p>
                      {culturalActivities
                        .filter(a => !userData.activities.includes(a))
                        .map((activity) => (
                          <button
                            key={activity}
                            className="suggestion"
                            onClick={() => toggleActivity(activity)}
                          >
                            {activity}
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="skill--input--area">
                    <input
                      type="text"
                      className="skill--input"
                      placeholder="Add custom activity..."
                      value={activityInput}
                      onChange={(e) => setActivityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          toggleActivity(activityInput.trim());
                        }
                      }}
                    />
                    <button
                      className="add--skill"
                      onClick={() => toggleActivity(activityInput.trim())}
                    >
                      Add
                    </button>
                  </div>

                  {userData.activities.length > 0 && (
                    <div className="skill-choosen">
                      {userData.activities.map((activity) => (
                        <span
                          key={activity}
                          className="skills"
                          onClick={() => toggleActivity(activity)}
                        >
                          {activity} ✕
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}


            <div className="btns--change">
              <button className="previous" onClick={prevStep}>
                Previous
              </button>
              <button
                className={`next ${!isStep3Valid ? "disabled" : ""}`}
                onClick={nextStep}
                disabled={!isStep3Valid}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Contact Info */}
        {step === 4 && (
          <div className="contact--info--p">
            <h3 className="head-tag">Contact Information</h3>
            <p className="tag skills">How can teammates reach you?</p>

            <h4 className="technical--heading">
              Roll Number <span className="required">*</span>
            </h4>
            <input
              type="tel"
              placeholder="Enter your roll number"
              className="contact--input"
              value={userData.roll}
              maxLength={7}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 7);
                setUserData({ ...userData, roll: value });
              }}
            />

            <h4 className="technical--heading">
              Personal Email <span className="required">*</span>
            </h4>
            <input
              type="email"
              placeholder="Enter your active email"
              className="contact--input"
              value={userData.pemail}
              onChange={(e) =>
                setUserData({ ...userData, pemail: e.target.value })
              }
            />

            <h4 className="technical--heading">
              Phone Number <span className="required">*</span>
            </h4>
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="contact--input"
              value={userData.phone}
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setUserData({ ...userData, phone: value });
              }}
            />

            <h4 className="availability--heading">
              Available for Teams? <span className="required">*</span>
            </h4>
            <p id="later--option" className="tag skills">
              You can change this later anytime
            </p>

            <div className="available">
              {availability.map((value) => (
                <button
                  key={value}
                  className={`avail ${userData.availability === value ? "avail--choosen" : ""
                    }`}
                  onClick={() => toggleAvailability(value)}
                >
                  {value === "Yes" ? "✓ Yes, I'm available" : "✗ Not right now"}
                </button>
              ))}
            </div>

            {/* Social Links Section */}
            <h4 className="technical--heading" style={{ marginTop: "2rem" }}>
              Social Profiles (Optional)
            </h4>
            <p className="tag skills">Help teammates learn more about you</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: '#24292e',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <input
                  type="url"
                  placeholder="GitHub profile URL (e.g., github.com/username)"
                  className="contact--input"
                  style={{ flex: 1 }}
                  value={userData.githubUrl}
                  onChange={(e) =>
                    setUserData({ ...userData, githubUrl: e.target.value })
                  }
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: '#0077b5',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                <input
                  type="url"
                  placeholder="LinkedIn profile URL"
                  className="contact--input"
                  style={{ flex: 1 }}
                  value={userData.linkedinUrl}
                  onChange={(e) =>
                    setUserData({ ...userData, linkedinUrl: e.target.value })
                  }
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: '#000',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <input
                  type="url"
                  placeholder="X (Twitter) profile URL"
                  className="contact--input"
                  style={{ flex: 1 }}
                  value={userData.twitterUrl}
                  onChange={(e) =>
                    setUserData({ ...userData, twitterUrl: e.target.value })
                  }
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <input
                  type="url"
                  placeholder="Portfolio/Personal website URL"
                  className="contact--input"
                  style={{ flex: 1 }}
                  value={userData.portfolioUrl}
                  onChange={(e) =>
                    setUserData({ ...userData, portfolioUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="last--buttons">
              <button className="previous" onClick={prevStep}>
                Previous
              </button>
              <button
                className={`next ${!isStep4Valid ? "disabled" : ""}`}
                onClick={nextStep}
                disabled={!isStep4Valid}
              >
                Preview
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="preview--page--p">
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
            <p className="tag skills">
              Make sure everything looks good before submitting
            </p>

            <div className="section section--1">
              <h3 className="head-tag section--info">👤 Personal Information</h3>
              <p>
                <strong>Name:</strong>{" "}
                <span className="print--text">{userData.fullName}</span>
              </p>
              <p>
                <strong>NITP Email:</strong>{" "}
                <span className="print--text">{userData.nitpemail}</span>
              </p>
              <p>
                <strong>College:</strong>{" "}
                <span className="print--text">{userData.college}</span>
              </p>
              <p>
                <strong>Branch:</strong>{" "}
                <span className="print--text">{userData.branch}</span>
              </p>
              <p>
                <strong>Year:</strong>{" "}
                <span className="print--text">{userData.year}</span>
              </p>
              {userData.bio && (
                <p>
                  <strong>Bio:</strong>{" "}
                  <span className="print--text">{userData.bio}</span>
                </p>
              )}
            </div>

            <div className="section section--2">
              <h3 className="head-tag section--info">💻 Skills & Experience</h3>
              <p>
                <strong>Technical Skills:</strong>
              </p>
              <ul className="techSkill--setup">
                {userData.technicalSkills.map((skill) => (
                  <li key={skill} className="added--techSkill">
                    {skill}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Soft Skills:</strong>
              </p>
              <ul className="softSkill--setup">
                {userData.softSkills.map((skill) => (
                  <li key={skill} className="added--softSkill">
                    {skill}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Experience:</strong>{" "}
                <span className="print--text added--exp">
                  {userData.experience}
                </span>
              </p>
            </div>

            <div className="section section--3">
              <h3 className="head-tag section--info">🎯 Interests</h3>
              <p>
                <strong>Project Types:</strong>
              </p>
              <ul className="interest--setup">
                {userData.interests.map((interest) => (
                  <li key={interest} className="added--interest">
                    {interest}
                  </li>
                ))}
              </ul>
              <p>
                <strong>General Interests:</strong>
              </p>
              <ul className="gen--interest--setup">
                {userData.generalInterest.map((interest) => (
                  <li key={interest} className="added--genInterest">
                    {interest}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Event Categories:</strong>
              </p>
              <ul className="gen--interest--setup">
                {userData.categoryInterests.map((cat) => (
                  <li key={cat} className="added--genInterest">
                    {cat}
                  </li>
                ))}
              </ul>
              {userData.activities.length > 0 && (
                <>
                  <p>
                    <strong>Activities & Hobbies:</strong>
                  </p>
                  <ul className="gen--interest--setup">
                    {userData.activities.map((activity) => (
                      <li key={activity} className="added--genInterest">
                        {activity}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="section section--4">
              <h3 className="head-tag section--info">📞 Contact Information</h3>
              <p>
                <strong>Roll Number:</strong>{" "}
                <span className="print--text">{userData.roll}</span>
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <span className="print--text">{userData.phone}</span>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <span className="print--text">{userData.pemail}</span>
              </p>
              <p>
                <strong>Availability:</strong>{" "}
                <span
                  className="print--text"
                  style={{
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    background:
                      userData.availability === "Yes" ? "#dcfce7" : "#fee2e2",
                    color:
                      userData.availability === "Yes" ? "#15803d" : "#dc2626",
                  }}
                >
                  {userData.availability === "Yes"
                    ? "Available for teams"
                    : "Not available"}
                </span>
              </p>
            </div>

            <div className="final--btns">
              <button className="previous" onClick={prevStep}>
                ← Edit Profile
              </button>
              <button
                className="next submission"
                onClick={routeHomePage}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Profile →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProfileSetup;
