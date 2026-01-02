import React from "react";
import "./style.css";
import data from "./eventsData";
import { useContext } from "react";
import { TeamContext } from "./context/TeamContext";

const Mainpage = () => {
  const { teams, addTeam } = useContext(TeamContext);

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
      id: Date.now(),
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

  return (
    <div className="mainpage--mp">
      <div className="header--navbar">
        <img
          src="./src/assets/connectU_logo.png"
          alt="logo"
          className="mainlogo"
        />
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
          <div className="event--cards--section">
            {data.map((card) => (
              <div className="events--card">
                <img src={card.imgSrc} alt={card.alt} className="card--img" />
                <div className="event--idea">
                  <h2>{card.eventHeading}</h2>
                  <p className="card--desc">{card.eventDesc}</p>
                  <h4>Location : {card.eventLocation}</h4>
                  <h4>Time : {card.eventTime}</h4>
                  <h4>Team Registered : {card.teamRegistered}</h4>
                  <h4>Spots Available : {card.spotsAvailable}</h4>
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
                className="team--option"
                onClick={() => handleTeamChoice(false)}
              >
                Browse Teams
              </button>
              <p className="browseteam--desc">All teams looking for members</p>
            </div>
            <div className="team--formation">
              <button
                className="team--create"
                onClick={() => handleTeamChoice(true)}
              >
                Create Team
              </button>
              <p className="createTeam--desc">
                Create your own team for the choosen Event
              </p>
            </div>
          </div>
          {teamChoice && (
            <div className="create--block">
              <div className="teamName">
                <h2 className="create--heading">Team name: &nbsp;</h2>
                <input
                  type="text"
                  className="input--teamname"
                  placeholder="Enter Team Name"
                  value={teamData.value}
                  onChange={(e) =>
                    setTeamData({ ...teamData, teamName: e.target.value })
                  }
                />
              </div>
              <div className="eventName">
                <h2 className="create--heading">Event Name: &nbsp; </h2>
                <input
                  type="text"
                  className="input--eventname"
                  placeholder="Enter Event Name"
                  value={teamData.value}
                  onChange={(e) =>
                    setTeamData({ ...teamData, eventName: e.target.value })
                  }
                />
              </div>
              <div className="teamDescription">
                <h2 className="create--heading">Team Description: &nbsp;</h2>
                <input
                  type="text"
                  className="input--desc"
                  placeholder="Enter Team Description"
                  value={teamData.value}
                  onChange={(e) =>
                    setTeamData({ ...teamData, teamDesc: e.target.value })
                  }
                />
              </div>
              <div className="teamSize">
                <h2 className="create--heading">Team Size: &nbsp;</h2>
                <select
                  className="input--teamSize"
                  value={teamData.value}
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
                <h2 className="create--heading">Skills Required: &nbsp;</h2>
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
                  className="input--leader"
                  placeholder="Leader Name Here"
                  value={teamData.value}
                  onClick={(e) => {
                    setTeamData({ ...teamData, leader: e.target.value });
                  }}
                />
              </div>
              <div className="team--submission">
                <button className="team--submit" onClick={handleSubmit}>
                  Create Team
                </button>
              </div>
            </div>
          )}
          {!teamChoice && (
            <div className="browse--block">
              {teams.length === 0 && (
                <div>
                <h1 className="main--heading">Sorry !!</h1>
                  <h1 className="main--heading">No Teams created for this Event</h1>
                  <h2 className="empty--desc">
                    Either make a new Team or Filter another Event to discover
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
                {teams.map((team) => (
                <div key={team.id} className="team--card">
                  <h3 className="browse---teamName">{team.teamName}</h3>
                  <p className="browse--eventName">{team.eventName}</p>

                  <p className="browse--teamDesc">{team.teamDesc}</p>
                  <p className="browse--teamSize">{team.teamSize}</p>
                  <p className="browse--leader">Team Leader: &nbsp; {team.leader}</p>
                  {/* <p>Skills Required : {teams.skills.map((skill) => skill)}</p> */}
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Mainpage;
