import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Hook that provides a function to check if user profile is complete.
 * If profile is incomplete, shows a toast and redirects to profile page.
 * 
 * @returns {{ requireProfile: () => boolean, isProfileComplete: boolean }}
 */
export const useProfileCheck = () => {
    const navigate = useNavigate();
    const context = useOutletContext();
    const profileCompleted = context?.profileCompleted ?? false;

    /**
     * Checks if user profile is complete. If not, shows toast and redirects.
     * @returns {boolean} - true if profile is complete, false otherwise
     */
    const requireProfile = () => {
        if (!profileCompleted) {
            toast.error("Please complete your profile to use this feature", {
                duration: 4000,
                icon: "📝",
            });
            navigate("/profile");
            return false;
        }
        return true;
    };

    return { requireProfile, isProfileComplete: profileCompleted };
};

export default useProfileCheck;
