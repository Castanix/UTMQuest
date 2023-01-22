import { useQuery } from "react-query";

const fetchUserBadges = async (utorId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/badge/userBadges/${utorId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetBadges = (userId: string) => {

    const result = useQuery('userBadges', () => fetchUserBadges(userId));

    return {
        loadingBadges: result.isLoading,
        errorBadges: result.error,
        badges: {
            unlockedBadges: result.data?.unlockedBadges,
            displayBadges: result.data?.displayBadges,
            longestLoginStreak: result.data?.longestLoginStreak
        }
    };
};

export default GetBadges;