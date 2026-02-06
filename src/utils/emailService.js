import emailjs from "@emailjs/browser";

// Initialize EmailJS with your public key
// You'll need to set these in your .env file
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const JOIN_REQUEST_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_JOIN_REQUEST_TEMPLATE_ID;
const INVITE_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_INVITE_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Sends an email to the Team Leader when a user requests to join.
 * Uses EmailJS for client-side email sending
 * 
 * @param {string} leaderEmail - The email of the team leader
 * @param {string} leaderName - Name of the leader
 * @param {object} candidate - { fullName, email, branch, skills }
 * @param {object} team - { teamName, eventName }
 */
export const sendJoinRequestEmail = async (leaderEmail, leaderName, candidate, team) => {
    if (!leaderEmail) {
        console.warn("Missing leader email. Cannot send join request notification.");
        return;
    }

    if (!SERVICE_ID || !JOIN_REQUEST_TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn("EmailJS not configured. Skipping email notification.");
        return;
    }

    try {
        const templateParams = {
            to_email: leaderEmail,
            to_name: leaderName,
            candidate_name: candidate.fullName,
            candidate_email: candidate.email,
            candidate_branch: candidate.branch || "Not specified",
            candidate_skills: Array.isArray(candidate.skills) ? candidate.skills.join(", ") : candidate.skills,
            team_name: team.teamName,
            event_name: team.eventName
        };

        const result = await emailjs.send(
            SERVICE_ID,
            JOIN_REQUEST_TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );


        return result;
    } catch (error) {
        console.error("Failed to send join email:", error);
        // Don't throw - email failures shouldn't block the main action
    }
};

/**
 * Sends an email to a User when a Team Leader invites them.
 * Uses EmailJS for client-side email sending
 * 
 * @param {string} candidateEmail - Target user email
 * @param {string} candidateName - Target user name
 * @param {object} leader - { fullName, email }
 * @param {object} team - { teamName, eventName, teamDesc }
 */
export const sendInviteEmail = async (candidateEmail, candidateName, leader, team) => {
    if (!candidateEmail) {
        console.warn("Missing candidate email. Cannot send invite notification.");
        return;
    }

    if (!SERVICE_ID || !INVITE_TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn("EmailJS not configured. Skipping email notification.");
        return;
    }

    try {
        const templateParams = {
            to_email: candidateEmail,
            to_name: candidateName,
            leader_name: leader.fullName,
            leader_email: leader.email,
            team_name: team.teamName,
            event_name: team.eventName,
            team_description: team.teamDesc || "No description provided"
        };

        const result = await emailjs.send(
            SERVICE_ID,
            INVITE_TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );


        return result;
    } catch (error) {
        console.error("Failed to send invite email:", error);
        // Don't throw - email failures shouldn't block the main action
    }
};
