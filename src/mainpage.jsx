import React from "react";
import "./style.css";
import data from "./eventsData";
import { useContext } from "react";
import { TeamContext } from "./context/TeamContext";
import logo from "./assets/connect.png";
import { doc, getDoc, updateDoc} from "firebase/firestore";
import { auth, dataBase } from "./firebase";

const Mainpage = () => {
  const { teams, addTeam, loadingTeams } = useContext(TeamContext);

  if (loadingTeams) {
    return <h2>Loading Teams....</h2>;
  }

  const [teamData, setTeamData] = React.useState({
    teamName: "",
    teamDesc: "",
    teamSize: "",
    eventName: "",
    skills: [],
    leader: "",
  });

  const [page, setPage] = React.useState(1);

  const handleBrowsing = (val) => {
    if (val === 1) setPage(1);
    if (val === 2) setPage(2);
    if (val === 3) setPage(3);
    if (val === 4) setPage(4);
  };

  const [teamChoice, setTeamChoice] = React.useState(false);
  const handleTeamChoice = (val) => {
    if (val) setTeamChoice(true);
    else if (!val) setTeamChoice(false);
  };

  const [skillInput, setSkillInput] = React.useState("");
  const toggleSkillRequired = (skill) => {
    if (!skill.trim()) return;
    setTeamData((prev) => {
      if (!prev.skills.includes(skill) && prev.skills.length >= 5) return prev;
      return {
        ...prev,
        skills: prev.skills.includes(skill)
          ? prev.skills.filter((i) => i !== skill)
          : [...prev.skills, skill],
      };
    });
    setSkillInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    addTeam({
      ...teamData,
    });

    setTeamData({
      teamName: "",
      teamDesc: "",
      teamSize: "",
      eventName: "",
      skills: [],
      leader: "",
    });

    setTeamChoice(false);
  };
  const [eventSelected, setEventSelected] = React.useState(true);
  const [choosenEvent, setChoosenEvent] = React.useState("");
  const toggleFilterEvent = (event, index) => {
    if (choosenEvent === event) {
      setChoosenEvent("")
      setTeamData((prev) => ({
        ...prev,
        eventName: "",
      }))
    }
    else {
      setChoosenEvent(event);
      setTeamData((prev) => ({
        ...prev,
        eventName: event,
      }));
    }
    setEventSelected(true);
  };

  const filteredTeams = choosenEvent ? teams.filter((team) =>
    team.eventName?.toLowerCase() === choosenEvent.toLowerCase()
  ) : teams;

  const [openJoinModel, setOpenJoinModel] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState(null);

  const [openEditProfile, setOpenEditProfile] = React.useState(false);
  const [editProfileData, setEditProfileData] = React.useState(null);

  const [userProfile, setUserProfile] = React.useState(null); 
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if(!auth.currentUser) return;

      const uid =auth.currentUser.uid;
      const userRef = doc(dataBase, "users", uid);
      const snap = await getDoc(userRef);

      if(snap.exists()) {
        setUserProfile(snap.data());
      }
    };

    fetchUserProfile();
  }, []);

  const userSkills = React.useMemo(() => {
    if(!userProfile) return [];

    return [
      ...(userProfile.technicalSkills || []),
      ...(userProfile.softSkills || []),
    ];
  }, [userProfile])

  const normalizeSkill = (skill) => skill.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const calculateMatchPercentage = (userSkills, teamSkills, userInterests = [], teamEvent = "") => {
    if(!teamSkills || teamSkills.length === 0) return 50;

    let skillScore = 0;
    if(teamSkills?.length) {
      const user = userSkills.map(normalizeSkill);
      const team = teamSkills.map(normalizeSkill);
      skillScore = (team.filter((s) => user.includes(s)).length / team.length) *70;
      }

      let InterestScore = userInterests.some((i) => 
      teamEvent?.toLowerCase().includes(i.toLowerCase())) ? 30 : 0;


    return Math.round(skillScore + InterestScore);
  }

  const forYouTeams = React.useMemo (() => {
    if(!userProfile) return [];

    return teams.map((team) => ({
      ...team,
      matchPercent : calculateMatchPercentage(userSkills, team.skills, userProfile.Interests, team.eventName),
    }))
    .filter(team => team.matchPercent >= 20)
    .sort((a,b) => b.matchPercent - a.matchPercent);
  }, [teams, userSkills, userProfile]);

  const [image, setImage] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(!file) return;

    setImage(URL.createObjectURL(file));
  };

  const [techInput, setTechInput] = React.useState("");
  const [softInput, setSoftInput] = React.useState("");
  const [projectInterest, setProjectInterest] = React.useState("");
  const [generalInterest, setGeneralInterest] = React.useState("");

  const toggleEditSkills = (key, value) => {
    if(!value.trim()) return;
    setEditProfileData(prev => {
      const arr = prev[key] || [];

      return {
        ...prev,
        [key] : arr.includes(value) ? arr.filter(v => v!== value ) : [...arr, value],
      }
    })
  }

  return (
    <div className="mainpage--mp">
      <div className="header--navbar">
        <img src={logo} alt="logo" className="mainlogo" />
        <div className="logo--desc">
          <h2 className="logo--heading">TeamUp</h2>
          <p>Find your perfect team</p>
        </div>
        <button className="notification--navbar">Notification</button>
      </div>
      <div className="search--teams">
        <input
          type="text"
          placeholder="Seach for events and Teams..."
          className="search--tab"
        />
      </div>
      <section className="browsing--section">
        <div className="browsing--options">
          <button
            className={`browse--op ${page === 1 ? "browse--clicked" : ""}`}
            onClick={() => handleBrowsing(1)}
          >
            Events
          </button>
          <button
            className={`browse--op ${page === 2 ? "browse--clicked" : ""}`}
            onClick={() => handleBrowsing(2)}
          >
            Teams
          </button>
          <button
            className={`browse--op ${page === 3 ? "browse--clicked" : ""}`}
            onClick={() => handleBrowsing(3)}
          >
            For You
          </button>
          <button
            className={`browse--op ${page === 4 ? "browse--clicked" : ""}`}
            onClick={() => handleBrowsing(4)}
          >
            Profile
          </button>
        </div>
      </section>
      {page === 1 && (
        <div className="events--section">
          <h1 className="event--heading">Upcoming Events</h1>
          <p className="event--desc">Find events that match your interests</p>
          {eventSelected && (
            <div className="filter--section">
              <div className="filter--area">
                <h3>Filtered Event: </h3>
                <p>{choosenEvent}</p>
              </div>
              {choosenEvent === "" ? (
                ""
              ) : (
                <p>
                  {" "}
                  " Go to <strong>Teams Section</strong> to find available teams
                  for the event "
                </p>
              )}
            </div>
          )}
          <div className="event--cards--section">
            {data.map((card) => (
              <div
                className={`events--card ${choosenEvent === card.eventHeading ? "event--filled" : ""
                  }`}
                onClick={() => toggleFilterEvent(card.eventHeading, card.index)}
              >
                <div className="card--img">
                  <img src={card.imgSrc} alt={card.alt} />
                  <span
                    className={`category--badge ${card.category === "Academic" ? "academic" : ""
                      } ${card.category === "Technical" ? "technical" : ""} ${card.category === "Cultural" ? "cultural" : ""
                      } ${card.category === "Sports" ? "sports" : ""} ${card.category === "E-Commerce" ? "e-commerce" : ""
                      }`}
                  >
                    {card.category}
                  </span>
                </div>
                <div className="event--idea">
                  <h2>{card.eventHeading}</h2>
                  <p className="card--desc">{card.eventDesc}</p>
                  <h4> 📍 Location : {card.eventLocation}</h4>
                  <h4> 📅 Time : {card.eventTime}</h4>
                  <h4> 👥 Team Registered : {card.teamRegistered}</h4>
                  <h4> 🏆 Spots Available : {card.spotsAvailable}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 2 && (
        <div className="teams--section">
          <div className="choosing--team--type">
            <div className="team--browse">
              <button
                className={`team--option ${!teamChoice ? "team--choice" : ""}`}
                onClick={() => handleTeamChoice(false)}
              >
                Browse Teams
              </button>
              <p className="browseteam--desc">All teams looking for members</p>
            </div>
            <div className="team--formation">
              <button
                className={`team--create ${teamChoice ? "team--choice" : ""}`}
                onClick={() => handleTeamChoice(true)}
              >
                Create Team
              </button>
              <p className="createTeam--desc">
                Create your own team for the choosen Event
              </p>
            </div>
          </div>
          <div className="filtered--event">
            <h2>Choosen Event: &nbsp;</h2>
            <p>{choosenEvent}</p>
            {!choosenEvent && (
              <span>
                Please choose an event to filter the teams accordingly
              </span>
            )}
          </div>
          {teamChoice && (
            <div className="create--block">
              <div className="teamName">
                <h2 className="create--heading">
                  Team name:<span className="required">*</span> &nbsp;
                </h2>
                <input
                  type="text"
                  className="input--teamname"
                  placeholder="Enter Team Name"
                  value={teamData.teamName}
                  onChange={(e) =>
                    setTeamData({ ...teamData, teamName: e.target.value })
                  }
                />
              </div>
              <div className="eventName">
                <h2 className="create--heading">
                  Event Name:<span className="required">*</span> &nbsp;{" "}
                </h2>
                <input
                  type="text"
                  className="input--eventname"
                  placeholder="Enter Event Name"
                  value={choosenEvent}
                  readOnly
                />
              </div>
              <div className="teamDescription">
                <h2 className="create--heading">
                  Team Description:<span className="required">*</span> &nbsp;
                </h2>
                <input
                  type="text"
                  className="input--desc"
                  placeholder="Enter Team Description"
                  value={teamData.teamDesc}
                  onChange={(e) =>
                    setTeamData({ ...teamData, teamDesc: e.target.value })
                  }
                />
              </div>
              <div className="teamSize">
                <h2 className="create--heading">
                  Team Size:<span className="required">*</span> &nbsp;
                </h2>
                <select
                  className="input--teamSize"
                  value={teamData.teamSize}
                  onChange={(e) =>
                    setTeamData({ ...teamData, teamSize: e.target.value })
                  }
                >
                  <option value="" selected disabled>
                    Team Size
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div className="teamSkills">
                <h2 className="create--heading">
                  Skills Required:<span className="required">*</span> &nbsp;
                </h2>
                <input
                  type="text"
                  className="input--skills"
                  placeholder="Enter required Valid Skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      const skill = skillInput.trim();
                      if (!skill) return;

                      toggleSkillRequired(skill);
                      setSkillInput("");
                    }
                  }}
                />
                <button
                  className="add--skill"
                  onClick={() => toggleSkillRequired(skillInput)}
                >
                  Add
                </button>
              </div>
              <div className="skills--choosen">
                {teamData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="added--skills"
                    onClick={() => toggleSkillRequired(skill)}
                  >
                    {skill} &nbsp; ✕
                  </span>
                ))}
              </div>
              <div className="teamLeader">
                <h2 className="create--heading">Team Leader: &nbsp;</h2>
                <input
                  type="text"
                  name="leader"
                  className="input--leader"
                  placeholder="Leader Name Here"
                  value={teamData.leader}
                  onChange={(e) => {
                    setTeamData({ ...teamData, leader: e.target.value });
                  }}
                />
              </div>
              <div className="team--submission">
                <button
                  className="team--submit"
                  onClick={handleSubmit}
                  disabled={
                    teamData.teamName === "" ||
                    choosenEvent === "" ||
                    teamData.teamDesc === "" ||
                    teamData.teamSize === "" ||
                    teamData.skills.length === 0
                  }
                >
                  Create Team
                </button>
              </div>
            </div>
          )}
          {!teamChoice && (
            <div className="browse--block">
              {filteredTeams.length === 0 && (
                <div>
                  <h1 className="main--heading">Sorry !!</h1>
                  <h1 className="main--heading">
                    No Teams created for this Event
                  </h1>
                  <h2 className="empty--desc">
                    Either Create a new Team or Choose another Event to discover
                    available teams
                  </h2>
                  <p className="open--browsing">
                    <strong>
                      Check Without choosing any Event to discover all the
                      avilable teams on the platform for every event
                    </strong>
                  </p>
                </div>
              )}

              <div className="card--section">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="team--card">
                    <h3 className="browse---teamName">{team.teamName}</h3>
                    <p className="browse--eventName">{team.eventName}</p>

                    <p className="browse--teamDesc">{team.teamDesc}</p>
                    <p className="browse--teamSize">
                      <strong>Time size :&nbsp;</strong> {team.teamSize}
                    </p>
                    {team.skills.length > 0 && (
                      <div className="skills--list">
                        <p className="browse--skills">Skills Needed : &nbsp;</p>
                        <div className="skill--area">
                          {team.skills.map((skill, index) => (
                            <span key={index} className="skill--selected">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="browse--leader">
                      Team Leader: &nbsp; {team.leader}
                    </p>
                    <button
                      className="browse--Request"
                      onClick={() => {
                        setSelectedTeam(team);
                        setOpenJoinModel(true);
                        document.body.style.overflow = "hidden";
                      }}
                    >
                      <span className="request--icon">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="17" y1="11" x2="23" y2="11" />
                        </svg>
                      </span>
                      Request to join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {page === 3 && (
        <div className="foryou--section">
          <h1 className="section--heading">Recommended for you</h1>
          <p className="section--desc">Teams that match your skills and Interest</p>
          <div className="working--foryou">
            <p className="working--heading"><strong>How matching works</strong></p>
            <p className="working--desc">We analyze your skills, interests, and preferences to find teams that are the best fit for you.</p>
          </div>
          {userSkills.length === 0 ? (
            <p>Loading recommendations... Please wait....</p>
          ) : forYouTeams.length === 0 ? (
          <p>No matching Teams yet . Try improving your Profile</p>
          ) : (
              <div className="card--section">
                {forYouTeams.map((team) => (
                  <div key={team.id} className="foryou--team--card">
                    <div className="match--badge">
                      {team.matchPercent}% Match
                    </div>

                    <h3>{team.teamName}</h3>
                    <p className="event--foryou">{team.eventName}</p>
                    <p>{team.teamDesc}</p>

                    <div className="skill--arena">
                      {team.skills.map((skill, i) => (
                        <span
                        key={i}
                        className={
                          userSkills.map(normalizeSkill).includes(normalizeSkill(skill)) ? "skill--matched" : "skill--selected"
                        }
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p>Team Leader : {team.leader}</p>

                    <button
                    className="browse--request"
                    onClick={() => {
                      setSelectedTeam(team);
                      setOpenJoinModel(true);
                      document.body.style.overflow = "hidden";
                    }}
                    >
                       <span className="request--icon">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="17" y1="11" x2="23" y2="11" />
                        </svg>
                      </span>
                      Request to join
                    </button>
                  </div>
                ))}
              </div>
          )}
        </div>
      )}

      {page === 4 && userProfile && (
          <div className="profile--section">
            <h1 className="section--heading">Your Profile</h1>
            <p className="section--desc">Manage your profile to get a better team recommendations</p>
            <div className="complete--profile">
            <div className="profile--model">
              <div
              className="image--upload"
              onClick={() => fileInputRef.current.click()}
              >
                {image ? (
                  <img src={image} alt="profile-pic" />
                ) : (
                  <span className="upload--plus">+</span>
                )}

                <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                hidden 
                />
            </div>
            <div className="identity--lines">
              <h3>{userProfile.fullName}</h3>
              <p>{userProfile.branch} <strong className="dot">.</strong> {userProfile.year} year</p>
            </div>
            <button
             className="edit--clicked"
             onClick={() => {
              setEditProfileData({...userProfile});
              setOpenEditProfile(true);
              document.body.style.overflow = "hidden"
             }}
             >
              Edit Profile
              </button>
          </div>
            <p className="user--email">{userProfile.pemail}</p>
            <div className="user--skills">
              <p>Technical Skills : </p>
              <div className="tech--arena">
              {
              userProfile.technicalSkills.map((skill) => (
                <span className="skill--box">{skill}</span>
              ))
              }
              </div>
              <p>Soft Skills : </p>
              <div className="soft--arena">
              {
                userProfile.softSkills.map((skill) => (
                  <span className="skill--box">{skill}</span>
                ))
              }
              </div>
            </div>
            <div className="user--interest">
              <p>Project Type Interests : </p>
              <div className="project--arena">
              {
                userProfile.interests.map((interest) => (
                  <span className="interest--box">{interest}</span>
                ))
              }
              </div>
              <p>General Interests : </p>
              <div className="general--arena">
              {
                userProfile.generalInterest.map((interest) => (
                  <span className="interest--box">{interest}</span>
                ))
              }
              </div>
              <p>Availability to join teams</p>
              <div>
                <span className="interest--box">{userProfile.availability}</span>
              </div>
            </div>
          </div>
          </div>
         )
         } 

      {
        openEditProfile && (
          <div
           className="edit--profile--backdrop"
           onClick={() => {
            setOpenEditProfile(false);
            document.body.style.overflow = "auto";
           }}
           >

            <div
            className="edit--profile--modal"
            onClick={(e) => e.stopPropagation()}
            >
              <span
              className="modal--close"
              onClick={() => {
                setOpenEditProfile(false);
                document.body.style.overflow = "auto"
              }}
              >
                ✕
              </span>

              <h2>Edit Profile </h2>
              <div className="select--name">
                <p>Full Name :</p>
              <input
              type="text"
              placeholder="Full Name"
              value={editProfileData.fullName}
              onChange={(e) => 
                setEditProfileData({
                  ...editProfileData, fullName : e.target.value,
                })
              } 
              />
              </div>
              <div className="select--branch">
                <p>branch : </p>
              <select
              value={editProfileData.branch}
              onChange={(e) => 
                setEditProfileData({
                  ...editProfileData, branch: e.target.value,
                })
              }
              >
                <option value="Computer Science Enginnering">Computer Science Enginnering</option>
                <option value="Electronics and Communication Enginnering">Electronics and Communication Enginnering</option>
                <option value="Civil Enginnering">Civil Enginnering</option>
                <option value="Electrical Enginnering">Electrical Enginnering</option>
                <option value="Mechanical Enginnering">Mechanical Enginnering</option>
              </select>
              </div>
              <div className="select--year">
                <p>Year :</p>
              <select 
              value={editProfileData.year}
              onChange={(e) => 
                setEditProfileData({
                  ...editProfileData, year : e.target.value,
                })
              }
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              </div>
              <div className="select--phone">
                <p>Phone Number : </p>
              <input
              type="number"
              placeholder="Enter Active MObile Number" 
              value={editProfileData.phone}
              onChange={(e) => 
                setEditProfileData({
                  ...editProfileData, phone: e.target.value,
                })
              }
              />
              </div>
              <div className="select--email">
                <p>Active Personal Email : </p>
                <input  
                type="email"
                placeholder="Enter Active Email Id"
                value={editProfileData.pemail}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData, pemail : e.target.value,
                  })
                }
                />
              </div>
              <div className="select--skills">
                <p>Technical Skills : </p>
                <input 
                type="text"
                placeholder="Add Technical Skills"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === "Enter") {
                    e.preventDefault();
                    toggleEditSkills("technicalSkills", techInput);
                    setTechInput("");
                  }
                }}
                />

                <div className="edit--skill--arena">
                  {
                    editProfileData.technicalSkills?.map((skill) => (
                      <span
                      key={skill}
                      className="edit--skill--box"
                      onClick={() => toggleEditSkills("technicalSkills", skill)}
                      >
                        {skill} ✕
                      </span>
                    ))
                  }
                </div> 
              </div>

              <div className="select--softSkills">
                <p>Soft Skills :</p>
                <input 
                type="text"
                placeholder="Enter Soft Skills"
                value={softInput}
                onChange={(e) => setSoftInput(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === "Enter") {
                    e.preventDefault();
                    toggleEditSkills("softSkills", softInput);
                    setSoftInput("");
                  }
                }}
                />
                <div className="edit--skill--arena">
                  {
                    editProfileData.softSkills?.map((skill) => (
                      <span
                      key={skill}
                      className="edit--skill--box"
                      onClick={() => toggleEditSkills("softSkills", skill)}
                      >
                        {skill} ✕
                      </span>
                    ))
                  }
                </div>
              </div>

              <div className="select--projectInterest">
                <p>Project type interests : </p>
                <input
                  type="text"
                  placeholder="Enter Project type Interest"
                  value={projectInterest}
                  onChange={(e) => setProjectInterest(e.target.value)}
                  onKeyDown={(e) => {
                  if(e.key === "Enter") {
                    e.preventDefault();
                    toggleEditSkills("interests", projectInterest);
                    setProjectInterest("");
                  }
                }}
                />

                <div className="edit--interest--arena">
                  {
                    editProfileData.interests?.map((interest) => (
                      <span
                      key={interest}
                      className="edit--project--box"
                      onClick={() => toggleEditSkills("interests", interest)}
                      >
                        {interest} ✕
                      </span>
                    ))
                  }
                </div>
              </div>

              <div className="select--generalInterest">
                <p>General Interest :</p>
                <input
                  type="text"
                  placeholder="Enter General Interest"
                  value={generalInterest}
                  onChange={(e) => setGeneralInterest(e.target.value)}
                  onKeyDown={(e) => {
                  if(e.key === "Enter") {
                    e.preventDefault();
                    toggleEditSkills("generalInterest", generalInterest);
                    setGeneralInterest("");
                  }
                }}
                />

                <div className="edit--interest--arena">
                  {
                    editProfileData.generalInterest?.map((interest) => (
                      <span
                      key={interest}
                      className="edit--general--interest"
                      onClick={() => toggleEditSkills("generalInterest", interest)}
                      >
                        {interest} ✕
                      </span>
                    ))
                  }
                </div>
              </div>

              <div className="select--avail">
                <p>Available for joining teams ? </p>
                <label>
                  <input
                   type="radio"
                    name="availability"
                    value="Yes"
                    checked={editProfileData.availability === "Yes"}
                    onChange={(e) => 
                      setEditProfileData({
                        ...editProfileData,
                        availability: e.target.value,
                      })
                    }
                     />
                     <span>Yes</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="availability"
                    value="No"
                    checked={editProfileData.availability === "No"}
                    onChange={(e) => 
                      setEditProfileData({
                        ...editProfileData,
                        availability: e.target.value,
                      })
                    }
                     />
                     <span>No</span>
                </label>
              </div>

              <button
              className="save--profile"
              onClick={async () => {
                const uid = auth.currentUser.uid;
                const userRef = doc(dataBase, "users", uid);

                await updateDoc(userRef, editProfileData);

                setUserProfile(editProfileData);
                setOpenEditProfile(false);
                document.body.style.overflow = "auto";
              }}
              >
                Save Changes
              </button>
          </div>
        
        </div>
      )}


      {
        openJoinModel && (
            <div
              className="join--model--backdrop"
              onClick={() => {
                setOpenJoinModel(false);
                document.body.style.overflow = "auto";
              }}
            >
              <div className="join--model" onClick={(e) => e.stopPropagation()}>
                <span
                  className="join--model--close"
                  onClick={() => {
                    setOpenJoinModel(false);
                    document.body.style.overflow = "auto";
                  }}
                >
                  ✕
                </span>

                <h2>Request to Join</h2>
                <form className="join--form">
                  <textarea placeholder="Why should we select you?" required />
                  <button type="submit">Send request</button>
                </form>
              </div>
            </div>
          )}

         
    </div>
  );
};

export default Mainpage;