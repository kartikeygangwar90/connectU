import React from "react";
import "./style.css";
import data from "./eventsData";
import { useContext } from "react";
import { TeamContext } from "./context/TeamContext";
import logo from "./assets/connect.png";
import { doc, getDoc} from "firebase/firestore";
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
      teamname: "",
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

  const calculateMatchPercentage = (userSkills, teamSkills) => {
    if(!teamSkills || teamSkills.length === 0) return 0;

    const user = userSkills.map((skill) => skill.toLowerCase());
    const team = teamSkills.map((skill) => skill.toLowerCase());

    const matched = team.filter((skill) => user.includes(skill));
    return Math.round((matched.length / team.length) * 100);
  }

  const forYouTeams = React.useMemo (() => {
    if(!userProfile) return [];

    return teams.map((team) => ({
      ...team,
      matchPercent : calculateMatchPercentage(userSkills, team.skills),
    }))
    .filter(team => team.matchPercent >= 30)
    .sort((a,b) => b.matchPercent - a.matchPercent);
  }, [teams, userSkills, userProfile]);

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
          {openJoinModel && (
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
      )}

      {page === 3 && (
        <div className="foryou--section">
          <h1 className="section--heading">Recommended for you</h1>
          <p className="section--desc">Teams that match your skills and Interest</p>
          <div className="working--foryou">
            <p className="working--heading"><strong>How matching works</strong></p>
            <p className="working--desc">We analyze your skills, interests, and preferences to find teams that are the best fit for you.</p>
          </div>
          {!userProfile ? (
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

                    <h3>{teamName}</h3>
                    <p>{team.eventName}</p>
                    <p>{team.teamDesc}</p>

                    <div className="skill--arena">
                      {team.skills.map((skill, i) => (
                        <span
                        key={i}
                        className={
                          userSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase()) ? "skill--matched" : "skill-selected"
                        }
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <button
                    className="bowse--request"
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
    </div>
  );
};

export default Mainpage;
