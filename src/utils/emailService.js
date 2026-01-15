import emailjs from "@emailjs/browser";

// EmailJS credentials from environment variables
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID_JOIN = import.meta.env.VITE_EMAILJS_TEMPLATE_JOIN;
const TEMPLATE_ID_INVITE = import.meta.env.VITE_EMAILJS_TEMPLATE_INVITE;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Sends an email to the Team Leader when a user requests to join.
 * 
 * @param {string} leaderEmail - The email of the team leader
 * @param {string} leaderName - Name of the leader
 * @param {object} candidate - { fullName, email, branch, skills }
 * @param {object} team - { teamName, eventName }
 */
export const sendJoinRequestEmail = async (leaderEmail, leaderName, candidate, team) => {
    if (!leaderEmail || !SERVICE_ID || !TEMPLATE_ID_JOIN || !PUBLIC_KEY) {
        console.warn("EmailJS not configured or missing email. Check VITE_EMAILJS_* environment variables.");
        return;
    }

    const templateParams = {
        to_email: leaderEmail,
        to_name: leaderName,
        candidate_name: candidate.fullName,
        candidate_email: candidate.email,
        candidate_branch: candidate.branch,
        candidate_skills: candidate.skills,
        team_name: team.teamName,
        event_name: team.eventName,
        message_link: candidate.notificationLink || "http://localhost:5173/app/profile"
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_JOIN, templateParams, PUBLIC_KEY);
        console.log("Join Request Email sent successfully!");
    } catch (error) {
        console.error("Failed to send join email:", error);
    }
};

/**
 * Sends an email to a User when a Team Leader invites them.
 * 
 * @param {string} candidateEmail - Target user email
 * @param {string} candidateName - Target user name
 * @param {object} leader - { fullName, email }
 * @param {object} team - { teamName, eventName, teamDesc }
 */
export const sendInviteEmail = async (candidateEmail, candidateName, leader, team) => {
    if (!candidateEmail || !SERVICE_ID || !TEMPLATE_ID_INVITE || !PUBLIC_KEY) {
        console.warn("EmailJS not configured or missing email. Check VITE_EMAILJS_* environment variables.");
        return;
    }

    const templateParams = {
        to_email: candidateEmail,
        to_name: candidateName,
        leader_name: leader.fullName,
        leader_email: leader.email,
        team_name: team.teamName,
        event_name: team.eventName,
        team_desc: team.teamDesc,
        message_link: leader.notificationLink || "http://localhost:5173/app/discover"
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_INVITE, templateParams, PUBLIC_KEY);
        console.log("Invite Email sent successfully!");
    } catch (error) {
        console.error("Failed to send invite email:", error);
    }
};
